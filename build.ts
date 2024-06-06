"use strict";

import * as fs from "node:fs";

import { buildSync } from "esbuild";

const targetNoBundleFiles = ["js/index.ts", "js/tools.ts", "build.ts", "webpack.config.ts"];

if (fs.existsSync("./dist/js")) fs.rmSync("./dist/js", { recursive: true });

buildSync({
    allowOverwrite: true,
    bundle: false,
    entryPoints: targetNoBundleFiles,
    format: "cjs",
    outdir: "./dist",
    platform: "node",
    target: "esnext",
    tsconfig: "./tsconfig.json",
    sourcemap: true,
    sourcesContent: false,
    write: true,
});
