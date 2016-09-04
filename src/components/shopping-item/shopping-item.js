/**
 * example-app/components/shopping-item/shopping-item.js - defines the
 * eaShoppingItem component.
 */

/**
 * Component controller - fetch the into info.
 *
 * Expect `$onChanges` to be called each time the `listId` and `itemId` bindings
 * changes.
 *
 * Reset the list when the bindings or user id (log in/out) change.
 *
 */
export class ShoppingItemController {

  /**
   * ShoppingItemController controller
   *
   * Set properties default values (except the the binding properties while
   * supporting angular 1.5) and listen for changes to the current user status.
   *
   * Expect currentUser to give an initial call to the listener with the current
   * status.
   *
   * @param  {ng.$log}                     $log            Angular logging service
   * @param  {angularFire.$firebaseObject} $firebaseObject AngularFire synchronized array factory
   * @param  {CurrentUser}                 eaCurrentUser   The current user
   * @param  {function(): Loading}         eaLoading       Loading factory service.
   */
  constructor($log, $firebaseObject, eaCurrentUser, eaLoading) {

    /**
     * Angular logging service
     * @type {ng.$log}
     * @private
     */
    this.$log = $log;

    /**
     * AngularFire synchronized object factory.
     * @type {angularFire.$firebaseObject}
     * @private
     */
    this.$firebaseObject = $firebaseObject;

    /**
     * tracking loading items.
     * @type {Loading}
     */
    this.loading = eaLoading();

    /**
     * Current user.
     * @type {CurrentUser}
     */
    this.user = eaCurrentUser;

    /**
     * Synchronised object holding the item details.
     * @type {angularFire.FirebeObject}
     */
    this.item = undefined;

    /**
     * Stop watching for
     * @type {function}
     * @private
     */
    this.stopWatch = this.user.$watch(this.onAuthChanged.bind(this));
  }

  /**
   * Set item details and destroy the previous one.
   * @param {angularFire.FirebaseObject} item New item object.
   */
  setItem(item) {
    this.loading.remove('item');

    if (this.item && this.item.$destroy) {
      this.item.$destroy();
    }

    this.item = item;
  }

  /**
   * Angular hook called when the component is destroyed.
   *
   * Reset item details and stop watching the user status.
   *
   * @see https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks
   */
  $onDestroy() {
    this.stopWatch();
    this.setItem();
    this.$log.debug('ShoppingItemController component destroyed');
  }

  /**
   * Angular hook trigger each time one or more component binding changes.
   *
   * Should reset the item object and attempt to load the new one.
   *
   * @see https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks
   * @param  {object}    changes List of changes.
   * @return {Promise<void,Error>}
   */
  $onChanges(changes) {
    if (!this.listId || !this.itemId) {
      this.loading.error('item', new Error('"listId" and "itemId" are required attribute'));
    }

    if (!changes.listId && !changes.itemId) {
      return Promise.resolve();
    }

    this.setItem();

    return this.loadItem();
  }

  /**
   * Current User changes handler.
   *
   * Should reset the item and either track the user signing or load the item.
   *
   * @return {Promise<void,Error>}
   */
  onAuthChanged() {
    const isLoggedIn = this.user && this.user.uid;

    this.setItem();

    if (!isLoggedIn) {
      this.loading.add('user');

      return Promise.resolve();
    }

    this.loading.remove('user');

    return this.loadItem();
  }

  /**
   * load and update the list of item.
   *
   * Should set "item" resource as loading while loading the item details and
   * abort if a new loading process start.
   *
   * @return {Promise<void,Error>}
   */
  loadItem() {
    const ctx = this.loading.add('item');

    ctx.uid = this.user && this.user.uid;
    ctx.listId = this.listId;
    ctx.itemId = this.itemId;

    if (!ctx.uid || !ctx.listId || !ctx.itemId) {
      return Promise.resolve();
    }

    return this.user.list(ctx.listId).then(list => {
      if (ctx.done) {
        return undefined;
      }

      ctx.item = this.$firebaseObject(list.itemRef(ctx.itemId));

      return ctx.item.$loaded();
    }).then(() => {
      if (!ctx.done) {
        this.setItem(ctx.item);

        return;
      }

      if (ctx.item) {
        ctx.item.$destroy();
      }
    }).catch(err => {
      this.loading.error('item', err);

      if (ctx.item && ctx.item.$destroy) {
        ctx.item.$destroy();
      }
    });
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
ShoppingItemController.$inject = ['$log', '$firebaseObject', 'eaCurrentUser', 'eaLoading'];

/**
 * eaShoppingItem component definition
 * @type {ng.directiveDefinition}
 * @private
 */
export const component = {
  template: `
    <h1>{{$ctrl.itemId}}</h1>

    <div ng-messages="$ctrl.loading.errors" role="alert">
      <p ng-message="user">Something went wrong with the Firebase authentication.</p>
      <p ng-message="item">Failed to load you item info.</p>
    </div>

    <p ng-if="!$ctrl.loading.ready">Loading...</p>

    <div ng-if="$ctrl.loading.ready">
      <p ng-if="!$ctrl.item.createdAt">The item was removed.</p>
      <p ng-if="$ctrl.item.createdAt">Item created at {{$ctrl.item.createdAt | date:'medium'}}</p>
    </div>

    <p><small><a ng-href="#/lists/{{$ctrl.listId}}">back</a></small></p>
  `,
  bindings: {
    listId: '<',
    itemId: '<'
  },
  controller: ShoppingItemController
};

/**
 * eaShoppingItem component definition and related services/directives/filters.
 * @type {{component: ng.directiveDefinition}}
 */
const shoppingItem = {component};

export default shoppingItem;
