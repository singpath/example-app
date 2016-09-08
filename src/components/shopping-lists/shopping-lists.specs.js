import {expect, sinon} from 'example-app/tools/chai.js';

import shoppingList from './shopping-lists.js';


describe('eaShoppingLists component and helpers', function() {

  describe('component', function() {

    describe('controller', function() {
      let ctrl, stop, loading, $log, $firebaseArray, eaCurrentUser, eaLoading;

      beforeEach(function() {
        $log = {debug: sinon.spy()};

        $firebaseArray = sinon.stub();

        stop = sinon.spy();
        eaCurrentUser = {
          $watch: sinon.stub(),
          list: sinon.stub(),
          removeList: sinon.stub(),
          listsRef: sinon.stub()
        };
        eaCurrentUser.$watch.returns(stop);

        loading = {
          add: sinon.stub(),
          remove: sinon.stub(),
          error: sinon.spy()
        };
        eaLoading = sinon.stub();
        eaLoading.returns(loading);

        ctrl = new shoppingList.component.controller($log, $firebaseArray, eaCurrentUser, eaLoading);
      });

      it('should be injectable', function() {
        expect(shoppingList.component.controller).be.injectable();
      });

      it('should have a user property set to the current user', function() {
        expect(ctrl.user).to.equal(eaCurrentUser);
      });

      it('should have an lists property set to undefined', function() {
        expect(ctrl).to.have.property('lists');
      });

      it('should have a loading property set to a loading object', function() {
        expect(ctrl.loading).to.equal(loading);
      });

      it('should listen current user state changes', function() {
        expect(eaCurrentUser.$watch).to.have.been.calledOnce();
        expect(eaCurrentUser.$watch).to.have.been.calledWith(sinon.match.func);
        expect(ctrl.stopWatch).to.equal(stop);
      });

      describe('#setLists', function() {

        beforeEach(function() {
          ctrl.loading.remove.reset();
        });

        it('should set the list of shopping list', function() {
          let lists = {};

          ctrl.setLists(lists);

          expect(ctrl.lists).to.equal(lists);
        });

        it('should remove "lists" from the list of loading resources', function() {
          ctrl.setLists();
          expect(loading.remove).to.have.been.calledOnce();
          expect(loading.remove).to.have.been.calledWith('lists');
        });

        it('should destroy the current lists before setting a new one', function() {
          const prev = {$destroy: sinon.spy()};

          ctrl.lists = prev;
          ctrl.setLists();
          expect(prev.$destroy).to.have.been.calledOnce();
        });

      });

      describe('#$onDestroy', function() {

        beforeEach(function() {
          sinon.stub(ctrl, 'setLists');
        });

        it('should reset items list', function() {
          ctrl.$onDestroy();
          expect(ctrl.setLists).to.have.been.calledOnce();
          expect(ctrl.setLists).to.have.been.calledWithExactly();
        });

        it('should stop watching for current user state changes', function() {
          ctrl.$onDestroy();
          expect(ctrl.stopWatch).to.have.been.calledOnce();
        });

      });

      describe('#add', function() {

        beforeEach(function() {
          ctrl.newList = 'foo';
          ctrl.user.list.returns(Promise.resolve());
        });

        it('should reset newList', function() {
          ctrl.add('foo');
          expect(ctrl.newList).to.equal('');
        });

        it('should add the list', function() {
          return ctrl.add('foo').then(() => {
            expect(ctrl.user.list).to.have.been.calledOnce();
            expect(ctrl.user.list).to.have.been.calledWith('foo');
          });
        });

        it('should reject if there is not item name', function() {
          return ctrl.add('').then(
            () => Promise.reject(new Error('unexpected')),
            () => undefined
          );
        });

      });

      describe('#remove', function() {

        beforeEach(function() {
          ctrl.user.removeList.returns(Promise.resolve());
        });

        it('should remove the list', function() {
          return ctrl.remove('foo').then(() => {
            expect(ctrl.user.removeList).to.have.been.calledOnce();
            expect(ctrl.user.removeList).to.have.been.calledWith('foo');
          });
        });

        it('should reject if there is not list name', function() {
          return ctrl.remove('').then(
            () => Promise.reject(new Error('unexpected')),
            () => undefined
          );
        });

      });

      describe('#loadLists', function() {
        let ctx, lists, ref;

        beforeEach(function() {
          ctrl.user.uid = 'google:bob';

          ctx = {done: false};
          ctrl.loading.add.withArgs('lists').returns(ctx);

          ref = {};
          ctrl.user.listsRef.returns(ref);

          lists = {$loaded: sinon.stub(), $destroy: sinon.spy()};
          lists.$loaded.returns(Promise.resolve());
          $firebaseArray.withArgs(ref).returns(lists);

          sinon.stub(ctrl, 'setLists');
        });

        it('should add/reset "lists" in the list of loading resource', function() {
          ctrl.loadLists();
          expect(loading.add).to.have.been.calledOnce();
          expect(loading.add).to.have.been.calledWith('lists');
        });

        it('should get the list', function() {
          ctrl.loadLists();
          expect(ctrl.user.listsRef).to.have.been.calledOnce();
        });

        it('should resolve early if the user is not logged in', function() {
          ctrl.user.uid = null;

          return ctrl.loadLists().then(() => {
            expect(ctrl.user.listsRef).to.not.have.been.called();
          });
        });

        it('should load the list lists in a synchronized array', function() {
          return ctrl.loadLists().then(() => {
            expect($firebaseArray).to.have.been.calledOnce();
            expect($firebaseArray).to.have.been.calledWith(ref);
            expect(lists.$loaded).to.have.been.calledOnce();
          });
        });

        it('should set the lists with the loaded ones', function() {
          const resolved = sinon.spy();

          lists.$loaded.returns(Promise.resolve().then(resolved));

          return ctrl.loadLists().then(() => {
            expect(ctrl.setLists).to.have.been.calledOnce();
            expect(ctrl.setLists).to.have.been.calledWith(lists);
            expect(ctrl.setLists).to.have.been.calledAfter(resolved);
          });
        });

        it('should not set the lists if the loading is cancelled', function() {
          lists.$loaded = () => Promise.resolve().then(() => {
            ctx.done = true;
          });

          return ctrl.loadLists().then(() => {
            expect(ctrl.setLists).to.not.have.been.called();
            expect(lists.$destroy).to.have.been.calledOnce();
          });
        });

        it('should report the error if loading fails', function() {
          const err = new Error();

          lists.$loaded = () => Promise.reject(err);

          return ctrl.loadLists().then(() => {
            expect(loading.error).to.have.been.calledOnce();
            expect(loading.error).to.have.been.calledWith('lists', err);
          });
        });

        it('should destroy the lists if it fails', function() {
          const err = new Error();

          lists.$loaded = () => Promise.reject(err);

          return ctrl.loadLists().then(() => {
            expect(lists.$destroy).to.have.been.calledOnce();
          });
        });

      });

      describe('#onAuthChanged', function() {

        beforeEach(function() {
          ctrl.user.uid = null;
          sinon.stub(ctrl, 'setLists');
          sinon.stub(ctrl, 'loadLists');
          ctrl.loadLists.returns(Promise.resolve());
        });

        it('should reset lists', function() {
          ctrl.onAuthChanged(null, {uid: null});
          expect(ctrl.setLists).to.have.been.calledOnce();
          expect(ctrl.setLists).to.have.been.calledWithExactly();
        });

        it('should add user to list of loading resource if the user is logged off', function() {
          ctrl.onAuthChanged(null, {uid: null});
          expect(loading.add).to.have.been.calledOnce();
          expect(loading.add).to.have.been.calledWith('user');
        });

        it('should remove user to list of loading resource if the user is logged in', function() {
          ctrl.user.uid = 'google:bob';
          ctrl.onAuthChanged(null, {uid: 'google:bob'});
          expect(loading.remove).to.have.been.calledOnce();
          expect(loading.remove).to.have.been.calledWith('user');
        });

        it('should attemp to load the lists if the user is logged in', function() {
          ctrl.user.uid = 'google:bob';

          return ctrl.onAuthChanged(null, {uid: 'google:bob'}).then(() => {
            expect(ctrl.loadLists).to.have.been.calledOnce();
          });
        });

      });

    });

  });

});
