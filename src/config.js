/**
 * example-app/config.js
 */

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
export function route($routeProvider) {
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
}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
route.$inject = ['$routeProvider'];
