import ts from "rollup-plugin-typescript2"

export default {
    input: "src/main.ts",
    output: {
        file: "build/main.js",
        format: "cjs",
    },
    plugins: [ts()],
}