/**
 * example-app - Shopping list example of an Angular application.
 */
import angular from 'angular';
import firebase from 'firebase';
import Rx from 'example-app/tools/rx.js';

import * as ngRxSubscribe from 'angular-rx-subscribe';
import * as rxFirebase from 'rx-firebase';

import 'angular-route';

import * as services from 'example-app/services.js';

import {component as exampleApp} from 'example-app/components/example-app/example-app.js';
import {component as eaShopping} from 'example-app/components/shopping/shopping.js';
import {component as eaShoppingLists} from 'example-app/components/shopping-lists/shopping-lists.js';

//
// Create our angular module.
//
// An angular modules mixes the dependencies and an application own directives,
// filters and services.
//
const module = angular.module('exampleApp', [

  // Add ngRoute directive and services.
  'ngRoute',

  // Add angular-rx-subscribe's "rxSubscribe" directive.
  'rxSubscribe'
]);

//
// Angular constants.
//
// Note: constants are available directly during configuration unlike services.

// Setup firebase
//
// - Extend firebase with Observable method.
// - Setup default Firebase app; see `index.js` on how to overwrite it.
//

rxFirebase.extend(firebase, Rx.Observable);
module.constant('firebaseApp', firebase.initializeApp({
  apiKey: 'AIzaSyBG-0rkAfYmmWIltG3ffevLu4n3ZYuIito',
  authDomain: 'example-app-8c809.firebaseapp.com',
  databaseURL: 'https://example-app-8c809.firebaseio.com'
}));

//
// Services - Singleton services which filters, controllers and other services
// can be injected with.
//
module.service('eaLists', services.Lists);

//
// Components / directives - attach behavior to DOM element / attribute.
//
// Note: directives are registered with "camelcase" names, but will be available
// as "kebab" case DOM elements / attributes:
//
// <example-app></example-app>
// <ea-shopping-lists></ea-shopping-lists>
// <ea-shopping list-id="$ctrl.some.id"></ea-shopping>
//
module.component('exampleApp', exampleApp);
module.component('eaShopping', eaShopping);
module.component('eaShoppingLists', eaShoppingLists);

//
// Configurations - configure service.
//
// Services are singleton object; `angular.config` allows their configuration
// before their creation.
//

// Configure ngRoute.
//
// See:
//
// - $routeProvider API:
//   https://docs.angularjs.org/api/ngRoute/provider/$routeProvider
//
// - component as route template:
//   https://docs.angularjs.org/guide/component#components-as-route-templates
//
module.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {template: '<ea-shopping-lists></ea-shopping-lists>'})
    .when('/lists/:listId', {
      template: '<ea-shopping list-id="$resolve.params.listId"></ea-shopping">',

      // Adds `params` to the template $resolve scope object.
      resolve: {params: ['$route', $route => $route.current.params]}
    })
    .otherwise('/');
}]);

//
// Bootstrap module - similar to configuration, but the services are now
// available.
//
// Note: a service singleton will created on first request of that service.
// `angular.run` can be a way to configure before component / directive access
// them. It also a way to make sure their are created even if
// no component / directive depends on it.
//

// Add the $subscribe operator to Rx.Observable
module.run(['$rootScope', function($rootScope) {
  ngRxSubscribe.extend(Rx.Observable, $rootScope);
}]);

export default module;
