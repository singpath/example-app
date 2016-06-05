/**
 * example-app/components/shopping-lists/shopping-lists.js - defines the
 * eaShoppingLists component.
 */
import template from './shopping-lists.html!text';

/**
 * Component controller - should provide the shopping lists to the view.
 *
 */
class Controller {

  constructor(eaLists) {
    this._lists = eaLists;
    this.lists = [];
    this.newList = '';

    this.refreshList();
  }

  refreshList() {
    this.lists = this._lists.getLists();
  }

  add(name) {
    this._lists.create(name);
    this.newList = '';
    this.refreshList();

  }

  remove(name) {
    this._lists.remove(name);
    this.refreshList();
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
Controller.$inject = ['eaLists'];

export const component = {template, controller: Controller};
