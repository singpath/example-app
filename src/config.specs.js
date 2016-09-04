import {expect, sinon} from 'example-app/tools/chai.js';

import {default as config, params} from './config.js';


describe('config and helpers', function() {

  describe('routes', function() {

    it('should be injectable', function() {
      expect(config.routes).to.be.injectable();
    });

    it('should configure ngRoute', function() {
      const $routeProvider = {
        when: sinon.stub(),
        otherwise: sinon.stub()
      };

      $routeProvider.when.returnsThis();
      $routeProvider.otherwise.returnsThis();

      config.routes($routeProvider);

      expect($routeProvider.when).to.always.have.been.calledWithExactly(
        sinon.match.string,
        sinon.match({template: sinon.match.string})
      );
      expect($routeProvider.otherwise).to.have.been.calledOnce();
      expect($routeProvider.otherwise).to.have.been.calledWith('/');
    });

  });

  describe('params resolver', function() {
    let $routes;

    beforeEach(function() {
      $routes = {current: {params: {}}};
    });

    it('should be injectable', function() {
      expect(params).to.be.injectable();
    });

    it('should return the current route params', function() {
      expect(params($routes)).to.eql($routes.current.params);
    });

  });

});
