#!/usr/bin/env bash
#
# !!! Assumed to be run via a npm run command !!!
# 
# 		npm run test
# 
set -e

SRC=example-app/example-app.specs.js
DIST=_test
OUTPUT=${DIST}/test.js

# Clean up
rm -rf "$DIST"
mkdir -p "$DIST"

# Transcode and bundle tests in a format nodejs can load.
jspm build "$SRC" "$OUTPUT" --skip-rollup --format cjs

# Run test using mocha (test runner).
mocha -b --require source-map-support/register "$OUTPUT"
