import sinon from 'sinon';
import {expect} from 'chai';
import {testInjectMatch} from 'example-app/tools/inspect.js';

import {component} from './shopping.js';

describe('eaShopping component', function() {

  describe('controller', function() {
    let ctrl, shoppingListsService, shopping;

    beforeEach(function() {
      // The lists our service will provide.
      shopping = [];
      shopping.add = sinon.spy();
      shopping.remove = sinon.spy();

      // The lists service stub
      shoppingListsService = {
        getListById: sinon.stub().returns(shopping)
      };

      // The controller, instanciated with its dependencies.
      ctrl = new component.controller(shoppingListsService);
      ctrl.listId = 'grocery';
      ctrl.$onInit();
    });

    testInjectMatch(component.controller);

    it('should load the shopping list.', function() {
      expect(shoppingListsService.getListById).to.have.been.calledOnce;
      expect(shoppingListsService.getListById).to.have.been.calledWith(ctrl.listId);
      expect(ctrl.shopping).to.equal(shopping);
    });

    describe('add', function() {

      it('should add a new item', function() {
        ctrl.add('bread');
        expect(shopping.add).to.have.been.calledOnce;
        expect(shopping.add).to.have.been.calledWith('bread');
      });

    });

    describe('remove', function() {

      it('should remove a new list', function() {
        ctrl.remove('bread');
        expect(shopping.remove).to.have.been.calledOnce;
        expect(shopping.remove).to.have.been.calledWith('bread');
      });

    });

  });

});
