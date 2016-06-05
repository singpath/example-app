/**
 * example-app/tools/inspect.js - test factory for function $inject.
 *
 * See https://docs.angularjs.org/guide/di#-inject-property-annotation
 */
import getParameterNames from 'get-parameter-names';
import {expect} from 'chai';

/**
 * Test the function has `$inject` set.
 *
 * The length of argument must match the length of the factory/constructor
 * $inject property.
 */
export function testInjectSet(fn) {
  it('should have $inject set.', function() {
    expect(fn.$inject).to.exist;
    expect(fn.$inject).to.be.an('array');
    expect(fn.$inject.length).to.equal(fn.length);
  });
}

/**
 * Test the function has `$inject` list matching its argument names.
 */
export function testInjectMatch(fn) {
  it('should have $inject match the constructor/factory argument names.', function() {
    expect(fn.$inject).to.exist;
    expect(fn.$inject).to.be.an('array');
    expect(fn.$inject).to.eql(getParameterNames(fn));
  });
}
