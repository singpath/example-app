#!/usr/bin/env bash
set -e

SRC=./tests.js
DIST=_test
DEST=${DIST}/test.js

# Clean up
rm -rf "$DIST"
mkdir -p "$DIST"

# Transcode and bundle tests in a format nodejs can load.
./node_modules/.bin/jspm build "$SRC" "$DEST" --skip-rollup --format cjs

# Run test using mocha (test runner).
./node_modules/.bin/mocha --require source-map-support/register "$DEST"