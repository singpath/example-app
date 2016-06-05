/**
 * example-app - Shopping list example of an Angular application.
 */
import angular from 'angular';
import 'angular-route';

import * as services from './services.js';

import {component as exampleApp} from './components/example-app/example-app.js';
import {component as eaShopping} from './components/shopping/shopping.js';
import {component as eaShoppingLists} from './components/shopping-lists/shopping-lists.js';

const module = angular.module('exampleApp', ['ngRoute']);

module.service('eaLists', services.Lists);

module.component('exampleApp', exampleApp);
module.component('eaShopping', eaShopping);
module.component('eaShoppingLists', eaShoppingLists);

/**
 * Configure ngRoute.
 *
 * See:
 *
 * - $routeProvider API:
 *   https://docs.angularjs.org/api/ngRoute/provider/$routeProvider
 *
 * - component as route template:
 *   https://docs.angularjs.org/guide/component#components-as-route-templates
 *
 * @param  {Object} $routeProvider
 */
module.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      template: '<ea-shopping-lists></ea-shopping-lists>'
    })
    .when('/lists/:listId', {
      template: '<ea-shopping list-id="$resolve.params.listId"></ea-shopping">',
      // Adds `params` to the template $resolve scope object.
      resolve: {
        params: ['$route', $route => $route.current.params]
      }
    })
    .otherwise('/');
}]);

export default module;
