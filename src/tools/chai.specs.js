/* eslint no-unused-vars: "off" */

import {testInjectMatch, testInjectSet} from 'example-app/tools/chai.js';

describe('example-app/tools/chai.js', function() {

  describe('testInjectMatch', function() {
    const fn = (foo, bar) => undefined;

    fn.$inject = ['foo', 'bar'];
    testInjectMatch(fn);
  });

  describe('testInjectSet', function() {
    const fn = (foo, bar) => undefined;

    fn.$inject = ['specialFoo', 'bar'];
    testInjectSet(fn);
  });

});
