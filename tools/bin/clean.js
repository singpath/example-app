#!/usr/bin/env node
'use strict';

/**
 * Remove build/test related directories.
 */


// dependencies
const tools = require('../../packages/tools/index.js');
const sh = require('shelljs');

// exit on error
sh.set('-e');


tools.clean(['dist', '_test', 'coverage']);
