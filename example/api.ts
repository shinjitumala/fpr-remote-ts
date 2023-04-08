import { Cat } from "./def"
// START API
var cat_get_by_id: (id: number) => Cat
var cat_search: (id: number, name: string) => Cat[]
var cat_get_by_name: (name: string) => Cat