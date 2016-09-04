/**
 * example-app/config.js - configuration routines.
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
 * @param  {{when: function, otherwise: function}} $routeProvider Angular route service provider.
 */
export function routes($routeProvider) {

  // configure routes
  $routeProvider
    .when('/', {template: '<ea-shopping-lists></ea-shopping-lists>'})
    .when('/lists/:listId', {
      template: '<ea-shopping list-id="$resolve.params.listId"></ea-shopping">',

      // Adds `params` to the template $resolve scope object.
      resolve: {params}
    })
    .when('/lists/:listId/items/:itemId', {
      template: `
        <ea-shopping-item
          list-id="$resolve.params.listId"
          item-id="$resolve.params.itemId"
        >
          Failing to load item info.
        </ea-shopping-item>
      `,

      // Adds `params` to the template $resolve scope object.
      resolve: {params}
    })
    .otherwise('/');
}

routes.$inject = ['$routeProvider'];

/**
 * Helper for our resolvers.
 *
 * Note that this is not service and doesn't return a singleton. It will be
 * called for each route resolving needing it.
 *
 * @param  {$route} $route $route service
 * @return {Object}
 * @private
 */
export function params($route) {
  return $route.current.params;
}

params.$inject = ['$route'];

/**
 * example-app configurations routines
 * @type {{routes: routes}}
 */
const config = {routes};

export default config;
