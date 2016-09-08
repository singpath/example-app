/**
 * example-app/components/shopping/shopping.js - defines eaShopping component.
 */
import template from './shopping.html!text';

/**
 * Component controller - fetch the current user items for a given shopping list.
 *
 * Expect `$onChanges` to be called each time the `listId` binding changes.
 *
 * Reset the list when the user id changes (log in/out) or when the `listId`
 * changes.
 *
 */
export class ShoppingController {

  /**
   * ShoppingController constructor
   *
   * Set properties default values (except the the binding properties while
   * supporting angular 1.5) and listen for changes to the current user status.
   *
   * Expect currentUser to give an initial call to the listener with the current
   * status.
   *
   * @param  {ng.$log}                    $log           Angular logging service
   * @param  {angularFire.$firebaseArray} $firebaseArray AngularFire synchronized array factory
   * @param  {CurrentUser}                eaCurrentUser  The current user
   * @param  {function(): Loading}        eaLoading      Loading factory service.
   */
  constructor($log, $firebaseArray, eaCurrentUser, eaLoading) {

    /**
     * Angular logging service
     * @type {ng.$log}
     * @private
     */
    this.$log = $log;

    /**
     * AngularFire synchronized array factory.
     * @type {angularFire.FirebaseArray}
     * @private
     */
    this.$firebaseArray = $firebaseArray;

    /**
     * tracking loading resources
     * @type {Loading}
     * @private
     */
    this.loading = eaLoading();

    /**
     * Current user.
     * @type {CurrentUser}
     */
    this.user = eaCurrentUser;

    /**
     * Synchronised array holding the items.
     * @type {angularFire.FirebaseArray}
     */
    this.items = undefined;

    /**
     * Cached items manganer
     * @type {ItemList}
     * @private
     */
    this.$list = undefined;

    /**
     * Placeholder for a new item.
     *
     * Should be reset when new item is added.
     *
     * @type {String}
     */
    this.newItem = '';

    /**
     * Stop watching for
     * @type {function}
     * @private
     */
    this.stopWatch = this.user.$watch(this.onAuthChanged.bind(this));
  }

  /**
   * Set items and destroy the previous one.
   * @param {angularFire.FirebaseArray} items New array of items.
   */
  setItems(items) {
    this.loading.remove('items');

    if (this.items && this.items.$destroy) {
      this.items.$destroy();
    }

    this.items = items;
  }

  /**
   * Angular hook called when the component is destroyed.
   *
   * Reset list of item and stop watching the user status.
   *
   * @see https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks
   */
  $onDestroy() {
    this.stopWatch();
    this.setItems();
    this.$list = undefined;
    this.$log.debug('ShoppingController component destroyed');
  }

  /**
   * Add an item to the list.
   *
   * @param {string} name Name of the item (will be its ID too).
   * @return {Promise<void,Error>}
   */
  add(name) {
    if (!name) {
      return Promise.reject(new Error('A name is required'));
    }

    if (!this.$list) {
      return Promise.reject(new Error('The list is not loaded.'));
    }

    this.newItem = '';

    return this.$list.add(name);
  }

  /**
   * Remove item from the list.
   *
   * @param {string} name Name of the item (will be its ID too).
   * @return {Promise<void,Error>}
   */
  remove(name) {
    if (!name) {
      return Promise.reject(new Error('A name is required'));
    }

    if (!this.$list) {
      return Promise.reject(new Error('The list is not loaded.'));
    }

    return this.$list.remove(name);
  }

  /**
   * Angular hook trigger each time one or more component binding changes.
   *
   * Should reset the list of the items and attempt to load new one.
   *
   * @see https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks
   * @param  {object}    changes List of changes.
   * @return {Promise<void,Error>}
   */
  $onChanges(changes) {
    if (!this.listId) {
      this.loading.error('items', new Error('"listId" is a required attribute.'));
    }

    if (!changes.listId) {
      return Promise.resolve();
    }

    this.setItems();
    this.$list = undefined;

    return this.loadItems();
  }

  /**
   * Current User changes handler.
   *
   * Should reset the list and either track the user signing or load the items.
   *
   * @return {Promise<void,Error>}
   */
  onAuthChanged() {
    const isLoggedIn = this.user && this.user.uid;

    this.setItems();
    this.$list = undefined;

    if (!isLoggedIn) {
      this.loading.add('user');

      return Promise.resolve();
    }

    this.loading.remove('user');

    return this.loadItems();
  }

  /**
   * load and update the list of item.
   *
   * Should set "items" resource as loading while loading the list and abort
   * if a new loading process start.
   *
   * @return {Promise<void,Error>}
   */
  loadItems() {
    const ctx = this.loading.add('items');

    ctx.uid = this.user && this.user.uid;
    ctx.listId = this.listId;

    if (!ctx.listId || !ctx.uid) {
      return Promise.resolve();
    }

    return this.user.list(ctx.listId).then(list => {
      if (ctx.done) {
        return undefined;
      }

      ctx.$list = list;
      ctx.items = this.$firebaseArray(list.ref());

      return ctx.items.$loaded();
    }).then(() => {
      if (!ctx.done) {
        this.$list = ctx.$list;
        this.setItems(ctx.items);

        return;
      }

      if (ctx.items) {
        ctx.items.$destroy();
      }
    }).catch(err => {
      this.loading.error('items', err);

      if (ctx.items && this.items !== ctx.items) {
        ctx.items.$destroy();
      }
    });
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
ShoppingController.$inject = ['$log', '$firebaseArray', 'eaCurrentUser', 'eaLoading'];

/**
 * eaShopping component definition
 * @type {ng.directiveDefinition}
 * @private
 */
export const component = {
  template,
  bindings: {listId: '<'},
  controller: ShoppingController
};

/**
 * eaShopping component definition and related services/directives/filters.
 * @type {{component: ng.directiveDefinition}}
 */
const shopping = {component};

export default shopping;
