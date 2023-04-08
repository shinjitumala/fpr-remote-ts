// BEGIN CLIENT HEADER

const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
}
const parse_res_as = async <T>(domain: string, path: string, obj: Object) => {
    return new Promise<T>(p => {
        fetch(`${domain}/${path}`, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: { "Content-Type": "application/json; charset=UTF-8" }
        }).then(r => {
            p(r.json() as T)
        })
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
