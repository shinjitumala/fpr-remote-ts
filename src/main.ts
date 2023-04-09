import { WriteStream, createReadStream, createWriteStream } from "fs"
import { createInterface } from "node:readline"
import { Transform, TransformCallback } from "stream"
import { pipeline } from "stream/promises"

const append = async (src_file: string, os: WriteStream, value_map?: Record<string, string>) => {
    const substitute = (input: string, value_map: Record<string, string>) => {
        for (const [k, v] of Object.entries(value_map)) {
            input = input.replaceAll(new RegExp(`\\$\\{${k}\\}`), v)
        }
        return input
    }

    return new Promise<void>(p => {
        const is = createReadStream(src_file)
        if (value_map === undefined) {
            is.pipe(os, { end: false })
            is.on("close", () => { p() })
            return
        }

        const ts = new Transform({
            transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
                this.push(substitute(chunk.toString(), value_map))
                callback()
            }
        })

        pipeline(is, ts)
        ts.pipe(os, { end: false })
        ts.on("close", () => { p() })
    })
}

const main = async () => {
    const args = {
        input_def: "",
        input_api: "",
        output_server: "",
        output_client: "",
    }
    const args_keys = Object.keys(args)
    const argv = process.argv
    const print_usage = () => {
        const arglist = args_keys.map(k => "<" + k + ">").join(" ")
        console.log(`Usage: ${argv[1]} ${arglist}`)
    }
    if (argv.length != (args_keys.length + 2)) {
        print_usage()
        process.exit(1)
    }
    args_keys.forEach((v, i) => { args[v as keyof typeof args] = argv[i + 2] })

    const oss = createWriteStream(args.output_server)
    const osc = createWriteStream(args.output_client)

    const pre_api_client = async () => {
        await append(__dirname + "/../src/snip/client.ts", osc)
        await append(args.input_def, osc)
    }
    const pre_api_server = async () => {
        await append(args.input_def, oss)
        await append(__dirname + "/../src/snip/server.ts", oss)
    }
    await Promise.all([pre_api_client(), pre_api_server()])

    const lines = createInterface({
        input: createReadStream(args.input_api),
        crlfDelay: Infinity,
    })

    const process_api_file = async () => {
        const parse_line = (l: string) => {
            const m = l.match(/var ([^:\s]+): \(([^)]*)\) => (.*)/)
            if (m === null) {
                return
            }
            const name = m[1]
            const args = m[2]
            const args_arr = (() => {
                if (args.length === 0) {
                    return []
                }
                return args.split(", ").map(a => {
                    const m = a.match(/([^:]+): (.+)/)
                    if (m === null) {
                        throw Error(`Error in line: ${l}. Not a match: ${a}`)
                    }
                    return {
                        name: m[1],
                        type: m[2],
                    }
                })
            })()
            const args_obj = "{ " + args_arr.map(a => a.name + ": " + a.name).join(", ") + " }"
            const args_access = args_arr.map(a => "body." + a.name).join(", ")

            const ret = m[3]

            const client_func = `export const ${name} = async (${args}) => {
    return parse_res_as<${ret}>(domain, "${name}", ${args_obj})
}`
            osc.write(client_func + "\n")

            oss.write(
                `srv.post("/${name}", (req, res) => {
    const body = req.body
    const ret = api.${name}(${args_access})
    res.json(ret)
})` + "\n")
        }

        return new Promise<void>(p => {
            lines.on("line", parse_line)
            lines.on("close", () => p())
        })
    }

    const begin_api_tag = "// BEGIN API\n"
    const end_api_tag = "// END API\n"
    osc.write(begin_api_tag)
    oss.write(begin_api_tag)
    await process_api_file()
    osc.write(end_api_tag)
    oss.write(end_api_tag)


}
main()