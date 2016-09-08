/**
 * example-app/service.js - exampleApp Firebase service.
 */

/**
 * Return a firebase timestamp service value.
 *
 * @return {Object}
 */
function timestamp() {
  return {'.sv': 'timestamp'};
}

const paths = {

  user(uid) {
    if (!uid) {
      throw new Error('The user should have a unique ID.');
    }

    return `/users/${uid}`;
  },

  lists(uid) {
    if (!uid) {
      throw new Error('Lists needs owners.');
    }

    return `/lists/${uid}`;
  },

  listDetails(uid, listId) {
    if (!uid || !listId) {
      throw new Error('The list needs an owner and a name.');
    }

    return `${this.lists(uid)}/${listId}`;
  },

  items(uid, listId) {
    if (!uid || !listId) {
      throw new Error('The list needs an owner and a name.');
    }

    return `/listItems/${uid}/${listId}`;
  },

  itemDetails(uid, listId, itemId) {
    if (!uid || !listId || !itemId) {
      throw new Error('the item needs an owner, list id and a name.');
    }

    return `${this.items(uid, listId)}/${itemId}`;
  }

};

/**
 * Manage a user list of shopping item.
 */
export class ItemList {

  /**
   * ItemList constructor.
   * @param  {firebase.app.App} firebaseApp example-app Firebase App.
   * @param  {string}           uid         The user uid.
   * @param  {string}           listId      The list id/name.
   */
  constructor(firebaseApp, uid, listId) {

    /**
     * @private
     * @type {firebase.app.App}
     */
    this.firebaseApp = firebaseApp;

    /**
     * The user uid.
     * @type {string}
     */
    this.uid = uid;

    /**
     * The list id/name.
     * @type {string}
     */
    this.listId = listId;

    /**
     * Cache the created process result.
     * @type {Promise<void,Error>}
     * @private
     */
    this.$created = undefined;
  }

  /**
   * example-app Firebase database.
   * @return {firebase.database.Database}
   * @private
   */
  db() {
    return this.firebaseApp.database();
  }

  /**
   * The list items firebase reference.
   * @return {firebase.database.Reference}
   */
  ref() {
    return this.db().ref(
      paths.items(this.uid, this.listId)
    );
  }

  /**
   * The list details firebase reference.
   * @return {firebase.database.Reference}
   */
  metaRef() {
    return this.db().ref(
      paths.listDetails(this.uid, this.listId)
    );
  }

  /**
   * A list item firebase reference.
   * @param  {string} itemId The item id/name.
   * @return {firebase.database.Reference}
   */
  itemRef(itemId) {
    return this.db().ref(
      paths.itemDetails(this.uid, this.listId, itemId)
    );
  }

  /**
   * Create the list.
   * @return {Promise<void,Error>}
   */
  create() {
    if (this.$created) {
      return this.$created;
    }

    const ref = this.metaRef();

    this.$created = ref.once('value').then(snapshot => {
      if (snapshot.exists()) {
        return undefined;
      }

      return ref.transaction(meta => {
        if (meta !== null) {
          return undefined;
        }

        return {createdAt: timestamp()};
      });
    });

    return this.$created;
  }

  /**
   * Delete the list.
   *
   * Delete the list items and the list details.
   *
   * @return {Promise<void,Error>}
   */
  removeList() {
    const details = paths.listDetails(this.uid, this.listId);
    const items = paths.items(this.uid, this.listId);

    return this.db().ref('/').update({
      [details]: null,
      [items]: null
    });
  }

  /**
   * Add item to the list.
   *
   * Make sure the list exists.
   *
   * @param {string} itemId the item id/name.
   * @return {Promise<void,Error>}
   */
  add(itemId) {
    const ref = this.itemRef(itemId);

    return this.create().then(
      () => ref.once('value')
    ).then(snapshot => {
      if (snapshot.exists()) {
        return undefined;
      }

      return ref.transaction(meta => {
        if (meta !== null) {
          return undefined;
        }

        return {createdAt: timestamp()};
      });
    });
  }

  /**
   * Remove item form the list.
   *
   * @param {string} itemId the item id/name.
   * @return {Promise<void,Error>}
   */
  remove(itemId) {
    return this.itemRef(itemId).remove();
  }

}

/**
 * Manage a user resources (lists and registration details).
 */
export class User {

