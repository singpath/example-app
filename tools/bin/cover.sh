#!/usr/bin/env bash
set -e

SRC=./tests.js
DIST=_test
DEST=${DIST}/test.js
COVERAGE=coverage


rm -rf "$DIST" "$COVERAGE"
mkdir -p "$DIST"

echo "Building tests in $DIST..."
./node_modules/.bin/jspm build "$SRC" "$DEST" --skip-rollup --format cjs

echo "Run tests with coverage..."
./node_modules/.bin/istanbul cover -v --es-modules --print none --report json ./node_modules/.bin/_mocha -- "$DEST" 2> /dev/null

echo "Remapping coverage..."
mv "${COVERAGE}/coverage-final.json" "${COVERAGE}/coverage.json"
./node_modules/.bin/remap-istanbul -i "${COVERAGE}/coverage.json" -o "${COVERAGE}/coverage.json" -e 'jspm_packages,.specs.js'

echo "Creating coverage report..."
./node_modules/.bin/istanbul report --es-modules lcov text
