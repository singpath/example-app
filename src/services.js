/**
 * example-app/service.js - Business domain for this app.
 *
 * The service facade is `List` and the examples assumes:
 *
 * - `firebase` has been extended with `rx-firebase`.
 * - `Rx.Observable` has been extended with `angulalar-rx-subscribe`.
 * - a `firebaseApp` Angular constant or service is registered.
 * - `list` is registered with Angular as `eaLists`.
 *
 * @example
   import angular from 'angular'
   import firebase from 'firebase';
   import Rx from 'example-app/tools/rx.js';

   import ngRxSubscribe from 'angular-rx-subscribe';
   import rxFirebase from 'rx-firebase';

   import {List} as services from 'example-app/services.js';

   // extend Firebase with `rx-firebase`.
   rxFirebase.extend(firebase, Rx.Observable);

   // set `angular-rx-subscribe` as a dependency.
   const module = angular.module('exampleApp', ['rxSubscribe'])
     // add `firebaseApp` constant.
     .constant('firebaseApp', firebase.initializeApp({
       apiKey: 'AIzaSyBG-0rkAfYmmWIltG3ffevLu4n3ZYuIito',
       authDomain: 'example-app-8c809.firebaseapp.com',
       databaseURL: 'https://example-app-8c809.firebaseio.com'
     }))
     // Optional: extend Rx.Observable with `$subscribe` method.
     .run(['$rootScope', function($rootScope) {
       ngRxSubscribe.extend(Rx.Observable, $rootScope);
     }])
     .service('eaLists', List);
 *
 */
import Rx from 'example-app/tools/rx.js';

/**
 * Return a firebase timestamp service value.
 *
 * @return {Object}
 */
function timestamp() {
  return {'.sv': 'timestamp'};
}

/**
 * Auth an an registration.
 *
 * Should be accessed via `eaLists.user`.
 *
 * @example
   module.component('user', {
       template: `
         <!--
           `rxSubscribe` subscribes to an observable and adds `$rx` (by default)
           to the scope. $rx.next, $rx.error and $rx.complete holds the next,
           error and complete notifications.
         -->
         <div rx-subscribe="$ctrl.user" rx-as="$rx">
           <p ng-if="$rx.error">{{$rx.error}}<p>
           <p ng-if="$rx.next">Registered since: {{$rx.next|date}}</p>
           <login></login>
         </div>
       `,
       controller: ['eaLists', fonction UserCtrl(eaLists) {
         this.user = eaLists.user.get();
       }]
     })
     .component('login', {
       template: `
         <div rx-subscribe="$ctrl.user" rx-as="$rx">
           <p ng-if="$rx.next"><button ng-click="$ctrl.signOut()">Sign out</button></p>
           <p ng-if="$rx.next"><button ng-click="$ctrl.register()">Register</button></p>
         </div>
       `,
       controller: ['eaLists', fonction LoginCtrl(eaLists) {
         this.user = eaLists.user.get();
         this.register = () => eaLists.register();
         this.signOut = () => eaLists.signOut();
       }]
     });
 *
 */
export class User {

  /**
   * User service
   *
   * @param  {firebase.App} firebaseApp a firebaseApp to retriev User details from
   */
  constructor(firebaseApp) {
    this.firebaseApp = firebaseApp;
    this._signingOut = new Rx.Subject();
  }

  /**
   * Emit auth. status changes.
   *
   * @return {Observable<?firebase.User>}
   */
  auth() {
    return this.firebaseApp.auth().observeAuthState().merge(
      this._signingOut
    ).distinctUntilChanged();
  }

  /**
   * Sign user anonymously.
   *
   * @return {Promise<firebase.User,Error>}
   */
  signIn() {
    return this.firebaseApp.auth().signInAnonymously();
  }

  /**
   * Sign user out.
   *
   * Signal the user signing out first and sign off after a short delay. The
   * delay should be long enough to allow resource using the current user
   * status to tear themself down.
   *
   * @return {Promise<void, Error>}
   */
  signOut() {
    const delayPeriod = 50;
    const delayed = this._signingOut.auditTime(delayPeriod).first().toPromise();

    this._signingOut.next(null);

    return delayed.then(() => this.firebaseApp.auth().signOut());
  }

