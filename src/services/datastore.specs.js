/* eslint max-nested-callbacks: "off"*/

import {expect, sinon, testInjectMatch} from 'example-app/tools/chai.js';

import * as datastore from './datastore.js';

describe('datastore service(s) and helpers', function() {
  const itemId = 'bacon';
  const uid = 'google:bob';
  const listId = 'grocery';

  let firebaseApp, database;

  beforeEach(function() {
    database = {ref: sinon.stub()};
    firebaseApp = {database: sinon.stub()};
    firebaseApp.database.returns(database);
  });

  describe('ItemList', function() {
    let items, ref, metaRef, itemRef;

    beforeEach(function() {
      ref = {};
      metaRef = {
        once: sinon.stub(),
        transaction: sinon.stub()
      };
      itemRef = {
        once: sinon.stub(),
        transaction: sinon.stub(),
        remove: sinon.stub()
      };
      items = new datastore.ItemList(firebaseApp, uid, listId);
      database.ref.withArgs('/listItems/google:bob/grocery').returns(ref);
      database.ref.withArgs('/listItems/google:bob/grocery/bacon').returns(itemRef);
      database.ref.withArgs('/lists/google:bob/grocery').returns(metaRef);
    });

    it('should set uid property', function() {
      expect(items.uid).to.equal(uid);
    });

    it('should set listId property', function() {
      expect(items.listId).to.equal(listId);
    });

    describe('#ref', function() {

      it('should return the firebase reference to the list of items', function() {
        expect(items.ref()).to.equal(ref);
      });

      it('should throw if uid is not set', function() {
        items.uid = null;

        expect(() => items.ref()).to.throw();
        expect(database.ref).to.not.have.been.called();
      });

      it('should throw if listId is not set', function() {
        items.listId = null;

        expect(() => items.ref()).to.throw();
        expect(database.ref).to.not.have.been.called();
      });

    });

    describe('#metaRef', function() {

      it('should return the firebase reference to the list details', function() {
        expect(items.metaRef()).to.equal(metaRef);
      });

      it('should throw if uid is not set', function() {
        items.uid = null;

        expect(() => items.metaRef()).to.throw();
        expect(database.ref).to.not.have.been.called();
      });

      it('should throw if listId is not set', function() {
        items.listId = null;

        expect(() => items.metaRef()).to.throw();
        expect(database.ref).to.not.have.been.called();
      });

    });

    describe('#itemRef', function() {

      it('should return the firebase reference to a list item', function() {
        expect(items.itemRef(itemId)).to.equal(itemRef);
      });

      it('should throw if uid is not set', function() {
        items.uid = null;

        expect(() => items.itemRef()).to.throw();
        expect(database.ref).to.not.have.been.called();
      });

      it('should throw if listId is not set', function() {
        items.listId = null;

        expect(() => items.itemRef()).to.throw();
        expect(database.ref).to.not.have.been.called();
      });

    });

    describe('#create', function() {
      let snapshot;

      beforeEach(function() {
        snapshot = {exists: sinon.stub()};
        snapshot.exists.returns(false);
        metaRef.once.withArgs('value').returns(Promise.resolve(snapshot));
        metaRef.transaction.returns(Promise.resolve());
      });

      it('should create the list if it does not exist', function() {
        return items.create().then(() => {
          expect(metaRef.transaction).to.have.been.calledOnce();
          expect(metaRef.transaction).to.have.been.calledWith(sinon.match.func);

          const handler = metaRef.transaction.lastCall.args[0];

          expect(handler(null)).to.eql({createdAt: {'.sv': 'timestamp'}});
        });
      });

      it('should not create the list if it exists already', function() {
        snapshot.exists.returns(true);

        return items.create().then(() => {
          expect(metaRef.transaction).to.not.have.been.called();
        });
      });

      it('should not create the list if was created in the middle of the transaction', function() {
        snapshot.exists.returns(false);

        return items.create().then(() => {
          expect(metaRef.transaction).to.have.been.calledOnce();
          expect(metaRef.transaction).to.have.been.calledWith(sinon.match.func);

          const handler = metaRef.transaction.lastCall.args[0];

          expect(handler({createdAt: 12345})).to.be.undefined();
        });
      });

      it('should cache the result', function() {
        return items.create().then(
          () => items.create()
        ).then(
          () => expect(metaRef.once).to.have.been.calledOnce()
        );
      });

    });

    describe('#removeList', function() {
      let rootRef;

      beforeEach(function() {
        rootRef = {update: sinon.stub()};
        rootRef.update.returns(Promise.reject());
        database.ref.withArgs('/').returns(rootRef);
      });

      it('should delete the list details and its items', function() {
        items.removeList().then(() => {
          expect(rootRef.update).to.have.been.calledOnce();
          expect(rootRef.update).to.have.been.calledWith(sinon.match({
            '/lists/google:bob/grocery': null,
            '/listItems/google:bob/grocery': null
          }));
        });
      });

    });

    describe('#add', function() {
      let snapshot;

      beforeEach(function() {
        snapshot = {exists: sinon.stub()};
        snapshot.exists.returns(false);
        itemRef.once.withArgs('value').returns(Promise.resolve(snapshot));
        itemRef.transaction.returns(Promise.resolve());

        sinon.stub(items, 'create');
        items.create.returns(Promise.resolve());
      });

      it('should make sure the list exist', function() {
        return items.add(itemId).then(() => {
          expect(items.create).to.have.been.calledOnce();
        });
      });

      it('should create the item if it does not exist', function() {
        return items.add(itemId).then(() => {
          expect(itemRef.transaction).to.have.been.calledOnce();
          expect(itemRef.transaction).to.have.been.calledWith(sinon.match.func);

          const handler = itemRef.transaction.lastCall.args[0];

          expect(handler(null)).to.eql({createdAt: {'.sv': 'timestamp'}});
        });
      });

      it('should not create the item it it exists already', function() {
        snapshot.exists.returns(true);

        return items.add(itemId).then(() => {
          expect(itemRef.transaction).to.not.have.been.called();
        });
      });

      it('should not create the item if it get created in the middle of the transaction', function() {
        snapshot.exists.returns(false);

        return items.add(itemId).then(() => {
          expect(itemRef.transaction).to.have.been.calledOnce();
          expect(itemRef.transaction).to.have.been.calledWith(sinon.match.func);

          const handler = itemRef.transaction.lastCall.args[0];

          expect(handler({createdAt: 12345})).to.be.undefined();
        });

      });

    });

    describe('#remove', function() {

      beforeEach(function() {
        itemRef.remove.returns(Promise.resolve());
      });

      it('should remove and item', function() {
        return items.remove('bacon').then(
          () => expect(itemRef.remove).to.have.been.calledOnce()
        );
      });

    });

  });

  describe('User', function() {
    let user, ref, listsRef, rootRef;

    beforeEach(function() {
      rootRef = {update: sinon.stub()};
      ref = {
        once: sinon.stub(),
        transaction: sinon.stub()
      };
      listsRef = {};
      database.ref.withArgs('/').returns(rootRef);
      database.ref.withArgs('/users/google:bob').returns(ref);
      database.ref.withArgs('/lists/google:bob').returns(listsRef);
      user = new datastore.User(firebaseApp, uid);
    });

    it('should have a uid', function() {
      expect(user.uid).to.equal(uid);
    });

    it('should default the uid to null', function() {
      expect(new datastore.User(firebaseApp).uid).to.be.null();
    });

    describe('#ref', function() {

      it('should return the user details reference', function() {
        expect(user.ref()).to.equal(ref);
      });

      it('should throw if the uid is missing', function() {
        user.uid = null;

        expect(() => user.ref()).to.throw();
      });

    });

    describe('#listsRef', function() {

      it('should return the reference to the user\'s list of lists', function() {
        expect(user.listsRef()).to.equal(listsRef);
      });

      it('should throw if the uid is missing', function() {
        user.uid = null;

        expect(() => user.listsRef()).to.throw();
      });

    });

    describe('#removeList', function() {

      it('should ', function() {
        rootRef.update.returns(Promise.resolve());

        return user.removeList('grocery').then(() => {
          expect(rootRef.update).to.have.been.calledOnce();
          expect(rootRef.update).to.have.been.calledWith({
            '/lists/google:bob/grocery': null,
            '/listItems/google:bob/grocery': null
          });
        });
      });

    });

    describe('#list', function() {
      let snapshot, listRef;

      beforeEach(function() {
        listRef = {
          once: sinon.stub(),
          transaction: sinon.stub()
        };
        snapshot = {exists: sinon.stub()};
        snapshot.exists.returns(false);
        listRef.once.withArgs('value').returns(Promise.resolve(snapshot));
        listRef.transaction.returns(Promise.resolve());
        database.ref.withArgs('/lists/google:bob/grocery').returns(listRef);
      });

      it('should create the list if it does not exist', function() {
        return user.list('grocery').then(() => {
          expect(listRef.transaction).to.have.been.calledOnce();
          expect(listRef.transaction).to.have.been.calledWith(sinon.match.func);

          const handler = listRef.transaction.lastCall.args[0];

          expect(handler(null)).to.eql({createdAt: {'.sv': 'timestamp'}});
        });
      });

      it('should return an ItemList object', function() {
        return user.list('grocery').then(list => {
          expect(list).to.be.an.instanceOf(datastore.ItemList);
          expect(list.uid).to.equal(user.uid);
          expect(list.listId).to.equal('grocery');
        });
      });

    });

    describe('#register', function() {
      let snapshot;

      beforeEach(function() {
        snapshot = {exists: sinon.stub()};
        snapshot.exists.returns(false);
        ref.once.withArgs('value').returns(Promise.resolve(snapshot));
        ref.transaction.returns(Promise.resolve());
      });

      it('should save the user details (just registraction time in this example) if they do not exist', function() {
        return user.register().then(() => {
          expect(ref.once).to.have.been.calledOnce();
          expect(ref.once).to.have.been.calledWith('value');

          expect(ref.transaction).to.have.been.calledOnce();
          expect(ref.transaction).to.have.been.calledWith(sinon.match.func);

          const handler = ref.transaction.lastCall.args[0];

          expect(handler(null)).to.eql({registeredAt: {'.sv': 'timestamp'}});
        });
      });

      it('should not save the user details if they exist', function() {
        snapshot.exists.returns(true);

        return user.register().then(() => {
          expect(ref.once).to.have.been.calledOnce();
          expect(ref.once).to.have.been.calledWith('value');

          expect(ref.transaction).to.not.have.been.called();
        });
      });

      it('should not save the user details if they got created during the transaction', function() {
        snapshot.exists.returns(false);

        return user.register().then(() => {
          expect(ref.once).to.have.been.calledOnce();
          expect(ref.once).to.have.been.calledWith('value');

          expect(ref.transaction).to.have.been.calledOnce();
          expect(ref.transaction).to.have.been.calledWith(sinon.match.func);

          const handler = ref.transaction.lastCall.args[0];

          expect(handler({registeredAt: 12345})).to.be.undefined();
        });
      });

    });

  });

  describe('CurrentUser service', function() {
    let user, $log, $rootScope, eaAuth;

    beforeEach(function() {
      $log = {};
      $rootScope = {
        $on: sinon.stub(),
        $emit: sinon.spy(),
        $applyAsync: sinon.spy()
      };
      eaAuth = {
        $watch: sinon.stub(),
        signIn: sinon.stub()
      };
      user = new datastore.CurrentUser($log, $rootScope, firebaseApp, eaAuth);
    });

    testInjectMatch(datastore.CurrentUser);

    it('should be a User', function() {
      expect(user).to.be.an.instanceOf(datastore.User);
    });

    it('should watch for auth changes events', function() {
      expect(eaAuth.$watch).to.have.been.calledOnce();
      expect(eaAuth.$watch).to.have.been.calledWith(sinon.match.func);
    });

    describe('#$watch', function() {

      it('should call the listener with the current user uid', function() {
        const listener = sinon.spy();

        user.$watch(listener);

        expect(listener).to.have.been.calledOnce();
        expect(listener).to.have.been.calledWith(null, {uid: null});

        user.uid = 'google:uid';
        listener.reset();
        user.$watch(listener);

        expect(listener).to.have.been.calledOnce();
        expect(listener).to.have.been.calledWith(null, {uid: 'google:uid'});
      });

      it('should register the listener with the user event', function() {
        const listener = sinon.spy();

        user.$watch(listener);

        expect($rootScope.$on).to.have.been.calledOnce();
        expect($rootScope.$on).to.have.been.calledWith('ea.currentUser', listener);
      });

      it('should return a function to stop listening to the vent', function() {
        const listener = sinon.spy();
        const deregister = sinon.spy();

        $rootScope.$on.returns(deregister);

        expect(user.$watch(listener)).to.equal(deregister);
      });

    });

    describe('#$watchError', function() {

      it('should register the listener with the user event', function() {
        const listener = sinon.spy();

        user.$watchError(listener);

        expect($rootScope.$on).to.have.been.calledOnce();
        expect($rootScope.$on).to.have.been.calledWith('ea.currentUser.error', listener);
      });

      it('should return a function to stop listening to the vent', function() {
        const listener = sinon.spy();
        const deregister = sinon.spy();

        $rootScope.$on.returns(deregister);

        expect(user.$watchError(listener)).to.equal(deregister);
      });

    });

    describe('auth change handling', function() {
      let handler;

      beforeEach(function() {
        expect(eaAuth.$watch).to.have.been.calledWith(sinon.match.func);
        handler = eaAuth.$watch.lastCall.args[0];

        sinon.stub(user, 'register');
        user.register.returns(Promise.resolve());

        eaAuth.signIn.returns(Promise.resolve());
      });

      describe('on error', function() {

        it('should emit user change and user error events', function() {
          handler(new Error(), null);

          expect($rootScope.$emit).to.have.been.calledTwice();
          expect($rootScope.$emit).to.have.been.calledWith('ea.currentUser', {uid: null});
          expect($rootScope.$emit).to.have.been.calledWith('ea.currentUser.error');
        });

        it('should reset the user uid', function() {
          user.uid = 'google:bob';
          handler(new Error(), null);

          expect(user.uid).to.be.null();
          expect($rootScope.$applyAsync).to.have.been.calledOnce();
        });

      });

      describe('on login', function() {

        it('should emit user change ', function() {
          return handler(null, {uid: 'google:bob'}).then(() => {
            expect($rootScope.$emit).to.have.been.calledOnce();
            expect($rootScope.$emit).to.have.been.calledWith('ea.currentUser', {uid: 'google:bob'});
          });
        });

        it('should set user uid', function() {
          handler(null, {uid: 'google:bob'});
          expect(user.uid).to.equal('google:bob');
        });

        it('should apply the change to the scope only once registering is done', function() {
          const promise = handler(null, {uid: 'google:bob'});

          expect($rootScope.$applyAsync).to.not.have.been.called();

          return promise.then(
            () => expect($rootScope.$applyAsync).to.have.been.calledOnce()
          );
        });

        it('should only emit changes if the uid has changed', function() {
          return handler(null, {uid: 'google:bob'}).then(() => {
            expect($rootScope.$emit).to.have.been.calledOnce();
            $rootScope.$emit.reset();
          }).then(
            () => handler(null, {uid: 'google:bob'})
          ).then(
            () => expect($rootScope.$emit).to.not.have.been.called()
          );
        });

      });

      describe('on logout', function() {

        beforeEach(function() {
          user.uid = 'google:uid';
        });

        it('should reset the user uid', function() {
          handler(null, {uid: null});

          expect(user.uid).to.be.null();
          expect($rootScope.$applyAsync).to.have.been.calledOnce();
        });

        it('should emit user change ', function() {
          handler(null, {uid: null});

          expect($rootScope.$emit).to.have.been.calledOnce();
          expect($rootScope.$emit).to.have.been.calledWith('ea.currentUser', {uid: null});
        });

        it('should only emit changes if the uid has changed', function() {
          handler(null, {uid: null});
          expect($rootScope.$emit).to.have.been.calledOnce();
          $rootScope.$emit.reset();

          handler(null, {uid: null});
          expect($rootScope.$emit).to.not.have.been.called();
        });

        it('should start sign the user in', function() {
          return handler(null, {uid: null}).then(
            () => expect(eaAuth.signIn).to.have.been.calledOnce()
          );
        });

      });

      describe('on login and concurrent logout', function() {

        beforeEach(function() {
          user.register.returns(Promise.resolve().then(() => {
            user.uid = null;
          }));
        });

        it('should not emit user change ', function() {
          return handler(null, {uid: 'google:bob'}).then(() => {
            expect($rootScope.$emit).to.not.have.been.called();
            expect($rootScope.$applyAsync).to.not.have.been.called();
          });
        });

      });

    });

  });

});

