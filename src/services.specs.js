/* eslint max-nested-callbacks: "off"*/

import Rx from 'example-app/tools/rx.js';
import sinon from 'sinon';
import {expect} from 'chai';
import {testInjectMatch} from 'example-app/tools/inspect.js';

import * as services from './services.js';

describe('services', function() {

  describe('User', function() {
    let user, firebaseApp, auth, db, authState;

    beforeEach(function() {
      authState = new Rx.Subject();
      auth = {
        observeAuthState: sinon.stub().returns(authState),
        signInAnonymously: sinon.stub().returns(Promise.resolve({uid: 'alice'})),
        signOut: sinon.stub().returns(Promise.resolve())
      };
      db = {
        ref: sinon.stub()
      };
      firebaseApp = {
        auth: sinon.stub().returns(auth),
        database: sinon.stub().returns(db)
      };
      user = new services.User(firebaseApp);
    });

    describe('auth', function() {

      it('should observe auth', function() {
        const promise = user.auth().take(1).toPromise();
        const state = {uid: 'someId'};

        authState.next(state);

        return promise.then(u => expect(u).to.equal(state));
      });

      it('should only emit distinct values', function() {
        const promise = user.auth().toArray().toPromise();

        authState.next(null);
        authState.next(null); // should drop this one
        authState.next({uid: 'someId'});
        authState.next({uid: 'someId'}); // different object
        authState.next(null);

        authState.complete();
        user.destroy();

        return promise.then(states => expect(states).to.have.length(4));
      });

    });

    describe('signIn', function() {

      it('should sign user anonymously', function() {
        return user.signIn().then(
          u => expect(u.uid).to.equal('alice')
        );
      });

    });

    describe('signOut', function() {

      it('should sign user out', function() {
        return user.signOut().then(
          () => expect(auth.signOut).to.have.been.calledOnce
        );
      });

      it('should signal signing out before signing out', function() {
        const signal = user.auth().take(1).toPromise();
        const signingOut = user.signOut();

        return signal.then(() => {
          expect(auth.signOut).to.not.have.been.called;

          return signingOut;
        });
      });

    });

    describe('get', function() {

      it('should fetch the user registration info', function() {
        const promise = user.get().take(3).toArray().toPromise();
        const registration = new Rx.Subject();
        const ref = {
          observe: sinon.stub().withArgs('value').returns(registration)
        };

        db.ref.withArgs('/users/bob').returns(ref);

        authState.next(null);
        authState.next({uid: 'bob'});
        registration.next({registeredAt: 12345});
        authState.next(null);

        return promise.then(values => {
          expect(values).to.have.length(3);
          expect(values[0]).to.equal(undefined);
          expect(values[1].registeredAt).to.equal(12345);
          expect(values[2]).to.equal(undefined);
        });
      });

    });

    describe('uid', function() {

      it('should sign the user if the current user is not set', function() {
        auth.currentUser = null;

        return user.uid().then(uid => expect(uid).to.equal('alice'));
      });

      it('should return the current user id', function() {
        auth.currentUser = {
          uid: 'bob'
        };

        return user.uid().then(uid => expect(uid).to.equal('bob'));
      });

    });

    describe('register', function() {

      it('should register the user', function() {
        const ref = {
          set: sinon.stub().returns(Promise.resolve())
        };

        db.ref.withArgs('/users/alice').returns(ref);

        return user.register().then(() => {
          expect(ref.set).to.have.been.calledOnce;
          expect(ref.set).to.have.been.calledWithExactly({
            registeredAt: {'.sv': 'timestamp'}
          });
        });
      });

      it('should reject if registration failed', function() {
        const err = new Error();
        const ref = {
          set: sinon.stub().returns(Promise.reject(err))
        };

        db.ref.withArgs('/users/alice').returns(ref);

        return user.register().then(
          () => Promise.reject(new Error('unexpected')),
          e => expect(e).to.equal(err)
        );
      });

    });

  });

  describe('eaLists', function() {
    let listsService, firebaseApp, db;

    beforeEach(function() {
      db = {};
      firebaseApp = {
        database: sinon.stub().returns(db)
      };
      listsService = new services.Lists(firebaseApp);
    });

    testInjectMatch(services.Lists);

    it('should have a user attribute', function() {
      expect(listsService.user).to.be.instanceof(services.User);
    });

    describe('all', function() {
      let registration;

      beforeEach(function() {
        registration = new Rx.Subject();
        listsService.user = {
          get: sinon.stub().returns(registration)
        };
      });

      it('should query a registered user list of shopping list', function() {
        const lists = new Rx.Subject();
        const query = {
          observeChildren: sinon.stub().returns(lists)
        };
        const ref = {
          orderByKey: sinon.stub().returns(query)
        };

        db.ref = sinon.stub().withArgs('/lists/bob').returns(ref);

        const promise = listsService.all().take(4).toArray().toPromise();

        registration.next(null);
        registration.next({
          $key: 'bob',
          registeredAt: 1234
        });
        lists.next(['grocery']);
        lists.next(['grocery', 'xmas']);
        registration.next(null);

        return promise.then(
          values => expect(values).to.eql([
            undefined,
            ['grocery'],
            ['grocery', 'xmas'],
            undefined
          ])
        );
      });

    });

    describe('exists', function() {

      beforeEach(function() {
        listsService.user = {
          uid: sinon.stub().returns(Promise.resolve({uid: 'bob'}))
        };
      });

      it('should resolve to true if the list exists', function() {
        const ref = {
          once: sinon.stub().withArgs('value').returns(
            Promise.resolve({exists: () => true})
          )
        };

        db.ref = sinon.stub().withArgs('/lists/bob/grocery').returns(ref);

        return listsService.exists('grocery').then(exists => {
          expect(exists).to.equal(true);
          expect(ref.once).to.have.been.calledOnce;
        });
      });

      it('should resolve to false if the list does not exist', function() {
        const ref = {
          once: sinon.stub().withArgs('value').returns(
            Promise.resolve({exists: () => false})
          )
        };

        db.ref = sinon.stub().withArgs('/lists/bob/grocery').returns(ref);

        return listsService.exists('grocery').then(exists => {
          expect(exists).to.equal(false);
          expect(ref.once).to.have.been.calledOnce;
        });
      });

    });

    describe('create', function() {

      beforeEach(function() {
        listsService.user = {
          uid: sinon.stub().returns(Promise.resolve({uid: 'bob'}))
        };
      });

      it('should create a list', function() {
        const ref = {
          set: sinon.stub().withArgs({createdAt: {'.sv': 'timestamp'}}).returns(
            Promise.resolve()
          )
        };

        db.ref = sinon.stub().withArgs('/lists/bob/grocery').returns(ref);

        return listsService.create('grocery').then(
          () => expect(ref.set).to.have.been.calledOnce
        );
      });

    });

    describe('remove', function() {

      beforeEach(function() {
        listsService.user = {
          uid: sinon.stub().returns(Promise.resolve({uid: 'bob'}))
        };
      });

      it('should remove a list', function() {
        const ref = {
          update: sinon.stub().withArgs({
            'lists/bob/grocery': null,
            'listItems/bob/grocery': null
          }).returns(
            Promise.resolve()
          )
        };

        db.ref = sinon.stub().withArgs('/lists/bob/grocery').returns(ref);

        return listsService.remove('grocery').then(
          () => expect(ref.update).to.have.been.calledOnce
        );
      });

    });

  });

  describe('ShoppingList', function() {
    let shopping, lists, db;

    beforeEach(function() {
      db = {
        ref: sinon.stub()
      };
      lists = {
        _firebaseApp: {
          database: sinon.stub().returns(db)
        },
        user: {}
      };
      shopping = new services.ShoppingList('grocery', lists);
    });

    it('should have a name', function() {
      expect(shopping.name).to.equal('grocery');
    });

    describe('items', function() {
      let registration, listRef, listInfo, itemsRef, itemsQuery, items;

      beforeEach(function() {
        registration = new Rx.ReplaySubject(2);
        listInfo = new Rx.ReplaySubject(2);
        items = new Rx.ReplaySubject(2);

        listRef = {
          observe: sinon.stub().withArgs('value').returns(listInfo)
        };
        itemsQuery = {
          observeChildren: sinon.stub().returns(items)
        };
        itemsRef = {
          orderByKey: sinon.stub().returns(itemsQuery)
        };

        db.ref.withArgs('/lists/bob/grocery').returns(listRef);
        db.ref.withArgs('/listItems/bob/grocery').returns(itemsRef);

        lists.user.get = sinon.stub().returns(registration);
        lists.exists = sinon.stub().returns(Promise.resolve(true));
        lists.create = sinon.stub().returns(Promise.resolve());
      });

      it('should observe items', function() {
        const promise = shopping.items().take(3).toArray().toPromise();

        registration.next(null);
        registration.next({registeredAt: 1234, $key: 'bob'});
        listInfo.next({createdAt: 1234});
        items.next(['bread']);
        items.next(['bread', 'eggs']);

        return promise.then(notifications => {
          expect(notifications).to.have.eql([
            undefined,
            ['bread'],
            ['bread', 'eggs']
          ]);
        });
      });

    });

    describe('add', function() {

      beforeEach(function() {
        lists.user.uid = sinon.stub().returns(Promise.resolve('bob'));
      });

      it('should add an item to the list', function() {
        const ref = {
          set: sinon.stub().withArgs({createdAt: {'.sv': 'timestamp'}}).returns(
            Promise.resolve()
          )
        };

        db.ref.withArgs('/listItems/bob/grocery/bread').returns(ref);

        return shopping.add('bread').then(
          () => expect(ref.set).to.have.been.calledOnce
        );
      });

    });

    describe('remove', function() {

      beforeEach(function() {
        lists.user.uid = sinon.stub().returns(Promise.resolve('bob'));
      });

      it('should remove an item from the list', function() {
        const ref = {
          remove: sinon.stub().returns(Promise.resolve())
        };

        db.ref.withArgs('/listItems/bob/grocery/bread').returns(ref);

        return shopping.remove('bread').then(
          () => expect(ref.remove).to.have.been.calledOnce
        );
      });

    });

  });

});

