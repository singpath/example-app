/* eslint max-nested-callbacks: "off"*/

import {expect, sinon, testInjectMatch} from 'example-app/tools/chai.js';

import * as authServices from './auth.js';

describe('auth service(s)', function() {

  describe('Auth service', function() {
    let auth, firebaseApp, firebaseAuth;

    beforeEach(function() {
      firebaseAuth = {
        onAuthStateChanged: sinon.stub(),
        signInAnonymously: sinon.stub(),
        signOut: sinon.stub()
      };
      firebaseApp = {auth: sinon.stub()};
      firebaseApp.auth.returns(firebaseAuth);

      auth = new authServices.Auth(firebaseApp);
    });

    testInjectMatch(authServices.Auth);

    describe('#signIn', function() {

      it('should sign user out', function() {
        firebaseAuth.signInAnonymously.returns(Promise.resolve());

        auth.signIn();

        expect(firebaseAuth.signInAnonymously).to.have.been.calledOnce();
      });

      it('should resolve to the value signIn resolved to', function() {
        const value = {};

        firebaseAuth.signInAnonymously.returns(Promise.resolve(value));

        return auth.signIn().then(
          result => expect(result).to.equal(value)
        );
      });

      it('should reject if signout reject', function() {
        const err = new Error();

        firebaseAuth.signInAnonymously.returns(Promise.reject(err));

        return auth.signIn().then(
          () => Promise.reject(new Error('unexpected')),
          e => expect(e).to.equal(err)
        );
      });

    });

    describe('#signOut', function() {

      it('should sign user out', function() {
        firebaseAuth.signOut.returns(Promise.resolve());

        auth.signOut();

        expect(firebaseAuth.signOut).to.have.been.calledOnce();
      });

      it('should resolve to the value signOut resolved to', function() {
        const value = {};

        firebaseAuth.signOut.returns(Promise.resolve(value));

        return auth.signOut().then(
          result => expect(result).to.equal(value)
        );
      });

      it('should reject if signout reject', function() {
        const err = new Error();

        firebaseAuth.signOut.returns(Promise.reject(err));

        return auth.signOut().then(
          () => Promise.reject(new Error('unexpected')),
          e => expect(e).to.equal(err)
        );
      });

    });

    describe('#$watch', function() {
      let listener, deregister;

      beforeEach(function() {
        listener = sinon.spy();
        deregister = sinon.spy();
        firebaseAuth.onAuthStateChanged.returns(deregister);
      });

      it('should subscribe to firebase auth changes events', function() {
        const off = auth.$watch(listener);

        expect(firebaseAuth.onAuthStateChanged).to.have.been.calledOnce();
        expect(firebaseAuth.onAuthStateChanged).to.have.been.calledWith(
          sinon.match.func, sinon.match.func
        );
        expect(off).to.equal(deregister);
      });

      describe('events', function() {
        let onValue, onError;

        beforeEach(function() {
          auth.$watch(listener);
          onValue = firebaseAuth.onAuthStateChanged.lastCall.args[0];
          onError = firebaseAuth.onAuthStateChanged.lastCall.args[1];
        });

        it('should call the listener with the user status', function() {
          onValue(null);
          expect(listener).to.have.been.calledOnce();
          expect(listener).to.have.been.calledWith(null, null);

          onValue({uid: 'foo'});
          expect(listener).to.have.been.calledTwice();
          expect(listener).to.have.been.calledWith(null, {uid: 'foo'});
        });

        it('should call the listener with an error', function() {
          const err = new Error();

          onError(err);
          expect(listener).to.have.been.calledOnce();
          expect(listener).to.have.been.calledWith(err);
        });
      });

    });

  });

});

