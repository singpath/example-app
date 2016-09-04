# AngularJS 1

AngularJS is a framework used to write single pages. It promotes MVC structure
and dependency injection.

## Scope

Angular associates to DOM elements an object, a `scope`, which properties can
be rendered using `{{ someProperty }}`.

```html
<div ng-app>
  <h1 ng-init="who = 'world'">
    Hello {{who}}!
  </h1>
</div>
```

`ng-init` is used to initiate the scope `who` property. It creates a child scope
which inherit its parent element scope.


## Modules

Modules are registry of directives, services and filters. A module can inherite
those from other modules; e.g., to require "ngRoute" directives and services:
```js
const module = angular.module('myModule', ['ngRoute']);

module.filter('greet', function greetFilterFactory() {
  return function greetFilter(who) {
    return `hello ${who}`;
  };
});
```

To bootstrap an application onto your module:
```html
<div ng-app="myModule">
  <h1>{{ 'World' | greet }}</h1>
</div>
```

Angular will use "myModule" to parse the div.

You can also bootstrap the application with `angular.bootstrap`. This is the
method we will use since our module are loaded asynchronously during
development:
```js
const module = angular.module('myModule', []);

// wait for the DOM to be ready...
angular.element(document).ready(function() {
  // bootstrap the application on the document
  angular.bootstrap(document, ['myModule']);
});
```


## Directives

Directives associate some routine to DOM elements or attributes. It can be used
to fill an element with some content or to bridge some library with an angular
application.

Since angular 1.5, the easiest way to create a directive is by using
`module.component(name, options)`:
```js
const module = angular.module('myModule', []);

module.component('hello', {
  template: `<h1>hello {{ $ctrl.who }}</h1>`,
  bindings: {
    // binds the component "who" attribute value to "$ctrl.who"
    who: '@'
  }
});
```

View:
```html
<div ng-app="myModule">
  <hello who="world"></hello>
</div>
```


## Controllers

Controllers augment a scope with values and function (usually as event
handlers). They are mainly used as bridges between views and models. They can
either receive the scope to manipulate it, or an instance of the controller can
be assign to a scope property (`$ctrl` by default for component controllers).
We will use the later strategy. It shows explicitly where a value comes from and
avoid errors associated with prototypical inheritance.

Controllers can be used in various way. We will mainly use them as
component/directive controller.

Because we are testing them directly, not via Angular injector, we do not need
to register them with `module.controller(name, constructor)`.

```js
const module = angular.module('myModule', []);

class Ctrl {
  $onInit() {
    if (!this.who) {
      this.who = 'world';
    }
  }
}

module.component('hello', {
  template: `<h1>hello {{ $ctrl.who }}</h1>`,
  bindings: {
    // binds the component "who" attribute to the controller instance "who"
    // property.
    who: '@'
  },
  // Set the who property with a default value.
  controller: class HelloCtrl {
    // called once the bindings are bound to the instance
    $onInit() {
      if (!this.who) {
        this.who = 'world';
      }
    }
  }
});
```

View:
```html
<div ng-app="myModule">
  <hello who=""></hello>
</div>
```


## Services

Services are singleton objects which can be provided to injectable function,
mainly, other service constructors/factories, filter factories, controllers and
route resolvers.

TODO:
- show the various way to create services;
- add examples.


## Filters

Filters can used in views to convert a value. For example, angular "date" filter
convert a date or a time-stamp to a string representation of date.

TODO:
- show example.


## Component tree

We are building this example application using a component tree.
we create a root component "app"; it defines the general layout and use
ngRoute's "ngView" directive to dynamically display children components.

We then configure ngRoute to display different component depending of URL
pattern.

```html
<body>
  <app></app>

  <script>

  const module = angular.module('myApp', [
    'ngRoute'
  ]);

  module.component('app', {
    template: `
      <p>
        <a href="#/hello/there">Hello there</a> -
        <a href="#/todo">Todo</a>
      </p>
      <div ng-view></div>
    `
  });

  module.config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/hello/:who', {
        template: '<hello name="$resolve.who"></hello">',
        resolve: {
          who: ['$route', $route => $route.current.params.who]
        }
      })
      .when('/todo', {
        template: '<todo></todo">',
      })
      .otherwise('/hello/world');
  }]);

  module.component('hello', {
    template: `
      <h1>Hello</h1>
      <p>Hello {{$ctrl.name}}</p>
      <p><a href="#/">home</a></p>
    `,
    bindings: {
      name: '='
    }
  });

  module.component('todo', {
    template: `
      <h1>Todo</h1>
      <ul ng-repeat="i in $ctrl.todos">
        <li>{{i}}</li>
      </ul>
      <p><a href="#/">home</a></p>
    `,
    controller: function TodoCtrl() {
      this.todos = [
        'add more examples',
        'make better examples'
      ];
    }
  });

  angular.element(document).ready(function() {
    angular.bootstrap(document, [module.name], {strictDi: true});
  });

  </script>
</body>
```

