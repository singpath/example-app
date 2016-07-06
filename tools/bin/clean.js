#!/usr/bin/env node
'use strict';

/**
 * Remove build/test related directories.
 */


// dependencies
const sh = require('shelljs');

// exit on error
sh.set('-e');

// paths
const dirs = ['dist', '_test', 'coverage'].filter(
  path => sh.test('-d', path)
);


if (dirs.length === 0) {
  sh.echo('Nothing to remove.');
  sh.exit();
}

sh.echo(`Removing build/test artifacts: ${dirs.map(p => `"${p}/"`).join(', ')}.`);
sh.rm('-r', dirs);
