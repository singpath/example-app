/**
 * example-app/components/shopping-lists/shopping-lists.js - defines the
 * eaShoppingLists component.
 */
import template from './shopping-lists.html!text';

/**
 * Component controller - should provide the shopping lists observable to the
 * view.
 *
 */
class ShoppingListsController {

  constructor(eaLists) {
    this._lists = eaLists;

    this.lists = undefined;
    this.newList = '';

    this.lists = this._lists.all();
  }

  /**
   * Create a new list.
   *
   * @param {string} name list name.
   */
  add(name) {
    this._lists.create(name);
    this.newList = '';
  }

  /**
   * Delete a list.
   *
   * @param {string} name list name.
   */
  remove(name) {
    this._lists.remove(name);
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
ShoppingListsController.$inject = ['eaLists'];

export const component = {
  template,
  controller: ShoppingListsController
};
