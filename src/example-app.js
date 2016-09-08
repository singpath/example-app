/**
 * example-app - Shopping list example of an Angular application.
 */
import angular from 'angular';
import firebase from 'firebase';

import 'angular-route';
import 'angular-messages';
import 'angularfire';

import config from 'example-app/config.js';
import services from 'example-app/services/index.js';
import components from 'example-app/components/index.js';

/**
 * exampleApp module.
 *
 * It Defines the shopping list component and current user service. The current
 * user service define methods to add/delete lists and items. It also provides
 * firebase references to them.
 *
 * The module uses ngRoute to route requests, provides ngMessages for template
 * and synchronized object/array via angularFire. Those synchronized
 * object/array can be used to represent those firebase reference in in
 * component controllers.
 *
 * @type {ng.Module}
 */
export const module = angular.module('exampleApp', [

  // Add ngRoute directive and services.
  'ngRoute',

  // Add ngMessages directives.
  'ngMessages',

  // Add angularFire services
  'firebase'
]);

/**
 * example-app module.
 *
 * export as default exported value; in ES6 module is can be imported as
 * `import exampleApp from 'example-app';`
 *
 * @type {ng.Module}
 */
export default module;


//
// Angular constants.
//
// Note: constants are available directly during configuration unlike services.

// Setup firebase
//
// - Setup default Firebase app; see `index.js` on how to overwrite it.
module.constant('firebaseApp', firebase.initializeApp({
  apiKey: 'AIzaSyBG-0rkAfYmmWIltG3ffevLu4n3ZYuIito',
  authDomain: 'example-app-8c809.firebaseapp.com',
  databaseURL: 'https://example-app-8c809.firebaseio.com'
}));

//
// Services - Singleton services which filters, controllers and other services
// can be injected with.
//
module.factory('eaLoading', services.loadingFactory);
module.service('eaAuth', services.Auth);
module.service('eaCurrentUser', services.datastore.CurrentUser);

//
// Components / directives - attach behavior to DOM element / attribute.
//
// Note: directives are registered with "camelcase" names, but will be available
// as "kebab" case DOM elements / attributes:
//
// <root-app></root-app>
// <ea-shopping-lists></ea-shopping-lists>
// <ea-shopping list-id="$ctrl.some.id"></ea-shopping>
//
module.component('eaShoppingItem', components.shoppingItem.component);
module.component('eaShopping', components.shopping.component);
module.component('eaShoppingLists', components.shoppingLists.component);
module.component('rootApp', components.rootApp.component);

//
// Configurations - configure service.
//
// Services are singleton object; `angular.config` allows their configuration
// before their creation.
//
module.config(config.routes);
