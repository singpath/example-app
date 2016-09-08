/* eslint max-nested-callbacks: "off"*/

import {expect, sinon, testInjectMatch} from 'example-app/tools/chai.js';

import * as loadingServices from './loading.js';

describe('loading service(s)', function() {

  describe('loadingFactory', function() {
    let loading;

    beforeEach(function() {
      loading = loadingServices.loadingFactory();
    });

    testInjectMatch(loadingServices.loadingFactory);

    it('should return a loading Object', function() {
      expect(loading()).to.be.an.instanceof(loadingServices.Loading);
    });
  });

  describe('Loading', function() {
    let $rootScope, $log, loading;

    beforeEach(function() {
      $rootScope = {$applyAsync: sinon.spy()};
      $log = {error: sinon.spy()};
      loading = new loadingServices.Loading($rootScope, $log);
    });

    it('should be ready by default', function() {
      expect(loading.ready).to.be.true();
    });

    it('should have a size set to 0', function() {
      expect(loading.size).to.equal(0);
    });

    it('should have no errors by default', function() {
      expect(loading.errors.size).to.equal(0);
    });

    describe('#add', function() {

      it('should add a resource to the list of loading resource', function() {
        loading.add('user');
        expect(loading.size).to.equal(1);
        loading.add('user');
        expect(loading.size).to.equal(1);
        loading.add('items');
        expect(loading.size).to.equal(2);
      });

      it('should return a context object', function() {
        expect(loading.add('user')).to.have.property('done', false);
      });

      it('should set the previous context as completed/cancelled', function() {
        const oldCtx = loading.add('user');
        const newCtx = loading.add('user');

        expect(oldCtx.done).to.be.true();
        expect(newCtx.done).to.be.false();
      });

      it('should throw if throw if the resource name is missing', function() {
        loading.add('user');

        expect(() => loading.add()).to.throw();
        expect(() => loading.add('')).to.throw();
        expect(() => loading.add(null)).to.throw();
        expect(loading.size).to.equal(1);
      });

    });

    describe('#remove', function() {

      it('should remove a resource', function() {
        loading.add('user');
        loading.add('items');
        loading.remove('user');
        loading.remove('user');

        expect(loading.size).to.equal(1);
      });

      it('should set the current ctx as completed/cancelled', function() {
        const ctx = loading.add('user');

        loading.remove('user');
        expect(ctx.done).to.be.true();
      });

      it('should throw if throw if the resource name is missing', function() {
        loading.add('user');

        expect(() => loading.remove()).to.throw();
        expect(() => loading.remove('')).to.throw();
        expect(() => loading.remove(null)).to.throw();
        expect(loading.size).to.equal(1);
      });

    });

    describe('#error', function() {

      it('should remove a resource', function() {
        loading.add('user');
        loading.add('items');
        loading.error('user');

        expect(loading.size).to.equal(1);
      });

      it('should update the error map', function() {
        loading.error('user');

        expect(loading.errors.get('user')).to.equal(true);
        expect(loading.errors.size).to.equal(1);
      });

      it('should log the error', function() {
        const err = new Error();

        loading.error('user', err);

        expect($log.error).to.have.been.calledOnce();
        expect($log.error.lastCall.args[0]).to.equal(err);
      });

    });

  });

});

