#!/usr/bin/env node
'use strict';

/**
 * Run example-app unit tests.
 */

const sh = require('shelljs');
const tools = require('../../packages/tools/index.js');
const src = 'example-app/example-app.specs.js';
const coverage = './coverage';

// exit on error
sh.set('-e');

// setup
tools.clean(coverage, {message: 'Removing coverage data'});
sh.echo(`Setting up "${coverage}/"...`);
sh.mkdir('-p', coverage);

tools.instanbul(src, {coverage});
