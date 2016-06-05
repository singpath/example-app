/**
 * example-app/service.js - Business domain for this app.
 */

/**
 * Manage shopping lists
 */
export class Lists {

  constructor() {
    this._lists = {};
  }

  /**
   * Return the lists names.
   *
   * The list is sorted.
   *
   * @return {array}
   */
  getLists() {
    return Object.keys(this._lists).sort();
  }

  /**
   * Return a sorted list.
   *
   * If the list that name does not exist it creates it.
   *
   * The list will include `add` and `remove` methods. Items added directly
   * to list might not get saved and won't keep the list in order.
   *
   * @param  {string} name
   * @return {array}
   */
  getListById(name) {
    let list = this._lists[name];

    if (!list) {
      list = this._lists[name] = [];
    }

    list.add = item => {
      if (list.indexOf(item) > -1) {
        return;
      }

      list.push(item);
      list.sort();
    };

    list.remove = item => {
      const index = list.indexOf(item);

      if (index > -1) {
        list.splice(index, 1);
      }
    };

    return list;
  }

  /**
   * Create a new list.
   *
   * @param {name} name
   */
  create(name) {
    if (this._lists[name]) {
      return;
    }

    this._lists[name] = [];

    return this._lists[name];
  }

  remove(name) {
    delete this._lists[name];
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
Lists.$inject = [];
