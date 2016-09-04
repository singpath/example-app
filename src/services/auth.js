/**
 * example-app/service.js - Auth service.
 */

/**
 * Handle authentication using anonymous signin.
 */
export class Auth {

  /**
   * User service
   *
   * @param  {firebase.app.App} firebaseApp a firebaseApp to retriev User details from
   */
  constructor(firebaseApp) {

    /**
     * @private
     * @type {firebase.app.App}
     */
    this.firebaseApp = firebaseApp;
  }

  /**
   * Emit auth. status changes.
   *
   * @param  {function(next: Error, auth: firebase.User): void} next Notified with each auth changes.
   * @return {function(): void} function stop watching for changes.
   */
  $watch(next) {
    return this.firebaseApp.auth().onAuthStateChanged(
      auth => next(null, auth),
      err => next(err)
    );
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
   * @return {Promise<void, Error>}
   */
  signOut() {
    return this.firebaseApp.auth().signOut();
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
Auth.$inject = ['firebaseApp'];

export default Auth;
