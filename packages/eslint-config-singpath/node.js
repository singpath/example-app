'use strict';
var path = require('path');

module.exports = {
  extends: path.join(__dirname, 'index.js'),
  env: {
    es6: true,
    mocha: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'script'
  }
};
