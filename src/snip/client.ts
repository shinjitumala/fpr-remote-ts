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
