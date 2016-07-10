#!/usr/bin/env node
'use strict';

/**
 * Run example-app unit tests.
 */

// dependencies
const path = require('path');
const sh = require('shelljs');
const tools = require('../../packages/tools/index.js');

// exit on error
sh.set('-e');

// paths
const src = 'example-app/example-app.specs.js';
const dist = '_test';
const output = path.join(dist, 'test.js');


// Setup
tools.clean(dist);
sh.echo(`Setting up "${dist}/"...`);
sh.mkdir('-p', dist);


// Transcode tests to a nodejs module.
sh.echo(`Transcoding and bundling tests to "${output}"...`);
tools.exec(`jspm build ${src} "${output}" --skip-rollup --format cjs`);


// Run them with mocha (a nodejs test runner).
sh.echo('Running tests...');
tools.exec(`mocha -b --require source-map-support/register "${output}"`);
