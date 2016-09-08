import {expect, sinon} from 'example-app/tools/chai.js';

import shopping from './shopping.js';


describe('eaShopping component and helpers', function() {

  describe('component', function() {

    describe('controller', function() {
      let ctrl, stop, loading, $log, $firebaseArray, eaCurrentUser, eaLoading;

      beforeEach(function() {
        $log = {debug: sinon.spy()};

        $firebaseArray = sinon.stub();

        stop = sinon.spy();
        eaCurrentUser = {
          $watch: sinon.stub(),
          list: sinon.stub()
        };
        eaCurrentUser.$watch.returns(stop);

        loading = {
          add: sinon.stub(),
          remove: sinon.stub(),
          error: sinon.spy()
        };
        eaLoading = sinon.stub();
        eaLoading.returns(loading);

        ctrl = new shopping.component.controller($log, $firebaseArray, eaCurrentUser, eaLoading);
      });

      it('should be injectable', function() {
        expect(shopping.component.controller).be.injectable();
      });

      it('should have a user property set to the current user', function() {
        expect(ctrl.user).to.equal(eaCurrentUser);
      });

      it('should have an items property set to undefined', function() {
        expect(ctrl).to.have.property('items');
      });

      it('should have a loading property set to a loading object', function() {
        expect(ctrl.loading).to.equal(loading);
      });

      it('should listen current user state changes', function() {
        expect(eaCurrentUser.$watch).to.have.been.calledOnce();
        expect(eaCurrentUser.$watch).to.have.been.calledWith(sinon.match.func);
        expect(ctrl.stopWatch).to.equal(stop);
      });

      it('should not set the listId property while supporting Angular 1.5.8 and below', function() {

        // In angular 1.5, ctrl are instantiate in the following order:
        //
        // - create an object with __proto__ set to the component controller;
        // - set the component attributes (listed in the component binding
        // property) on that object;
        // - apply the controller constructor on that object;
        // - call $onChange to notify the binding initial value;
        // - call $onInit;
        //
        // This order is compatible with angular 1.4 but confusing. It will be
        // configurable in angular 1.5.9 (to set the binding value after
        // the constructor is called - it also allow to just use
        // `new component.Controller()`), and off by default in angular 1.6.
        //
        // Because we are just using `new` to create the controller, controller
        // must not touch any properties receiving a binding value.
        //
        expect(ctrl).to.not.have.property('listId');
      });

      describe('#setItems', function() {

        beforeEach(function() {
          ctrl.loading.remove.reset();
        });

        it('should set the item list', function() {
          let items = {};

          ctrl.setItems(items);

          expect(ctrl.items).to.equal(items);
        });

        it('should remove the "items" from the list of loading resources', function() {
          ctrl.setItems();
          expect(loading.remove).to.have.been.calledOnce();
          expect(loading.remove).to.have.been.calledWith('items');
        });

        it('should destroy the current list of items before setting a new one', function() {
          const prev = {$destroy: sinon.spy()};

          ctrl.items = prev;
          ctrl.setItems();
          expect(prev.$destroy).to.have.been.calledOnce();
        });

      });

      describe('#$onDestroy', function() {

        beforeEach(function() {
          sinon.stub(ctrl, 'setItems');
        });

        it('should reset items list (and cached ItemList object)', function() {
          ctrl.$onDestroy();
          expect(ctrl.setItems).to.have.been.calledOnce();
          expect(ctrl.setItems).to.have.been.calledWithExactly();
          expect(ctrl.$list).to.be.undefined();
        });

        it('should stop watching for current user state changes', function() {
          ctrl.$onDestroy();
          expect(ctrl.stopWatch).to.have.been.calledOnce();
        });

      });

      describe('#add', function() {

        beforeEach(function() {
          ctrl.$list = {add: sinon.stub()};
          ctrl.$list.add.returns(Promise.resolve());
        });

        it('should reset newItem', function() {
          ctrl.add('foo');
          expect(ctrl.newItem).to.equal('');
        });

        it('should add the list', function() {
          return ctrl.add('foo').then(() => {
            expect(ctrl.$list.add).to.have.been.calledOnce();
            expect(ctrl.$list.add).to.have.been.calledWith('foo');
          });
        });

        it('should reject if there is not item name', function() {
          return ctrl.add('').then(
            () => Promise.reject(new Error('unexpected')),
            () => undefined
          );
        });

        it('should reject if there is not item name', function() {
          ctrl.$list = undefined;

          return ctrl.add('foo').then(
            () => Promise.reject(new Error('unexpected')),
            () => undefined
          );
        });

      });

      describe('#remove', function() {

        beforeEach(function() {
          ctrl.$list = {remove: sinon.stub()};
          ctrl.$list.remove.returns(Promise.resolve());
        });

        it('should remove the list', function() {
          return ctrl.remove('foo').then(() => {
            expect(ctrl.$list.remove).to.have.been.calledOnce();
            expect(ctrl.$list.remove).to.have.been.calledWith('foo');
          });
        });

        it('should reject if there is not item name', function() {
          return ctrl.remove('').then(
            () => Promise.reject(new Error('unexpected')),
            () => undefined
          );
        });

        it('should reject if there is the list cache is missing', function() {
          ctrl.$list = undefined;

          return ctrl.remove('foo').then(
            () => Promise.reject(new Error('unexpected')),
            () => undefined
          );
        });

      });

      describe('#loadItems', function() {
        let ctx, list, ref, items;

        beforeEach(function() {
          ctrl.user.uid = 'google:bob';
          ctrl.listId = 'grocery';

          ctx = {done: false};
          ctrl.loading.add.withArgs('items').returns(ctx);

          ref = {};
          list = {ref: sinon.stub()};
          list.ref.returns(ref);
          ctrl.user.list.withArgs('grocery').returns(Promise.resolve(list));

          items = {$loaded: sinon.stub(), $destroy: sinon.spy()};
          items.$loaded.returns(Promise.resolve());
          $firebaseArray.withArgs(ref).returns(items);

          sinon.stub(ctrl, 'setItems');
        });

        it('should add/reset "items" in the list of loading resource', function() {
          ctrl.loadItems();
          expect(loading.add).to.have.been.calledOnce();
          expect(loading.add).to.have.been.calledWith('items');
        });

        it('should get the list', function() {
          return ctrl.loadItems().then(() => {
            expect(ctrl.user.list).to.have.been.calledOnce();
            expect(ctrl.user.list).to.have.been.calledWith('grocery');
          });
        });

        it('should resolve early if the user is not logged in', function() {
          ctrl.user.uid = null;

          return ctrl.loadItems().then(() => {
            expect(ctrl.user.list).to.not.have.been.called();
          });
        });

        it('should resolve early if the listId is missing', function() {
          ctrl.listId = undefined;

          return ctrl.loadItems().then(() => {
            expect(ctrl.user.list).to.not.have.been.called();
          });
        });

        it('should load the list items in a synchronized array', function() {
          return ctrl.loadItems().then(() => {
            expect($firebaseArray).to.have.been.calledOnce();
            expect($firebaseArray).to.have.been.calledWith(ref);
            expect(items.$loaded).to.have.been.calledOnce();
          });
        });

        it('should not load the list items if the loading is cancelled', function() {
          ctrl.user.list = () => {
            return Promise.resolve(list).then(() => {
              ctx.done = true;
            });
          };

          return ctrl.loadItems().then(() => {
            expect($firebaseArray).to.not.have.been.called();
          });
        });

        it('should set the items with the loaded ones', function() {
          const resolved = sinon.spy();

          items.$loaded.returns(Promise.resolve().then(resolved));

          return ctrl.loadItems().then(() => {
            expect(ctrl.$list).to.equal(list);
            expect(ctrl.setItems).to.have.been.calledOnce();
            expect(ctrl.setItems).to.have.been.calledWith(items);
            expect(ctrl.setItems).to.have.been.calledAfter(resolved);
          });
        });

        it('should not set the items if the loading is cancelled', function() {
          items.$loaded = () => {
            ctx.done = true;
          };

          return ctrl.loadItems().then(() => {
            expect(ctrl.$list).to.equal(undefined);
            expect(ctrl.setItems).to.not.have.been.called();
            expect(items.$destroy).to.have.been.calledOnce();
          });
        });

        it('should report the error if loading fails', function() {
          const err = new Error();

          ctrl.user.list = () => Promise.reject(err);

          return ctrl.loadItems().then(() => {
            expect(loading.error).to.have.been.calledOnce();
            expect(loading.error).to.have.been.calledWith('items', err);
          });
        });

        it('should destroy the items if it fails', function() {
          const err = new Error();

          items.$loaded = () => Promise.reject(err);

          return ctrl.loadItems().then(() => {
            expect(items.$destroy).to.have.been.calledOnce();
          });
        });

      });

      describe('#$onChanges', function() {

        beforeEach(function() {
          ctrl.listId = 'grocery';
          ctrl.$list = {};
          sinon.stub(ctrl, 'setItems');
          sinon.stub(ctrl, 'loadItems');
          ctrl.loadItems.returns(Promise.resolve());
        });

        it('should reset items', function() {
          ctrl.$onChanges({listId: {}});
          expect(ctrl.setItems).to.have.been.calledOnce();
          expect(ctrl.setItems).to.have.been.calledWithExactly();
          expect(ctrl.$list).to.be.undefined();
        });

        it('should attemp to load the items', function() {
          return ctrl.$onChanges({listId: {}}).then(() => {
            expect(ctrl.loadItems).to.have.been.calledOnce();
          });
        });

        it('should report a loading error if listId is empty', function() {
          ctrl.listId = '';
          ctrl.$onChanges({listId: {}});
          expect(loading.error).to.have.calledOnce();
          expect(loading.error).to.have.calledWith('items');
        });

        it('should resolve early if listId has not changed', function() {
          return ctrl.$onChanges({}).then(() => {
            expect(ctrl.setItems).to.not.have.been.called();
            expect(ctrl.$list).to.not.be.undefined();
            expect(loading.error).to.not.have.called();
          });
        });

      });

      describe('#onAuthChanged', function() {

        beforeEach(function() {
          ctrl.user.uid = null;
          ctrl.$list = {};
          sinon.stub(ctrl, 'setItems');
          sinon.stub(ctrl, 'loadItems');
          ctrl.loadItems.returns(Promise.resolve());
        });

        it('should reset items', function() {
          ctrl.onAuthChanged(null, {uid: null});
          expect(ctrl.setItems).to.have.been.calledOnce();
          expect(ctrl.setItems).to.have.been.calledWithExactly();
          expect(ctrl.$list).to.be.undefined();
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

        it('should attemp to load the items if the user is logged in', function() {
          ctrl.user.uid = 'google:bob';

          return ctrl.onAuthChanged(null, {uid: 'google:bob'}).then(() => {
            expect(ctrl.loadItems).to.have.been.calledOnce();
          });
        });

      });

    });

  });

});