  /**
   * Return the current user registered data.
   *
   * @return {Observable<?{$key: string, registeredAt: number}>}
   */
  get() {
    return this.auth().switchMap(fbUser => {
      const uid = fbUser && fbUser.uid;

      if (!uid) {
        return Rx.Observable.of(undefined);
      }

      return this.firebaseApp.database().ref(`/users/${uid}`).observe('value');
    });
  }

  /**
   * Return a promise resolving on the user UID.
   *
   * Relies on anonymous signIn.
   *
   * @return {Promise<string, Error>} resolves to the the user UID.
   */
  uid() {
    const auth = this.firebaseApp.auth();
    const user = auth.currentUser;

    if (user && user.uid) {
      return Promise.resolve(user.uid);
    }

    return this.signIn().then(u => u.uid);
  }

  /**
   * Set registration data at "/user/$uid".
   *
   * @return {Promise<void, Error>}
   */
  register() {
    const db = this.firebaseApp.database();

    return this.uid().then(
      id => db.ref(`/users/${id}`).set({registeredAt: timestamp()})
    );
  }

  /**
   * Tear down process of this service.
   */
  destroy() {
    this._signingOut.complete();

    this.firebaseApp = null;
    this._signingOut = null;
  }

}

/**
 * Represent one shopping list.
 *
 * Should be accessed via `eaLists.shoppingList('some shopping list');`.
 *
 * @example
    // used as "<shopping list-id="'grocery'"></shopping>"
    module.component('shopping', {
      template: `
        <ul rx-subscribe="$ctrl.shopping">
          <li ng-if="!$ctrl.shopping || !$rx.next">
            loading...
          </li>
          <li ng-if="$rx.next.length == 0">
            Nothing in the list
          </li>
          <li ng-repeat="item in $rx.next">
            {{item.$key}}
          </li>
        </ul>
      `,
      bindings: {
        listId: '<'
      },
      controller: ['eaLists', function ShoppingCtrl(eaLists) {

        // triggered when one of the bound attribute changes
        this.$onChanges = (changes) => {
          if (changes.listId) {
            this.list = eaLists.shoppingList(this.listId);
            this.shopping = this.list.items();
          }
        };

      }]
    });
 *
 */
export class ShoppingList {

  /**
   * A shopping list service.
   *
   * @param   {string} name  list name
   * @param   {Lists}  lists list service
   */
  constructor(name, lists) {
    this.lists = lists;
    this.db = lists.firebaseApp.database();
    this.user = lists.user;

    this.name = name;
  }

  /**
   * Observable creating the list if it doesn't exist and pushing the list
   * of shopping items everytime it changes.
   *
   * Emit undefined while when user is logged off.
   *
   * @return {Observable<({$key: string, createdAt: number}[]|void)>}
   */
  items() {

    // observe changes in the auth status
    return this.user.get().switchMap(user => {

      // emit undefined while the user is not registered.
      if (!user || user.$value === null) {
        return Rx.Observable.of(undefined);
      }

      // each time the user uid changes, make sure the list exist first
      return this._initList().concat(this._listItems(user.$key));
    });
  }

  /**
   * Create the list if it doesn't exist initially.
   *
   * Note: if the list is somehow removed (from an other tab), we should not
   * implicitly recreate it.
   *
   * The returned Observable will complete once the list is create or notify
   * an error. It must not push any "next" notification.
   *
   * @private
   * @return {Observable} completes once the list exists
   */
  _initList() {
    return Rx.Observable.fromPromise(
      this.lists.exists(this.name).then(exists => {
        if (!exists) {
          return this.lists.create(this.name);
        }

        return null;
      })
    ).ignoreElements(); // only push an error or complete notification.
  }

