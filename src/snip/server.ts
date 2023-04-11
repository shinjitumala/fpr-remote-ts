const root_rel = "null"
const port = 0
const domain = "null"
// BEGIN
// BEGIN SERVER HEADER
import * as api from "./api_impl"
import { createWriteStream } from "fs"
import exp from "express"

const log = createWriteStream(__dirname + "/fpr-budget.log")

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
