import ts from "rollup-plugin-typescript2"
import node from "@rollup/plugin-node-resolve"
import cjs  from "@rollup/plugin-commonjs"

export default {
    input: "src/main.ts",
    output: {
        file: "build/main.js",
        format: "cjs",
        banner: "#!/usr/bin/env node",
    },
    plugins: [
        ts(),
        node(),
        cjs(),
    ],
}