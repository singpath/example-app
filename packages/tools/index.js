'use strict';

const sh = require('shelljs');
const ps = require('child_process');

/**
 * Basic exec function.
 *
 * Unlike `shelljs.exec(cmd)`, it allow commands to print ansi colors.
 *
 * @param  {string} cmd  shell command to run
 * @param  {?{printCmd: boolean, ignoreStdout: boolean, ignoreStderr: boolean}} opts options
 */
exports.exec = function(cmd, opts) {
  opts = Object.assign({
    printCmd: true,
    ignoreStdout: false,
    ignoreStderr: false
  }, opts);

  const stdout = 1;
  const stderr = 2;
  const stdio = [process.stdin, process.stdout, process.stderr];

  if (opts.ignoreStdout) {
    stdio[stdout] = 'ignore';
  }

  if (opts.ignoreStderr) {
    stdio[stderr] = 'ignore';
  }

  if (opts.printCmd) {
    sh.echo(cmd);
  }

  try {
    ps.execSync(cmd, {stdio});
  } catch (e) {
    sh.exit(e.status);
  }
};

/**
 * Log and remove list of of file/directory.
 *
 * @param  {string|string[]}                   paths path of file/directory to remove
 * @param  {{message: string, force: boolean}} opts  options
 */
exports.clean = function(paths, opts) {
  opts = Object.assign({
    message: 'Removing build/test artifacts',
    force: false
  }, opts);
  paths = [].concat(paths).filter(path => sh.test('-e', path));

  if (paths.length === 0) {
    sh.echo('Nothing to remove.');
    return;
  }

  sh.echo(`${opts.message}: ${paths.map(p => `"${p}"`).join(', ')}...`);

  if (opts.force) {
    sh.rm('-rf', paths);
  }

  const dirs = paths.filter(path => sh.test('-d', path));
  const files = paths.filter(path => sh.test('-d', path) === false);

  if (dirs.length > 0) {
    sh.rm('-r', dirs);
  }

  if (files.length > 0) {
    sh.rm(files);
  }
};
