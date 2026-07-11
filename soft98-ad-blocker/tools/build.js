#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const terser = require("terser");

const PROJECT = path.resolve(__dirname, "..");
const REPO = path.resolve(PROJECT, "..");
const META = path.join(PROJECT, "src", "meta.txt");
const RUNTIME = path.join(PROJECT, "src", "runtime.js");
const OUT = path.join(REPO, "soft98_ad-blocker.user.js");

async function main() {
  const meta = fs.readFileSync(META, "utf8").trim();
  const runtime = fs.readFileSync(RUNTIME, "utf8");
  const minified = await terser.minify(runtime, {
    compress: {
      passes: 2,
      unsafe: false,
    },
    mangle: {
      keep_fnames: /soft98AdBlocker/,
    },
    format: {
      ascii_only: false,
      comments: false,
    },
  });
  if (minified.error) throw minified.error;
  fs.writeFileSync(
    OUT,
    `${meta}\n\n${minified.code}\n`,
    "utf8"
  );
  console.log(`Built ${path.relative(REPO, OUT)} (${Buffer.byteLength(minified.code, "utf8")} runtime bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
