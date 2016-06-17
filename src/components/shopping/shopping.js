import template from './shopping.html!text';

/**
 * Component controller - provide the shopping list items observable to the
 * view.
 *
 */
class ShoppingController {

  constructor(eaLists) {
    this._eaLists = eaLists;

    this.shopping = undefined;
    this.newItem = '';
  }

  /**
   * Triggered each time a binding (element attributes bound to the controller
   * instance) is changes.
   *
   * Triggered when this.listId is set or changed.
   *
   */
  $onChanges(changes) {
    if (!changes.listId) {
      return;
    }

    if (!this.listId) {
      this.list = null;
      this.shopping = null;
      return;
    }

    this.list = this._eaLists.shoppingList(this.listId);
    this.shopping = this.list.items();
  }

  /**
   * Add an item to the list and reset the newItem property.
   *
   * @param {string} item
   */
  add(item) {
    this.list.add(item);
    this.newItem = '';
  }

  /**
   * Remove the item from the list.
   *
   * @param  {string} item
   */
  remove(item) {
    this.list.remove(item);
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
ShoppingController.$inject = ['eaLists'];

export const component = {
  template,
  bindings: {
    listId: '<'
  },
  controller: ShoppingController
};
