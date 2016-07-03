/**
 * example-app/components/shopping-item/shopping-item.js - defines the
 * eaShoppingItem component.
 */

/**
 * Component controller - should provide the shopping item observable to the
 * view.
 */
class ShoppingItemController {

  /**
   * Receive dependencies and initiate (set zero value).
   *
   * @param  {List} eaLists List service
   */
  constructor(eaLists) {
    this._lists = eaLists;
    this.item = undefined;
  }

  /**
   * Controller hook called each time a component property changes.
   *
   * See https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks
   *
   * Update the list service each time the list id changes and update the item
   * details each time the item id changes.
   *
   * @param {Map<string, {currentValue: Object, previousValue: Object, isFirstChange: function}>} changes changes list
   */
  $onChanges(changes) {
    if (changes.listId) {
      this.setList();
      return;
    }

    if (changes.itemId) {
      this.setItem();
    }

  }

  /**
   * Set list service and reset item details observable.
   */
  setList() {
    this.list = this.listId ? this._lists.shoppingList(this.listId) : undefined;
    this.setItem();
  }

  /**
   * Set item observable.
   */
  setItem() {
    this.item = this.list ? this.list.itemDetails(this.itemId) : undefined;
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
ShoppingItemController.$inject = ['eaLists'];

export const component = {
  template: `
    <h1>{{$ctrl.itemId}}</h1>
    <div rx-subscribe="$ctrl.item">
      <p ng-if="$rx.error">{{ $rx.error }}</p>
      <p ng-if="!$rx.error && !$rx.next">Loading...</p>
      <p ng-if="$rx.next && !$rx.next.createdAt">Not found.</p>
      <p ng-if="$rx.next.createdAt">created at "{{$rx.next.createdAt | date:'medium'}}".</p>
    </div>
    <p><small><a ng-href="#/lists/{{$ctrl.listId}}">back</a></small></p>
  `,
  bindings: {
    listId: '<',
    itemId: '<'
  },
  controller: ShoppingItemController
};
