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
module.exports = function exec(cmd, opts) {
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
