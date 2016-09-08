/**
 * example-app/components/shopping-lists/shopping-lists.js - defines the
 * eaShoppingLists component.
 */
import template from './shopping-lists.html!text';

/**
 * Component controller - should load and provide the current user and the list
 * of shopping lists.
 *
 * It should handle create and deleting a list.
 *
 */
export class ShoppingListsController {

  /**
   * ShoppingListsController constructor.
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
     * Logging service
     * @type {ng.$log}
     * @private
     */
    this.$log = $log;

    /**
     * Synchronize array factory.
     * @type {angularFire.$firebaseArray}
     * @private
     */
    this.$firebaseArray = $firebaseArray;

    /**
     * Current user.
     * @type {CurrentUser}
     */
    this.user = eaCurrentUser;

    /**
     * Loading resource tracker.
     * @type {Loading}
     */
    this.loading = eaLoading();

    /**
     * List of shopping list.
     * @type {angularFire.FirebaseArray}
     */
    this.lists = undefined;

    /**
     * Placeholder for a new list input value.
     * @type {String}
     */
    this.newList = '';

    /**
     * Function stopping watching the current user state changes.
     * @type {function}
     * @private
     */
    this.stopWatch = this.user.$watch(this.onAuthChanged.bind(this));
  }

  /**
   * Replace the current synchronized array of shopping list.
   *
   * It should destroy it first.
   *
   * @param {?angularFire.FirebaseArray} lists array of shopping list.
   */
  setLists(lists) {
    this.loading.remove('lists');

    if (this.lists && this.lists.$destroy) {
      this.lists.$destroy();
    }

    this.lists = lists;
  }

  /**
   * Angular hook called when the component is destroyed.
   *
   * Reset lists and stop watching the user status.
   *
   * @see https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks
   */
  $onDestroy() {
    this.stopWatch();
    this.setLists();
    this.$log.debug('ShoppingLists component destroyed');
  }

  /**
   * Delete a list.
   *
   * @param  {string} listId List name/id.
   * @return {Promise<void,Error>}
   */
  remove(listId) {
    if (!listId) {
      return Promise.reject(new Error('No list id provided'));
    }

    return this.user.removeList(listId);
  }

  /**
   * Create a new list.
   *
   * @param  {string} listId List name/id.
   * @return {Promise<void,Error>}
   */
  add(listId) {
    if (!listId) {
      return Promise.reject(new Error('no list id provided'));
    }

    this.newList = '';

    return this.user.list(listId);
  }

  /**
   * Current user change handler.
   *
   * Should reset the lists, track the current user getting loaded (signing in)
   * and load the lists when is authenticated.
   *
   * @return {Promise<void,Error>}
   */
  onAuthChanged() {
    this.setLists();

    if (!this.user.uid) {
      this.loading.add('user');

      return Promise.resolve();
    }

    this.loading.remove('user');

    return this.loadLists();
  }

  /**
   * Load the lists.
   *
   * It should set the 'lists' resource as loading and abort the operation
   * if a concurrent one starts.
   *
   * @return {Promise<void, Error>}
   */
  loadLists() {
    const name = 'lists';
    const ctx = this.loading.add(name);

    ctx.uid = this.user && this.user.uid;

    if (!ctx.uid) {
      return Promise.resolve();
    }

    ctx.lists = this.$firebaseArray(this.user.listsRef());

    return ctx.lists.$loaded().then(() => {
      if (ctx.done) {
        ctx.lists.$destroy();

        return;
      }

      this.setLists(ctx.lists);
    }).catch(err => {
      this.loading.error(name, err);
      ctx.lists.$destroy();
    });
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
ShoppingListsController.$inject = ['$log', '$firebaseArray', 'eaCurrentUser', 'eaLoading'];

/**
 * eaShoppingLists component definition
 * @type {ng.directiveDefinition}
 * @private
 */
export const component = {
  template,
  controller: ShoppingListsController
};

/**
 * eaShoppingLists component definition and related services/directives/filters.
 * @type {{component: ng.directiveDefinition}}
 */
const shoppingLists = {component};

export default shoppingLists;
