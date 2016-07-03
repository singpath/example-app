import {expect, sinon, testInjectMatch} from 'example-app/tools/chai.js';
import Rx from 'example-app/tools/rx.js';

import {component} from './shopping-item.js';

describe('eaShoppingItem component', function() {

  describe('controller', function() {
    let ctrl, shoppingListsService, list, details;

    beforeEach(function() {
      details = new Rx.Subject();
      list = {itemDetails: sinon.stub()};
      list.itemDetails.withArgs('bread').returns(details);

      shoppingListsService = {shoppingList: sinon.stub()};
      shoppingListsService.shoppingList.withArgs('grocery').returns(list);

      ctrl = new component.controller(shoppingListsService);
      ctrl.listId = 'grocery';
      ctrl.itemId = 'bread';
      ctrl.$onChanges({
        listId: {},
        itemId: {}
      });
    });

    testInjectMatch(component.controller);

    it('should set list service', function() {
      expect(ctrl.list).to.equal(list);
    });

    it('should set item observable', function() {
      expect(ctrl.item).to.equal(details);
    });

    it('should reset list on listId change', function() {
      const xmasBreadDetails = new Rx.Subject();
      const xmasList = {itemDetails: sinon.stub().withArgs('bread').returns(xmasBreadDetails)};

      shoppingListsService.shoppingList.withArgs('xmas').returns(xmasList);
      ctrl.listId = 'xmas';

      ctrl.$onChanges({listId: {}});

      expect(ctrl.list).to.equal(xmasList);
      expect(ctrl.item).to.equal(xmasBreadDetails);
    });

    it('should set list to undefined if list id is missing', function() {
      ctrl.listId = undefined;
      ctrl.$onChanges({listId: {}});

      expect(ctrl.list).to.equal(undefined);
      expect(ctrl.item).to.equal(undefined);
    });

    it('should set item to undefined if item id is missing', function() {
      ctrl.itemId = undefined;
      ctrl.$onChanges({itemId: {}});

      expect(ctrl.list).to.equal(list);
      expect(ctrl.item).to.equal(undefined);
    });

  });

});
