import {expect, sinon, testInjectMatch} from 'example-app/tools/chai.js';
import Rx from 'example-app/tools/rx.js';

import {component} from './shopping.js';

describe('eaShopping component', function() {

  describe('controller', function() {
    let ctrl, shoppingListsService, list, shopping;

    beforeEach(function() {

      // The shopping list Observable our service will provide.
      shopping = new Rx.Subject();
      list = {
        items: sinon.stub().returns(shopping),
        add: sinon.spy(),
        remove: sinon.spy()
      };

      // The lists service stub
      shoppingListsService = {shoppingList: sinon.stub().withArgs('grocery').returns(list)};

      // The controller, instanciated with its dependencies.
      ctrl = new component.controller(shoppingListsService);
      ctrl.listId = 'grocery';
      ctrl.$onChanges({listId: {}});
    });

    testInjectMatch(component.controller);

    it('should load the shopping list.', function() {
      expect(ctrl.list).to.equal(list);
      expect(ctrl.shopping).to.equal(shopping);
    });

    describe('add', function() {

      it('should add a new item', function() {
        ctrl.add('bread');
        expect(list.add).to.have.been.calledOnce();
        expect(list.add).to.have.been.calledWith('bread');
      });

    });

    describe('remove', function() {

      it('should remove a new list', function() {
        ctrl.remove('bread');
        expect(list.remove).to.have.been.calledOnce();
        expect(list.remove).to.have.been.calledWith('bread');
      });

    });

  });

});
