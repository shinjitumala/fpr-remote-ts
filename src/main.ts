import { WriteStream, createReadStream, createWriteStream } from "fs"
import { createInterface } from "node:readline"
import { Transform, TransformCallback } from "stream"
import { pipeline } from "stream/promises"

const nl = '\n'

class SnippetTransform extends Transform {
    private readonly begin = "// BEGIN"

    private has_begun = false
    private value_map?: Record<string, string>

    constructor(value_map?: Record<string, string>) {
        super()
        this.value_map = value_map
    }
    _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
        const substitute = (input: string, value_map?: Record<string, string>) => {
            if (!value_map) {
                return input
            }

            for (const [k, v] of Object.entries(value_map)) {
                input = input.replace(new RegExp(`__${k}__`, "g"), v)
            }
            return input
        }

        const str = chunk.toString()
        if (this.has_begun) {
            this.push(substitute(str, this.value_map))
            callback()
            return
        }
        const lines = str.split(nl)
        lines.forEach(l => {
            if (this.has_begun) {
                this.push(substitute(l, this.value_map) + nl)
            }
            if (l === this.begin) {
                this.has_begun = true
            }
        })
        callback()
        return
    }
}

const append = async (src_file: string, os: WriteStream, value_map?: Record<string, string>) => {
    return new Promise<void>(p => {
        const is = createReadStream(src_file)
        const ts = new SnippetTransform(value_map)
        pipeline(is, ts)
        ts.pipe(os, { end: false })
        ts.on("finish", p)
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

    await append(args.input_def, osc)
    await append(__dirname + "/../src/snip/client.ts", osc)
    await append(args.input_def, oss)
    await append(__dirname + "/../src/snip/server.ts", oss)

    const lines = createInterface({
        input: createReadStream(args.input_api),
        crlfDelay: Infinity,
    })

    const process_api_file = async () => {
        const parse_line = async (l: string) => {
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

            await append(__dirname + "/../src/snip/client_method.ts", osc, {
                args: args,
                ret: ret,
                name: name,
                args_obj: args_obj
            })
            await append(__dirname + "/../src/snip/server_method.ts", oss, {
                name: name,
                args_access: args_access,
            })

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