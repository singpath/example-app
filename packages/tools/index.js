'use strict';

const fs = require('fs');
const Mocha = require('mocha');
const path = require('path');
const ps = require('child_process');
const sh = require('shelljs');
const systemIstanbul = require('systemjs-istanbul-hook');
const jspm = require('jspm');
const istanbul = require('istanbul');

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
  paths = [].concat(paths).filter(p => sh.test('-e', p));

  if (paths.length === 0) {
    sh.echo('Nothing to remove.');
    return;
  }

  sh.echo(`${opts.message}: ${paths.map(p => `"${p}"`).join(', ')}...`);

  if (opts.force) {
    sh.rm('-rf', paths);
  }

  const dirs = paths.filter(p => sh.test('-d', p));
  const files = paths.filter(p => sh.test('-d', p) === false);

  if (dirs.length > 0) {
    sh.rm('-r', dirs);
  }

  if (files.length > 0) {
    sh.rm(files);
  }
};


/**
 * Resolve with a module loader.
 *
 * @return {Promise<jspm.Loader, Error>}
 */
function loadJspmConfig() {
  sh.echo('Loading jspm config...');

  return new Promise(resolve => resolve(new jspm.Loader()));
}

/**
 * Resolve with a module loader which will add coverage instrumentation
 * to src code.
 *
 * @param  {{exclude: function}}  opts coverage options
 * @return {Promise<void, Error>}
 */
function hookInstanbul(opts) {
  return loadJspmConfig().then(loader => {
    sh.echo('Registering instrumentation hook to loader...');
    systemIstanbul.hookSystemJS(loader, opts.exclude(loader.baseURL));

    return loader;
  });
}

/**
 * Run mocha tests
 *
 * @param  {jspm.Loader}   loader  a module loader.
 * @param  {string|array}  modules modules defining mocha tests.
 * @param  {?{ui: string}} opts    mocha runner options.
 * @return {Promise<void, Error>}
 */
function runTests(loader, modules, opts) {
  const runner = new Mocha({ui: opts.ui});

  switch (opts.ui) {
    case 'bdd':
    case 'tdd':
    case 'mocha-qunit-ui':
      sh.echo('Augmenting global with mocha API...');
      runner.suite.emit('pre-require', global, 'global-mocha-context', runner);
      break;

    default:
      sh.echo('No mocha API to add to global.');
  }

  sh.echo(`Running tests in ${modules.map(m => `"${m}"`).join(', ')}...`);

  return Promise.all(
    modules.map(m => loader.import(m))
  ).then(
    () => new Promise(
      (resolve, reject) => runner.run((failures) => {
        if (failures) {
          reject(failures);
        } else {
          resolve();
        }
      })
    )
  );
}

/**
 * Save coverage data to "./coverage/coverage.json".
 *
 * @param  {{coverage: string}} opts coverage options
 * @return {Object}                  the coverage object
 */
function saveCoverage(opts) {
  const coveragePath = path.join(opts.coverage, 'coverage.json');
  const coverage = systemIstanbul.remapCoverage();

  sh.echo(`Saving coverage data in ${coveragePath}...`);

  fs.writeFileSync(coveragePath, JSON.stringify(coverage));

  return coverage;
}

/**
 * Create lcov and text reports.
 *
 * @param  {Object}             coverage the coverage object.
 * @param  {{coverage: string}} opts     coverage options
 */
function createReport(coverage, opts) {
  const collector = new istanbul.Collector();
  const reporter = new istanbul.Reporter(null, opts.coverage);
  const sync = true;

  collector.add(coverage);
  reporter.addAll(opts.reports);
  reporter.write(collector, sync);
}

/**
 * Print error to stderr and exit process when shelljs "-e" option is set.
 *
 * @param  {Error}   err error to print.
 * @return {Promise<void, Error>}
 */
function rejectHandler(err) {
  process.stderr.write(`${err}\n`);

  if (sh.config.fatal) {
    sh.exit(1);
  }

  return Promise.reject(err);
}

/**
 * Run mocha tests.
 *
 * bridge mocha and jspm.
 *
 * @param  {string|array}  modules modules defining mocha tests.
 * @param  {?{ui: string}} opts    mocha runner options.
 * @return {Promise<void, Error>}
 */
exports.mocha = function(modules, opts) {

  // convert undefined or a string to an array
  modules = [].concat(modules);

  // set defaults options
  opts = Object.assign({ui: 'bdd'}, opts);

  return loadJspmConfig().then(
    loader => runTests(loader, modules, opts)
  ).catch(rejectHandler);
};

/**
 * Run mocha tests with coverage and create lcov and text reports.
 *
 * Bridge between mocha, instanbul and jspm.
 *
 * @param  {string|array} modules modules defining mocha tests.
 * @param  {?{ui: string, exclude: function, coverage: string}} opts mocha runner options.
 * @return {Promise<void, Error>}
 */
exports.instanbul = function(modules, opts) {
  modules = [].concat(modules);

  // set defaults options
  opts = Object.assign({
    ui: 'bdd',
    coverage: path.resolve('./coverage'),
    reports: ['lcov', 'text'],

    exclude(baseURL) {
      const jspmPackages = `${baseURL}jspm_packages`;

      return address => (address.startsWith(jspmPackages) || address.endsWith('specs.js'));
    }
  }, opts);

  return hookInstanbul(opts).then(
    loader => runTests(loader, modules, opts)
  ).then(
    () => saveCoverage(opts)
  ).then(
    coverage => createReport(coverage, opts)
  ).catch(rejectHandler);
};