  /**
   * User constructor.
   *
   * @param  {firebase.app.App} firebaseApp example-app Firebase App.
   * @param  {string}           uid         The user uid.
   */
  constructor(firebaseApp, uid) {

    /**
     * @private
     * @type {firebase.app.App}
     */
    this.firebaseApp = firebaseApp;

    /**
     * User uid.
     * @type {?string}
     */
    this.uid = uid || null;
  }

  /**
   * Return the user details Firebase reference.
   *
   * @return {firebase.database.Reference}
   */
  ref() {
    return this.firebaseApp.database().ref(
      paths.user(this.uid)
    );
  }

  /**
   * Return a Firebase reference to the user's lists (details).
   *
   * @return {firebase.database.Reference}
   */
  listsRef() {
    return this.firebaseApp.database().ref(
      paths.lists(this.uid)
    );
  }

  /**
   * Delete an existing list.
   *
   * @param  {string} listId The list id/name to create.
   * @return {Promise<void, Error>}
   */
  removeList(listId) {
    const list = new ItemList(this.firebaseApp, this.uid, listId);

    return list.removeList();
  }

  /**
   * Resolve to a user list manager.
   *
   * Make the user is registered and the list exists.
   *
   * @param  {string} listId The list id/name to retrieve.
   * @return {Promise<ItemList,Error>}
   */
  list(listId) {
    const list = new ItemList(this.firebaseApp, this.uid, listId);

    return list.create().then(() => list);
  }

  /**
   * Register the current user.
   *
   * @return {Promise<void,Error>}
   */
  register() {
    const ref = this.ref();

    return ref.once('value').then(snapshot => {
      if (snapshot.exists()) {
        return undefined;
      }

      return ref.transaction(user => {
        if (user !== null) {
          return undefined;
        }

        return {registeredAt: timestamp()};
      });
    });
  }

}

const userEvent = 'ea.currentUser';
const userErrorEvent = 'ea.currentUser.error';

/**
 * Current user service.
 *
 * @emits  {ea.currentUser}       Emit event when the current user authentication states changes.
 * @emits  {ea.currentUser.error} Emit event when the current user authentication fails.
 */
export class CurrentUser extends User {

  /**
   * Current user constructor keep track of the current user uid changes.
   *
   * @param {ng.$log}          $log        Angular logging service.
   * @param {ng.Scope}         $rootScope  Angular $rootScope service.
   * @param {firebase.app.App} firebaseApp example-app Firebase App.
   * @param {Auth}             eaAuth      example-app authentication service
   */
  constructor($log, $rootScope, firebaseApp, eaAuth) {
    super(firebaseApp);

    /**
     * Current user uid
     * @type {?string}
     */
    this.uid = null;


    /**
     * Angular $rootScope service.
     * @type {ng.Scope}
     * @private
     */
    this.$rootScope = $rootScope;

    eaAuth.$watch((err, auth) => {
      const uid = (!err && auth) ? auth.uid : null;
      const newUid = uid !== this.uid;

      this.uid = uid;

      if (err) {
        $rootScope.$emit(userErrorEvent);
        $rootScope.$emit(userEvent, {uid: null});
        $rootScope.$applyAsync();

        return Promise.resolve();
      }

      if (uid && !newUid) {
        return Promise.resolve();
      }

      if (uid) {
        return this.register().then(() => {
          if (this.uid !== uid) {
            return;
          }

          $rootScope.$emit(userEvent, {uid});
          $rootScope.$applyAsync();
        });
      }

      if (newUid) {
        $rootScope.$emit(userEvent, {uid: null});
        $rootScope.$applyAsync();
      }

      return eaAuth.signIn();
    });
  }

  /**
   * Listen for user change events.
   *
   * @param  {function(event: object, arg: {uid: ?string}): void} handler Notification handler.
   * @return {function} Deregistration function.
   */
  $watch(handler) {
    handler(null, {uid: this.uid});
    return this.$rootScope.$on(userEvent, handler);
  }

  /**
   * Listen for auth error event.
   *
   * @param  {function(event: object): void} handler Notification handler.
   * @return {function} Deregistration function.
   */
  $watchError(handler) {
    return this.$rootScope.$on(userErrorEvent, handler);
  }

}

CurrentUser.$inject = ['$log', '$rootScope', 'firebaseApp', 'eaAuth'];

/**
 * example-app datastore services.
 *
 * @type {{CurrentUser: CurrentUser}}
 */
const datastore = {CurrentUser};

export default datastore;
