// BEGIN DEFS
const host = "http://127.0.0.1"
const port = "8000"
const domain = `${host}:${port}`

export class Cat {

}
// END DEFS
// BEGIN SERVER HEADER
import exp from "express"

const srv = exp()
srv.use(exp.json())


srv.post("/name", (req, res) => {
    console.log(req.body)

    const res_body = { message: "Not implemented." }
    res.json(res_body)
})

srv.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
// END SERVER HEADER
// BEGIN API
srv.post("/cat_get_by_id", (req, res) => {
    const body = req.body
    const ret = api.cat_get_by_id(body.id)
    res.json(JSON.stringify(ret))
})
srv.post("/cat_search", (req, res) => {
    const body = req.body
    const ret = api.cat_search(body.id, body.name)
    res.json(JSON.stringify(ret))
})
srv.post("/cat_get_by_name", (req, res) => {
    const body = req.body
    const ret = api.cat_get_by_name(body.name)
    res.json(JSON.stringify(ret))
})
// END API
