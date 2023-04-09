// BEGIN DEFS
const host = "http://127.0.0.1"
const port = "8000"
const domain = `${host}:${port}`

export class Cat {

}
// END DEFS
// BEGIN SERVER HEADER
import * as api from "./api_impl"
import exp from "express"

const root = __dirname + "/" + root_rel
const srv = exp()
srv.use(exp.json())
srv.use(exp.static(root))
srv.get('/', (req, res) => { res.sendFile(root + "/index.html") })
srv.listen(port, () => {
    console.log(`Listening on port ${port}`)
    console.log(`Access the server at: ${domain}`)
})
// END SERVER HEADER
// BEGIN API
srv.post("/cat_get_by_id", (req, res) => {
    const body = req.body
    const ret = api.cat_get_by_id(body.id)
    res.json(ret)
})
srv.post("/cat_search", (req, res) => {
    const body = req.body
    const ret = api.cat_search(body.id, body.name)
    res.json(ret)
})
srv.post("/cat_get_by_name", (req, res) => {
    const body = req.body
    const ret = api.cat_get_by_name(body.name)
    res.json(ret)
})
// END API
