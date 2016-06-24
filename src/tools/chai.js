/**
 * example-app/tools/chai.js - test helpers.
 *
 * See https://docs.angularjs.org/guide/di#-inject-property-annotation
 */
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';

import getParameterNames from 'get-parameter-names';

export {expect} from 'chai';
export {default as sinon} from 'sinon';

// Register dirtyChai
//
// See https://github.com/prodatakey/dirty-chai
chai.use(dirtyChai);

// Register sinonChai plugin
//
// See https://github.com/domenic/sinon-chai
chai.use(sinonChai);

/**
 * Test the function has `$inject` set.
 *
 * The length of argument must match the length of the factory/constructor
 * $inject property.
 *
 * @param {function} fn Injectable function
 */
export function testInjectSet(fn) {
  it('should have $inject set.', function() {
    chai.expect(fn.$inject).to.exist();
    chai.expect(fn.$inject).to.be.an('array');
    chai.expect(fn.$inject.length).to.equal(fn.length);
  });
}

/**
 * Test the function has `$inject` list matching its argument names.
 *
 * @param {function} fn Injectable function
 */
export function testInjectMatch(fn) {
  it('should have $inject match the constructor/factory argument names.', function() {
    chai.expect(fn.$inject).to.exist();
    chai.expect(fn.$inject).to.be.an('array');
    chai.expect(fn.$inject).to.eql(getParameterNames(fn));
  });
}
