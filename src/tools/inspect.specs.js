/* eslint no-unused-vars: "off" */

import * as inspect from './inspect';

describe('example-app/tools/inspect.js', function() {

  describe('testInjectMatch', function() {
    const fn = (foo, bar) => undefined;

    fn.$inject = ['foo', 'bar'];
    inspect.testInjectMatch(fn);
  });

  describe('testInjectSet', function() {
    const fn = (foo, bar) => undefined;

    fn.$inject = ['specialFoo', 'bar'];
    inspect.testInjectSet(fn);
  });

});