[demo](https://jsbin.com/rizokix/11/edit?html,js,output).


## Structure

By using JSPM default structures, the &lt;project-name> code should be hosted in
"src/" and its main module should be "src/&lt;project-name>.js", in our case
"src/example-app.js".

It export an Angular module and includes all angular API calls. "*.specs.js"
files include mocha tests. Other ".js" files export plain JS objects; they will
be imported by the "src/example-app.js" to build the Angular app or by mocha
tests.

"src/services/*.js" includes our shared services, mainly our data-store
service.

If we were to define shared filters, we would define them in
"src/filters.js". Shared directives (like form validation directive) would go in
"src/directives.js".

"component/&lt;component-name>/&lt;component-name>.js" defines a component. The
directory might contain templates, css files and and mocha tests.


## How To

### Navigation

In this example, we will add a view to show when a shopping item has been added.


#### 1. first define how to access the view

In "src/components/shopping/shopping.html", for each item,
add the link to our future view:
```html
<li ng-repeat="item in $ctrl.items" class="item">
  <span class="main-item">{{item.$id}}</span>
  <a ng-href="#/lists/{{ $ctrl.listId }}/items/{{ item.$id }}"> info </a>
  <button ng-click="$ctrl.remove(item.$id)">&times;</button>
</li>
```

Hovering on the link should show the proper link. Clicking it should sent to the
home page, for now, while "ngRoute" is missing the new route configuration.


#### 2. setting the new route

In "src/config.js", find the routes configuration. It should look like:
```js
module.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {[...]})
    [...]
    .otherwise('/');
}]);
```

We will add our new route as follow:
```js
module.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    [...]
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
      resolve: {
        params: ['$route', $route => $route.current.params]
      }
    })
    .otherwise('/');
}]);
```

Reload the page (you might have to clear your cache), when clicking on an item
info link, the main view should now show "Failing to load item info".

It shows the "ea-shopping-item" inner text because this tag name is not
associated to a directive/component yet.


#### 3. Add a new services operation

We need to update our model to retrieve an item details. If you looked at the
`eaShopping` controller in "src/components/shopping/shopping.js, you noticed
we access the datastore with:

    eaCurrentUser.list(listId) -> Promise<ItemList>
    ItemList.ref() -> firebase.database.Reference

We just need to add a method to returning the ref to a specific item.

Locate the eaCurrentUser service "src/example-app.js" (our entry point):
```js
import services from 'example-app/services/index.js';

[...]

module.service('eaCurrentUser', services.datastore.CurrentUser);
```

Locate where datastore get defined in :
```
import datastore from 'example-app/services/datastore.js';

[...]

const services = {loadingFactory, Auth, datastore};

export default services;
```

Locate `ItemList` and implement `ItemList.itemRef`:
```js
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

  }

[...]

  /**
   * A firebase reference to a list item details.
   * @param  {string} itemId The item id/name.
   * @return {firebase.database.Reference}
   */
  itemRef(itemId) {
    return this.firebaseApp.database().ref(
      `/listItems/${this.uid}/${this.listId}/${itemId}`
    );
  }

[...]
}

```

While implementing the method, you should define some tests. See,
"src/services/datastore.specs.js" for more details.


#### 4. Define eaShoppingItem component

Create "src/components/shopping-item/shopping-item.js":
```shell
mkdir -p src/components/shopping-item
touch src/components/shopping-item/shopping-item.js
touch src/components/shopping-item/shopping-item.specs.js
```

Implement the component options in
"src/components/shopping-item/shopping-item.js"; it should be similar to
the eaShopping component:
```js
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
   * Set properties default values and listen for changes to the current user status.
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

```

The template is quite short and was written directly with the component options.
You could write it in a html file instead and import it (e.g.
`import template as './shopping-item.html!text';`)

While implementing the controller, you should write tests for the controller.
See "src/components/shopping-item/shopping-item.specs.js"
for more details.

Import the new tests in the in src/components/index.specs.js:
```js
import 'example-app/components/shopping-item/shopping-item.specs.js';
```

Import and add the component to the list of components in src/components/index.js:
```js
import rootApp from 'example-app/components/root-app/root-app.js';
import shopping from 'example-app/components/shopping/shopping.js';
import shoppingItem from 'example-app/components/shopping-item/shopping-item.js';
import shoppingLists from 'example-app/components/shopping-lists/shopping-lists.js';

/**
 * exampleApp components.
 * @type {object}
 */
const components = {
  rootApp,
  shopping,
  shoppingItem,
  shoppingLists
};

export default components;

```

#### 5. Register the component

In "src/example-app.js", import the component options and register the
component:
```js
module.component('eaShoppingItem', components.shoppingItem.component);
```

If you refresh the app and visit the an item info pages, it should now work.


## Reference

- [Angular](https://angularjs.org/).
- [Angular component](https://docs.angularjs.org/guide/component).
