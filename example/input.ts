// BEGIN TYPES
class Cat {

}
// END TYPES

interface API {
    cat_get_by_id: (id: number) => Cat
    cat_search: (id: number, name: string) => Cat[]
} // END API