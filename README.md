# Quickstart
Let `foo` be your project directory.
And we assume that you have already run `npm init` in your project `foo`
```bash
$ git clone https://github.com/shinjitumala/fpr-remote-ts.git
$ cd fpr-remote-ts # Go to fpr-remote-ts and build it
$ npm init
$ npm run build
$ cd ../foo # Go to your project
$ npm i --save-dev ../fpr-remote-ts
$ npx fpr-remote-ts-gen
Usage: /home/shinji/repos/FPRBudget/app/node_modules/.bin/fpr-remote-ts-gen <input_def> <input_api> <output_server> <output_client>
```
Congratulations! You can now use `fpr-remote-ts`

# Examples
The `example` folder contains example files.
We can check this by running `npm run test` (which runs `npm run build && node build/main.js example/def.ts example/api.ts example/output_server.ts example/output_client.ts`)
This generates `example/output_server.ts` and `example/output_client.ts` from `example/def.ts` and `example/api.ts`