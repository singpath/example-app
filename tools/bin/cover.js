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

tools.instanbul(src, {
  coverage,

  config(loader) {
    loader.config({
      map: {
        css: loader.map.text,
        firebase: '@empty'
      }
    });
  },

  exclude(baseURL) {
    const jspmPackages = `${baseURL}jspm_packages`;
    const packages = `${baseURL}packages`;

    return address => (
      address.startsWith(jspmPackages) ||
      address.startsWith(packages) ||
      address.endsWith('specs.js') ||
      address.endsWith('.css') ||
      address.endsWith('.html')
    );
  }
});
