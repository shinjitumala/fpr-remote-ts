import exp from "express"
import { createWriteStream } from "fs"
const log = createWriteStream("fpr-budget.log")
const srv = exp()
class X {
    public __name__ = (x: any) => { return 1 }
}
const api = new X()
const __args_access__ = null

// BEGIN
srv.post("/__name__", (req, res) => {
    const body = req.body
    log.write(`__name__(${JSON.stringify(body)})\n`)
    const ret = api.__name__(__args_access__)
    res.json(ret)
})