  /**
   * Observable pushing an updated list of shopping items each time the list
   * changes.
   *
   * Notify an error if the list get removes.
   *
   * @private
   * @param  {string}     uid user uid
   * @return {Observable}     emits an array in sync with the the list items.
   */
  _listItems(uid) {
    return this._listExists(uid).switchMap(exists => {
      if (!exists) {
        return Rx.Observable.throw(new Error('The list has been removed'));
      }

      return this.db.ref(`/listItems/${uid}/${this.name}`)
        .orderByKey().observeChildren();
    });
  }

  /**
   * Observable following the list existence status
   *
   * @private
   * @param {string} uid user uid.
   * @return {Observable<boolean>}
   */
  _listExists(uid) {
    return this.db.ref(`/lists/${uid}/${this.name}`).observe('value').map(
      list => list.$value !== null
    );
  }

  /**
   * Add item to the list
   *
   * The name must be a valid firebase key.
   *
   * @param  {string}  item a name
   * @return {Promise<void, Error>}
   */
  add(item) {
    return this.user.uid().then(
      uid => this.db.ref(`/listItems/${uid}/${this.name}/${item}`).set({createdAt: timestamp()})
    );
  }

  /**
   * remove item.
   *
   * @param  {string}  item item name/key
   * @return {Promise<void, Error>}
   */
  remove(item) {
    return this.user.uid().then(
      uid => this.db.ref(`/listItems/${uid}/${this.name}/${item}`).remove()
    );
  }

}

/**
 * Manage current user authentication and the shopping lists.
 *
 * @example
    // used as "<shopping-lists></shopping-lists>"
    module.component('shoppingLists', {
      template: `
        <ul rx-subscribe="$ctrl.lists">
          <li ng-if="!$ctrl.lists || !$rx.next">
            loading...
          </li>
          <li ng-if="$rx.next.length == 0">
            Nothing in the list
          </li>
          <li ng-repeat="list in $rx.next">
            {{list.$key}}
          </li>
        </ul>
      `,
      controller: ['eaLists', function ShoppingCtrl(eaLists) {
        this.lists = eaLists.all();
      }]
    });
 *
 */
export class Lists {

  constructor(firebaseApp) {
    this.firebaseApp = firebaseApp;
    this.user = new User(firebaseApp);
  }

  /**
   * Emit the user list of shopping list.
   *
   * The list is sorted.
   *
   * @return {Observable} Emit sorted arrays or undefined
   *                      if the user is unregistered.
   */
  all() {
    return this.user.get().switchMap(user => {

      // emit undefined while the user is not registered.
      if (!user || user.$value === null) {
        return Rx.Observable.of(undefined);
      }

      return this.firebaseApp.database().ref(
        `/lists/${user.$key}`
      ).orderByKey().observeChildren();
    });
  }

  /**
   * Check a list exist.
   *
   * @param  {string}  name list name
   * @return {Promise<boolean, Error>}
   */
  exists(name) {
    const db = this.firebaseApp.database();

    return this.user.uid().then(
      uid => db.ref(`/lists/${uid}/${name}`).once('value')
    ).then(
      snapshot => snapshot.exists()
    );
  }

  /**
   * Create a new list.
   *
   * `name` Must be a valid firebase key.
   *
   * @param  {string}  name list name
   * @return {Promise<void, Error>}
   */
  create(name) {
    const db = this.firebaseApp.database();

    return this.user.uid().then(
      uid => db.ref(`/lists/${uid}/${name}`).set({createdAt: timestamp()})
    );
  }

  /**
   * Delete a shopping list.
   *
   * @param  {string}  name list name/key
   * @return {Promise<void, Error>}
   */
  remove(name) {
    const db = this.firebaseApp.database();

    return this.user.uid().then(
      uid => db.ref('/').update({
        [`lists/${uid}/${name}`]: null,
        [`listItems/${uid}/${name}`]: null
      })
    );
  }

  /**
   * Get shopping list service
   *
   * @param  {string} name list name
   * @return {ShoppingList}
   */
  shoppingList(name) {
    return new ShoppingList(name, this);
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
Lists.$inject = ['firebaseApp'];
