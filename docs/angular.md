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

Module are registry of directives, services and filter. A module can inherite
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

Directives associate some routine to a DOM elements or attributes. It can use
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

Controllers are used as bridges between views and models, and augment a scope
with values and function. They can either receive the scope to manipulate it or
an instance of the controller can be assign to a scope property (`$ctrl` by
default for component controllers). We will use the later strategy. It shows
explicitly where a value comes from and avoid errors associated with
prototypical inheritance.

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

Services are singleton object which can be provided to injectable function,
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
we define a root component "app"; it define the general layout and use
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

By using JSPM default structures, the <project-name> code should be hosted in
"src/" and its main module should be "src/<project-name>.js", in our case
"src/example-app.js".

It export an Angular module and includes all angular API calls. "*.specs.js"
files include mocha tests. Other ".js" files export plain JS objects; they will
be imported by the "src/example-app.js" to build the Angular app or by mocha
tests.

"src/services.js" includes our shared services and mainly our data-store
service. For a bigger applications, the services would be split other multiple
"services/*.js" files.

If we were to defined shared filters, we would define them in
"src/filters.js". Shared directive (like form validation directive) would go in
"src/directives.js".

"component/<component-name>/<component-name>.js" defines component. A
"component/<component-name>/" might contain templates, css files and and mocha
tests.


## How To

### Navigation

In this example, we will add view to show when a shopping item has been added.


#### 1. first define how to access the view

In "src/components/shopping/shopping.html", for each item,
add the link to our future view:
```html
<li ng-repeat="item in $rx.next" class="item">
  <span class="main-item">{{item.$key}}</span>
  <a ng-href="#/lists/{{ $ctrl.listId }}/items/{{ item.$key }}">info</a>
  <button ng-click="$ctrl.remove(item.$key)">&times;</button>
</li>
```

Hovering on the link should show the proper link. Clicking it should sent to the
home page, for now.


#### 2. setting the new route

In "src/example-app.js", find routes configuration. It should look like:
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

To shows the "ea-shopping-item" inner text because this tag name is not
associated to a directive/component yet.


#### 3. Add new services operation

We need to update our model to retrieve an item details.

Locate the eaList service "src/example.js":
```js
import * as services from 'example-app/services.js';

[...]

module.service('eaLists', services.Lists);
```

Locate the `List` class in "src/example.js" and the `List.shoppingList(name)`
method; It returns an instance of `ShoppingList` which current models retrieving
a list of items and updating the list.

Locate `ShoppingList` and define a new method to retrieve the details of one
item:
```js
export class ShoppingList {

  /**
   * A shopping list service.
   *
   * @param   {string} name  list name
   * @param   {Lists}  lists lists service
   */
  constructor(name, lists) {
    this.lists = lists;
    this.db = lists.firebaseApp.database();
    this.user = lists.user;

    this.name = name;
  }

  [...]

  /**
   * Return an observable monitoring the details of an item.
   *
   * While the user is not logged in, it emits undefined.
   *
   * If the item doesn't exist, it emit an object with $value set to null.
   *
   * @param  {string}              item item name.
   * @return {Observable<?Object>}
   */
  itemDetails(item) {

    // observe user registration details.
    return this.user.get().switchMap(user => {
      const uid = user && user.$key;

      if (!uid || user.$value === null) {
        return Rx.Observable.of(undefined);
      }

      return this.db.ref(`/listItems/${uid}/${this.name}/${item}`).observe('value');
    });
  }

}
```

While implementing the method, you should define some tests. See,
["src/example-app.specs.js"](../src/example-app.specs.js) and
`describe('itemDetails', function() {[...]})` for more details.


#### 4. Define eaShoppingItem component

Create "src/components/shopping-item/shopping-item.js":
```shell
mkdir -p src/components/shopping-item
touch src/components/shopping-item/shopping-item.js
touch src/components/shopping-item/shopping-item.specs.js
```

Implement the component options in
"src/components/shopping-item/shopping-item.js":
```js
/**
 * example-app/components/shopping-item/shopping-item.js - defines the
 * eaShoppingItem component.
 */

class ShoppingItemController {

  /**
   * Receive dependencies and initiate (set zero value).
   *
   * @param  {List} eaLists List service
   */
  constructor(eaLists) {
    this._lists = eaLists;
    this.list = undefined;
    this.item = undefined;
  }

  /**
   * Controller hook called each time a component property changes.
   *
   * See https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks
   *
   * Update the list service each time the list id changes and update the item
   * details each time the list id or item id changes.
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

  // Other hooks
  // See https://docs.angularjs.org/api/ng/service/$compile#life-cycle-hooks

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
  cont
```

The template is quite short and was written directly with the component options.
You could write it in a html file instead and import it (e.g.
`import template as './shopping-item.html!text';`)

While implementing the controller, you should write tests for the controller.
See [src/components/shopping-item/shopping-item.specs.js](../src/components/shopping-item/shopping-item.specs.js)
for more details.


#### 5. Register the component

In "src/example-app.js", import the component options and register the
component:
```js
import {component as eaShoppingItem} from 'example-app/components/shopping-item/shopping-item.js';

[...]

module.component('eaShoppingItem', eaShoppingItem);
```

If you refresh the app and visit the an item info pages, it should now work.


## Reference

- [Angular](https://angularjs.org/).
- [Angular component](https://docs.angularjs.org/guide/component).
