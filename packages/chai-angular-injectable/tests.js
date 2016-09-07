/* eslint
    no-unused-expressions: "off",
    no-unused-vars: "off"
 */
'use strict';

const chai = require('chai');
const injectableChai = require('./index.js');
const expect = chai.expect;

chai.use(injectableChai);

function annoted(fn, deps) {
  fn.$inject = deps;

  return fn;
}

describe('injectableChai', function() {

  describe('with inline array annotation', function() {

    it('should assert the last element is a function', function() {
      expect([]).not.to.be.injectable;
      expect([() => {}]).to.be.injectable;
    });

    it('should assert the function params match the annotation', function() {
      expect(['foo', (foo, bar) => {}]).not.to.be.injectable;
      expect(['fooz', (foo) => {}]).not.to.be.injectable;
      expect(['foo', 'bar', (foo) => {}]).to.be.injectable;
    });

  });

  describe('with property annotations', function() {

    it('should assert the object is a function', function() {
      expect(annoted({}, [])).not.to.be.injectable;
      expect(annoted(() => {}, [])).to.be.injectable;
    });

    it('should assert the function params match the annotation', function() {
      expect(annoted((foo, bar) => {}, ['foo'])).not.to.be.injectable;
      expect(annoted((foo) => {}, ['fooz'])).not.to.be.injectable;
      expect(annoted((foo) => {}, ['foo', 'bar'])).to.be.injectable;
    });

  });

});
