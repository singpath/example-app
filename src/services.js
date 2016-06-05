/**
 * example-app/service.js - Business domain for this app.
 */

/**
 * Manage shopping lists
 */
export class Lists {

  constructor() {
    this.lists = {};
  }

  getLists() {
    return Object.keys(this.lists).sort();
  }

  getListById(name) {
    let list = this.lists[name];

    if (!list) {
      list = this.lists[name] = [];
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

  create(name) {
    if (this.lists[name]) {
      return;
    }

    this.lists[name] = [];

    return this.lists[name];
  }

  remove(name) {
    delete this.lists[name];
  }

}

Lists.$inject = [];
