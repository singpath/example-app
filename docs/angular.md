# AngularJS 1

AngularJS is a framework used to write single pages. It promotes MVC structure
and dependency injection.


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


## TODO

Document:

- structure.
- modules.
- services.
- component.


## Reference

- [Angular](https://angularjs.org/).
- [Angular component](https://docs.angularjs.org/guide/component).
