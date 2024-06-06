"use strict";

import { globSync } from "glob";

import type { Configuration } from "webpack";

const entryPoints = globSync("./dist/js/**/*.js").map((p) => "./" + p);

const config: Configuration = {
    mode: "production",
    devtool: "source-map",
    entry: entryPoints,
    output: {
        path: process.cwd(),
        filename: "index.js",
    },
};

export default config;
