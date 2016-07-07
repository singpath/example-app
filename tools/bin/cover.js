#!/usr/bin/env node
'use strict';

/**
 * Run example-app unit tests with coverage.
 */

// dependencies
const path = require('path');
const sh = require('shelljs');
const tools = require('../../packages/tools/index.js');

// exit on error
sh.set('-e');

// paths
const src = 'example-app/example-app.specs.js';
const coverage = 'coverage';
const dist = '_test';
const output = path.join(dist, 'test.js');

// Setup
tools.clean([coverage, dist]);
sh.echo(`Setting up "${dist}/"...`);
sh.mkdir('-p', dist);


// Transcode tests to a nodejs module.
sh.echo(`Transcoding and bundling tests to "${output}"...`);
tools.exec(`jspm build ${src} "${output}" --skip-rollup --format cjs`);


// Run them with istanbul (instrument code to mesure coverage)
// and mocha (a nodejs test runner).
sh.echo('Running tests with coverage...');
tools.exec(`istanbul cover -v --es-modules --print none --report json _mocha -- "${output}"`, {ignoreStderr: true});


// Build reports pointing to the correct src paths
sh.echo('Remapping coverage...');
sh.mv(`${coverage}/coverage-final.json`, `${coverage}/coverage.json`);
tools.exec(`remap-istanbul -i "${coverage}/coverage.json" -o "${coverage}/coverage.json" -e 'jspm_packages,.specs.js'`);

sh.echo('Creating coverage report...');
tools.exec('istanbul report --es-modules lcov text');
