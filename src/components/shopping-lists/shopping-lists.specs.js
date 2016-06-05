import sinon from 'sinon';
import {expect} from 'chai';
import {testInjectMatch} from 'example-app/tools/inspect.js';

import {component} from './shopping-lists.js';

describe('eaShoppingList component', function() {

  describe('controller', function() {
    let ctrl, shoppingListsService, lists;

    beforeEach(function() {
      // The lists our service will provide.
      lists = [];

      // The lists service stub
      shoppingListsService = {
        getLists: sinon.stub().returns(lists),
        create: sinon.spy(),
        remove: sinon.spy()
      };

      // The controller, instanciated with its dependencies.
      ctrl = new component.controller(shoppingListsService);
    });

    testInjectMatch(component.controller);

    it('should load the list of shopping list.', function() {
      expect(shoppingListsService.getLists).to.have.been.calledOnce;
      expect(ctrl.lists).to.equal(lists);
    });

    describe('add', function() {

      it('should create a new list', function() {
        ctrl.add('grocery');
        expect(shoppingListsService.create).to.have.been.calledOnce;
        expect(shoppingListsService.create).to.have.been.calledWith('grocery');
      });

      it('should refresh the list', function() {
        const refreshedLists = ['grocery'];

        shoppingListsService.getLists.returns(refreshedLists);
        ctrl.add('grocery');
        expect(ctrl.lists).to.equal(refreshedLists);
      });

    });

    describe('remove', function() {

      it('should remote a list', function() {
        ctrl.remove('grocery');
        expect(shoppingListsService.remove).to.have.been.calledOnce;
        expect(shoppingListsService.remove).to.have.been.calledWith('grocery');
      });

      it('should refresh the list', function() {
        const refreshedLists = [];

        shoppingListsService.getLists.returns(refreshedLists);
        ctrl.remove('grocery');
        expect(ctrl.lists).to.equal(refreshedLists);
      });

    });

  });

});
