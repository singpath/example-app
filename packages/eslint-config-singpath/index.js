/* eslint no-console: 'off' */
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const filePath = path.resolve(__dirname, './default.yml');
let config;

try {
  config = yaml.safeLoad(fs.readFileSync(filePath, 'utf8')) || {};
} catch (e) {
  console.error(`Error reading YAML file: ${filePath}`);
  e.message = `Cannot read config file: ${filePath} \nError: ${e.message}`;
  throw e;
}

module.exports = config;
