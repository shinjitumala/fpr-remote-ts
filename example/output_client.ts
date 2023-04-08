// BEGIN CLIENT HEADER
import * as http from "http"

const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
}
const parse_res_as = <T>(host: string, path: string, obj: Object) => {
    return new Promise<T>(p => {
        var buf: Buffer
        const req = http.request(
            `${host}/${path}`,
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
// END CLIENT HEADER
// BEGIN DEFS
const host = "http://127.0.0.1"
const port = "8000"
const domain = `${host}:${port}`

export class Cat {

}
// END DEFS
// BEGIN API
export const cat_get_by_id = async (id: number) => {
    return parse_res_as<Cat>(domain, "cat_get_by_id", { id: id })
}
export const cat_search = async (id: number, name: string) => {
    return parse_res_as<Cat[]>(domain, "cat_search", { id: id, name: name })
}
export const cat_get_by_name = async (name: string) => {
    return parse_res_as<Cat>(domain, "cat_get_by_name", { name: name })
}
// END API
