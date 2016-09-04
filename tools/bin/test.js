#!/usr/bin/env node
'use strict';

/**
 * Run example-app unit tests.
 */

const sh = require('shelljs');
const tools = require('../../packages/tools/index.js');
const src = 'example-app/example-app.specs.js';

// exit on error
sh.set('-e');

tools.mocha(src, {
  config(loader) {
    loader.config({
      map: {
        css: loader.map.text,
        firebase: '@empty'
      }
    });
  }
});
