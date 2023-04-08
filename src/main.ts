import { createReadStream, createWriteStream } from "fs"
import * as readline from "node:readline"

const argv = process.argv
const print_usage = () => {
    console.log(`Usage: ${argv[1]} <input> <output server> <output client>`)
}
if (argv.length != 5) {
    print_usage()
    process.exit(1)
}
const input_path = argv[2]
const output_srver_path = argv[3]
const output_client_path = argv[4]

const line_begin_types = "// BEGIN TYPES"
const line_end_types = "// END TYPES"
const line_begin_api = "interface API {"
const line_end_api = "} // END API"

const host = "http://127.0.0.1"
const port = 8000
const url = `${host}:${port}`

const lines = readline.createInterface({
    input: createReadStream(input_path),
    crlfDelay: Infinity,
})
const oss = createWriteStream(output_srver_path)
const osc = createWriteStream(output_client_path)
const header = `import * as http from "http"

const host = "${port}"
const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
}
const parse_res_as = <T>(path: string, obj: Object) => {
    return new Promise<T>(p => {
        var buf: Buffer
        const req = http.request(
            \`\${host}/\${path}\`,
            opts,
            (res) => {
                res.on("data", (d) => { buf += d })
                res.on("end", () => { p(JSON.parse(buf.toString()) as T) })
            }
        )
        req.write(JSON.stringify(obj))
        req.end()
    })
}
`

oss.write(header + "\n")

var in_types = false
var in_api = false
lines.on("line", (l) => {
    in_types = in_types && l !== line_end_types
    in_api = in_api && l !== line_end_api

    if (in_types) {
        process_type_line(l)
    }
    if (in_api) {
        process_api_line(l)
    }

    in_types = in_types || l === line_begin_types
    in_api = in_api || l === line_begin_api
})

const process_type_line = (l: string) => {
    oss.write(l + "\n")
    osc.write(l + "\n")
}

const process_api_line = (l: string) => {
    const m = l.match(/([^:\s]+): \(([^)]*)\) => (.*)/)
    if (m === null) {
        throw Error()
    }
    const name = m[1]
    const args = m[2]
    const args_arr = args.split(", ").map(a => {
        const m = a.match(/([^:]+): (.+)/)
        if (m === null) {
            throw Error()
        }
        return {
            name: m[1],
            type: m[2],
        }
    })
    const args_obj = "{ " + args_arr.map(a => a.name + ": " + a.name).join(", ") + " }"
    const ret = m[3]

    const client_func = `
export const ${name} = async (${args}) => {
    return parse_res_as<${ret}>("${name}", ${args_obj})
}
`
    oss.write(client_func)
}