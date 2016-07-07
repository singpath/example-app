#!/usr/bin/env node
'use strict';

/**
 * Bundle example-app.
 */

// dependencies
const tools = require('../../packages/tools/index.js');
const path = require('path');
const sh = require('shelljs');

// exit on error
sh.set('-e');

// paths
const dist = 'dist';
const output = path.join(dist, 'example-app.js');
const outputMin = path.join(dist, 'example-app.min.js');
const outputTree = path.join(dist, 'example-app.tree.html');

// jspm options
const deps = ['angular', 'angular-route', 'firebase', 'rxjs/bundles/Rx.umd.js'];
const globalDeps = {
  'angular/angular.js': 'angular',
  'angular-route/angular-route.js': 'angular',
  'firebase/firebase.js': 'firebase',
  'rxjs/bundles/Rx.umd.js': 'Rx'
};
const src = ['example-app'].concat(deps).join(' - ');
const depsOpts = `--global-name exampleApp --global-deps '${JSON.stringify(globalDeps)}'`;


// Setup
const artifacts = [dist].filter(dir => sh.test('-d', dir));

if (artifacts.length > 0) {
  sh.echo(`Removing ${artifacts.map(dir => `"${dir}/"`).join(', ')}...`);
  sh.rm('-r', artifacts);
}

sh.echo(`Setting up "${dist}/"...`);
sh.mkdir('-p', dist);
sh.cp('LICENSE', 'tools/assets/dist/*', dist);


// Bundles
sh.echo(`Buidling ${output}...`);
tools.exec(`jspm build ${src} "${output}" ${depsOpts} --format umd --skip-source-maps`);

sh.echo(`Buidling ${outputMin}...`);
tools.exec(`jspm build ${src} "${outputMin}" ${depsOpts} --format umd --minify`);


// Dependency tree
//
// You don't want the browser to load the source map file
// (the source map is often as big as the bundle).
// So we are stripping the source map directive in the bundle
// by stripping the last line.
sh.echo(`Removing source map directive from ${outputMin}...`);
sh.sed('-i', /^\/\/# sourceMappingURL=.*$/, '', outputMin);

sh.echo('Analysing source map...');
sh.exec(`source-map-explorer --html "${outputMin}"{,.map}`, {silent: true}).to(outputTree);

sh.echo(`open "'${outputTree}'" to find weight of each modules.`);
