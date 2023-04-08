import * as http from "http"

const host = "8000"
const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
}
const parse_res_as = <T>(path: string, obj: Object) => {
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

class Cat {

}

export const cat_get_by_id = async (id: number) => {
    return parse_res_as<Cat>("cat_get_by_id", { id: id })
}

export const cat_search = async (id: number, name: string) => {
    return parse_res_as<Cat[]>("cat_search", { id: id, name: name })
}
