import template from './shopping.html!text';

class Controller {

  constructor(eaLists) {
    this._eaLists = eaLists;

    this.shopping = [];
    this.newItem = '';
  }

  /**
   * Handle initial shopping list load.
   *
   * $onInit is an Angular controller hook. It's called after the constructor
   * call and after the binding of component properties (`listId` in that case)
   * to the controller instance.
   *
   * Note: the bound component properties are accessible in the constructor
   * in Angular 1.5, but it's a deprecated feature; you cannot assuming the
   * binding preceeds the constructor call.
   */
  $onInit() {
    this.shopping = this._eaLists.getListById(this.listId);
  }

  /**
   * Add an item to the list and reset the newItem property.
   *
   * @param {string} item
   */
  add(item) {
    this.shopping.add(item);
    this.newItem = '';
  }

  /**
   * Remove the item from the list.
   *
   * @param  {string} item
   */
  remove(item) {
    this.shopping.remove(item);
  }

}

Controller.$inject = ['eaLists'];

export const component = {
  template,
  bindings: {
    listId: '<'
  },
  controller: Controller
};
