/* eslint no-invalid-this: "off" */
'use strict';

const getParameterNames = require('get-parameter-names');

module.exports = function(chai, utils) {
  var Assertion = chai.Assertion;

  utils.addProperty(Assertion.prototype, 'injectable', function() {
    var fn, deps, params, isFn, doMatch;

    if (Array.isArray(this._obj)) {
      fn = this._obj.slice(-1).pop();
      deps = this._obj.slice(0, -1);
    } else {
      fn = this._obj;
      deps = fn && fn.$inject;
    }

    isFn = typeof fn === 'function';
    params = isFn && getParameterNames(fn);
    doMatch = !params || deps && params.every(function(dep, k) {
      return dep === deps[k];
    });

    this.assert(
      isFn && doMatch,
      'expected #{this} to be injectable; expected annotation to be #{exp}, got #{act}',
      'expected #{this} to not be injectable',
      params,
      deps
    );
  });
};
