import {expect, sinon} from 'example-app/tools/chai.js';

import shoppingItem from './shopping-item.js';


describe('eaShoppingItem component and helpers', function() {

  describe('component', function() {

    describe('controller', function() {
      let ctrl, stop, loading, $log, $firebaseObject, eaCurrentUser, eaLoading;

      beforeEach(function() {
        $log = {debug: sinon.spy()};

        $firebaseObject = sinon.stub();

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

        ctrl = new shoppingItem.component.controller($log, $firebaseObject, eaCurrentUser, eaLoading);
      });

      it('should be injectable', function() {
        expect(shoppingItem.component.controller).be.injectable();
      });

      it('should have a user property set to the current user', function() {
        expect(ctrl.user).to.equal(eaCurrentUser);
      });

      it('should have an item property set to undefined', function() {
        expect(ctrl).to.have.property('item');
      });

      it('should have a loading property set to a loading object', function() {
        expect(ctrl.loading).to.equal(loading);
      });

      it('should listen current user state changes', function() {
        expect(eaCurrentUser.$watch).to.have.been.calledOnce();
        expect(eaCurrentUser.$watch).to.have.been.calledWith(sinon.match.func);
        expect(ctrl.stopWatch).to.equal(stop);
      });

      it('should not set the listId and itemId property while supporting Angular 1.5.8 and below', function() {

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
        expect(ctrl).to.not.have.property('itemId');
      });

      describe('#setItem', function() {

        beforeEach(function() {
          ctrl.loading.remove.reset();
        });

        it('should set the item details', function() {
          let item = {};

          ctrl.setItem(item);

          expect(ctrl.item).to.equal(item);
        });

        it('should remove the "item" from the list of loading resources', function() {
          ctrl.setItem();
          expect(loading.remove).to.have.been.calledOnce();
          expect(loading.remove).to.have.been.calledWith('item');
        });

        it('should destroy the current item before setting a new one', function() {
          const prev = {$destroy: sinon.spy()};

          ctrl.item = prev;
          ctrl.setItem();
          expect(prev.$destroy).to.have.been.calledOnce();
        });

      });

      describe('#$onDestroy', function() {

        beforeEach(function() {
          sinon.stub(ctrl, 'setItem');
        });

        it('should reset the item', function() {
          ctrl.$onDestroy();
          expect(ctrl.setItem).to.have.been.calledOnce();
          expect(ctrl.setItem).to.have.been.calledWithExactly();
        });

        it('should stop watching for current user state changes', function() {
          ctrl.$onDestroy();
          expect(ctrl.stopWatch).to.have.been.calledOnce();
        });

      });

      describe('#loadItem', function() {
        let ctx, list, ref, item;

        beforeEach(function() {
          ctrl.user.uid = 'google:bob';
          ctrl.listId = 'grocery';
          ctrl.itemId = 'bacon';

          ctx = {done: false};
          ctrl.loading.add.withArgs('item').returns(ctx);

          ref = {};
          list = {itemRef: sinon.stub()};
          list.itemRef.returns(ref);
          ctrl.user.list.withArgs('grocery').returns(Promise.resolve(list));

          item = {$loaded: sinon.stub(), $destroy: sinon.spy()};
          item.$loaded.returns(Promise.resolve);
          $firebaseObject.withArgs(ref).returns(item);

          sinon.stub(ctrl, 'setItem');
        });

        it('should add/reset "item" in the list of loading resource', function() {
          ctrl.loadItem();
          expect(loading.add).to.have.been.calledOnce();
          expect(loading.add).to.have.been.calledWith('item');
        });

        it('should get the list', function() {
          return ctrl.loadItem().then(() => {
            expect(ctrl.user.list).to.have.been.calledOnce();
            expect(ctrl.user.list).to.have.been.calledWith('grocery');
          });
        });

        it('should resolve early if the user is not logged in', function() {
          ctrl.user.uid = null;

          return ctrl.loadItem().then(() => {
            expect(ctrl.user.list).to.not.have.been.called();
          });
        });

        it('should resolve early if the listId is missing', function() {
          ctrl.listId = undefined;

          return ctrl.loadItem().then(() => {
            expect(ctrl.user.list).to.not.have.been.called();
          });
        });

        it('should resolve early if the itemId is missing', function() {
          ctrl.itemId = undefined;

          return ctrl.loadItem().then(() => {
            expect(ctrl.user.list).to.not.have.been.called();
          });
        });

        it('should load the list item in a synchronized array', function() {
          return ctrl.loadItem().then(() => {
            expect($firebaseObject).to.have.been.calledOnce();
            expect($firebaseObject).to.have.been.calledWith(ref);
            expect(item.$loaded).to.have.been.calledOnce();
          });
        });

        it('should not load the list item if the loading is cancelled', function() {
          ctrl.user.list = () => {
            return Promise.resolve(list).then(() => {
              ctx.done = true;
            });
          };

          return ctrl.loadItem().then(() => {
            expect($firebaseObject).to.not.have.been.called();
          });
        });

        it('should set the item with the loaded ones', function() {
          const resolved = sinon.spy();

          item.$loaded = () => Promise.resolve().then(resolved);

          return ctrl.loadItem().then(() => {
            expect(ctrl.setItem).to.have.been.calledOnce();
            expect(ctrl.setItem).to.have.been.calledWith(item);
            expect(ctrl.setItem).to.have.been.calledAfter(resolved);
          });
        });

        it('should not set the item if the loading is cancelled', function() {
          item.$loaded = () => {
            ctx.done = true;
          };

          return ctrl.loadItem().then(() => {
            expect(ctrl.setItem).to.not.have.been.called();
            expect(item.$destroy).to.have.been.calledOnce();
          });
        });

        it('should report the error if loading fails', function() {
          const err = new Error();

          ctrl.user.list = () => Promise.reject(err);

          return ctrl.loadItem().then(() => {
            expect(loading.error).to.have.been.calledOnce();
            expect(loading.error).to.have.been.calledWith('item', err);
          });
        });

        it('should destroy the item if it fails', function() {
          const err = new Error();

          item.$loaded = () => Promise.reject(err);

          return ctrl.loadItem().then(() => {
            expect(item.$destroy).to.have.been.calledOnce();
          });
        });

      });

      describe('#$onChanges', function() {

        beforeEach(function() {
          ctrl.listId = 'grocery';
          ctrl.itemId = 'bacon';
          sinon.stub(ctrl, 'setItem');
          sinon.stub(ctrl, 'loadItem');
          ctrl.loadItem.returns(Promise.resolve());
        });

        it('should reset item if listId has changed', function() {
          ctrl.$onChanges({listId: {}});
          expect(ctrl.setItem).to.have.been.calledOnce();
          expect(ctrl.setItem).to.have.been.calledWithExactly();
        });

        it('should reset item if itemId has changed', function() {
          ctrl.$onChanges({itemId: {}});
          expect(ctrl.setItem).to.have.been.calledOnce();
          expect(ctrl.setItem).to.have.been.calledWithExactly();
        });

        it('should attemp to load the item if listId has changed', function() {
          return ctrl.$onChanges({listId: {}}).then(() => {
            expect(ctrl.loadItem).to.have.been.calledOnce();
          });
        });

        it('should attemp to load the item if itemId has changed', function() {
          return ctrl.$onChanges({itemId: {}}).then(() => {
            expect(ctrl.loadItem).to.have.been.calledOnce();
          });
        });

        it('should resolve early if listId and itemId have not changed', function() {
          return ctrl.$onChanges({}).then(() => {
            expect(ctrl.setItem).to.not.have.been.called();
            expect(loading.error).to.not.have.called();
          });
        });

        it('should report a loading error if listId is empty', function() {
          ctrl.listId = '';
          ctrl.$onChanges({listId: {}, itemId: {}});
          expect(loading.error).to.have.calledOnce();
          expect(loading.error).to.have.calledWith('item');
        });

        it('should report a loading error if itemId is empty', function() {
          ctrl.itemId = '';
          ctrl.$onChanges({itemId: {}});
          expect(loading.error).to.have.calledOnce();
          expect(loading.error).to.have.calledWith('item');
        });

      });

      describe('#onAuthChanged', function() {

        beforeEach(function() {
          ctrl.user.uid = null;
          sinon.stub(ctrl, 'setItem');
          sinon.stub(ctrl, 'loadItem');
          ctrl.loadItem.returns(Promise.resolve());
        });

        it('should reset item', function() {
          ctrl.onAuthChanged(null, {uid: null});
          expect(ctrl.setItem).to.have.been.calledOnce();
          expect(ctrl.setItem).to.have.been.calledWithExactly();
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

        it('should attemp to load the item if the user is logged in', function() {
          ctrl.user.uid = 'google:bob';

          return ctrl.onAuthChanged(null, {uid: 'google:bob'}).then(() => {
            expect(ctrl.loadItem).to.have.been.calledOnce();
          });
        });

      });

    });

  });

});
