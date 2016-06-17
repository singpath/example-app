# Observable

Observables allow orchestration of complex asynchronous and iterative operations
and mixing different asynchronous or iteration pattern (array, event emitter,
promise, nodejs callback, etc...).

In the context of Angular, because we are using one interface
(`anObservable.subscribe(...)`), we can notify Angular scope of any changes
explicitly. We do not need to use Angular specific asynchronous services ($http,
$timeout, $q, $angularFire, etc...) which prevent easy sharing of code between
front-end and back-end application.

One library to interact with the firebase database can be written for both node
or browser applications. It can use Promise / Observables to interact with, or
consume the data; To bridge with Angular scope cycles, the browser application
controller just need to use `scope.$applyAsync()`:
```js
function MyController($scope, someService) {
  const subscription = someService.getSomeObservable().subscribe(
    x => $scope.$applyAsync(() => this.x = x)
  );

  this.$onDestroy = () => subscription.unsubscribe();
}
```

Using `angular-rx-subscribe` we can remove some of the boilerplate (see below).


## Setup

We are using RxJS v5 beta because it uses the ES stage 1 proposal API and
because AngularJS 2 uses it.

To install RxJS v5 as a jspm dependency:
```
jspm install npm:rxjs@5.0.0-beta.8 npm:angular-rx-subscribe
```

Create the example-app/tools/rx.js (in src/tools/rx.js):
```
/**
 * example-app/tools/rx.js - Export Rx.
 */

export Rx from 'rxjs/bundles/Rx.umd.js';
```

There's different way to import RxJS. For now, we will import the whole library
as a bundle. Having our own module will allow us to build our own smaller RxJS
bundle later.


Then we Register the new operator and directive (`src/example-app.js`):
```js
import angular from 'angular'
import Rx from 'example-app/tools/rx.js';

import ngRxSubscribe from 'angular-rx-subscribe';

// set `angular-rx-subscribe` as a dependency.
const module = angular.module('exampleApp', ['rxSubscribe'])
  // extend Rx.Observable with `$subscribe` method.
  .run(['$rootScope', function($rootScope) {
    ngRxSubscribe.extend(Rx.Observable, $rootScope);
  }]);
```


## Usage

Services should return data as Observable, controller should save the
Observables as instance properties. Components views can use rxSubscribe to
assign an observable notification value to the scope. E.g. a user and
login example:
```js
module.component('user', {
  template: `
    <!--
    `rxSubscribe` subscribes to an observable and adds `$rx` (by default)
    to the scope. $rx.next, $rx.error and $rx.complete holds the next,
    error and complete notifications.
    -->
    <div rx-subscribe="$ctrl.user" rx-as="$rx">
      <p ng-if="$rx.error">{{$rx.error}}<p>
      <p ng-if="$rx.next">Registered since: {{$rx.next|date}}</p>
      <login></login>
    </div>
  `,
  controller: ['eaLists', fonction UserCtrl(eaLists) {
    this.user = eaLists.user.get();
  }]
})
.component('login', {
  template: `
    <div rx-subscribe="$ctrl.user" rx-as="$rx">
      <p ng-if="$rx.next"><button ng-click="$ctrl.signOut()">Sign out</button></p>
      <p ng-if="$rx.next"><button ng-click="$ctrl.register()">Register</button></p>
    </div>
  `,
  controller: ['eaLists', fonction LoginCtrl(eaLists) {
    this.user = eaLists.user.get();
    this.register = () => eaLists.register();
    this.signOut = () => eaLists.signOut();
  }]
});
```

## Observable primer

### Core objects and interfaces

You create an `Observable` by providing a `subscriber` function:
```js
const src = new Rx.Observable(subscriber);
```

A subscriber is a function that will start some process which will notify
progress via an `Observer` object. It returns a function allowing to stop
to process. E.g: a timer could be design as follow:
```js
function subscriber(observer) {
  // a counter
  let count = 0;
  // an async process
  const timerId = setInterval(() => {
      if (count < 5) {
        observer.next(count++);
      } else {
        observer.complete();
      }
    },
    1000
  );

  // A teardown function. Run when:
  //
  // - the process complete;
  // - or the consumer unsubscribe.
  //
  return () => clearInterval(timerId);
}
```

An Observer has "next", "error" and "complete" methods to push notifications to.

Note that the subscriber function is only run when/if the Observable is
consumed, and once for each consumer.

An Observable provides a `subscribe` method that takes either an Observer object
or three optional handlers for "next", "error" and "complete" notification:
```
// subscribe to observable and register handler for all notifications.
const subscription1 = src.subscribe(
  count => console.log(count),
  err => console.error(err),
  () => console.log('completed')
);
// subscribe to observable and register to the error notifications.
const subscription2 = src.subscribe({
  error: err => console.error(err)
});
```

The subscribe method returns a `Subscription` object. Its `unsubscribe` allow
to stop the observing notifications. E.g.:
```js
const subscription = src.subscribe({
  next: count => console.log(count)
});

// Stop observable after 4 seconds.
setTimeout(() => subscription.unsubscribe(), 4000);
```
It can be called many time, even if the Observable is completed.

[See this example is action](https://jsbin.com/zufovek/11/edit?js,console)


### Operators

Operators are extensions allowing to create an Observable or create. For
example, "Observable.of(...args)" will create an observable that will
emit each argument. A basic implementation will look like that:
```js
Observable.of = function() {
  const values = Array.from(arguments);

  return new Observable(observer => {
    values.forEach(i => observer.next(i));
    observer.complete();
  });
}
```

RxJS provide a variety of operators which transform data or async patterns to
Observable, like `Rx.Observable.from(someArray)`.

"Observable.prototype.map" is a method which transform an observable
notifications by applying a method on each "next" notification value.
Operator to never change an Observable; they chain one or many to a new one.
A basic implementation implementation will look like that:
```js
Observable.prototype.map = function(callback) {
  // we return a new Observable, which when subscribed to, will subscribe to the
  // Original Observable and forward all notification, applying the callback on
  // the "next" ones.
  return new Observable(observer => {
    // using shorthand functions' lexical binding to reference the original
    // observable.
    const subscription = this.subscribe({
      next: value => observer.next(callback(value)),
      error: err => observer.error(err),
      complete: () => observer.complete(),
    });

    // to teardown, we just need to unsubscribe to the original Observable.
    return () => subscription.unsubscribe();
  })
}
```

## RxJS Operators

Observable is based on a simple constructor. The complexicity comes from the
huge number of operators. We document only the one we use.

[Full list of creation operator](http://reactivex.io/rxjs/manual/overview.html#categories-of-operators).


### Creation Operators

- Rx.Observable.from(arrayOrPromise)
- Rx.Observable.of(...args)
- Rx.Observable.never() - an Observable that never completes.
- Rx.Observable.throw(err) - an Observable that imediatly emit an error.
- Rx.Observable.fromEvent(DOMElement, eventName).
- Rx.Observable.interval(period) - emit a counter after each time period (in ms).
- Rx.Observable.timer(delay) - emit "next" and "complete" after the the delay.
It can also start an interval after the delay instead of completing, using
`Rx.Observable.timer(delay, period)`.


### Filtering Operators

Those create new Observables which filter the original Observable notifications:

- Rx.Observable.prototype.filter(predicateFn) - drops "next" if
`predicateFn(value)` returns false.
- Rx.Observable.prototype.debounceTime(period) - delay a "next" notification and
only emit it if no other "next" notification have been sent during the period
(in ms).
- Rx.Observable.prototype.throttleTime(period) - emit a "next" notification
then drop all "next" notification for the duration of the period (in ms).
- Rx.Observable.prototype.auditTime(period) - same than throttleTime but emit
the last notification in the period instead of the first.
- Rx.Observable.prototype.distinctUntilChanged(compareFn) - drops continuous
identical notifications.
- Rx.Observable.prototype.take(max) - emits at most `max` number of "next"
notifications, then completes.
- Rx.Observable.prototype.last() - emits the last "next" notification when the
original Observable completes (and complete itself).
- Rx.Observable.prototype.skipWhile(predicateFn) - drops "next" notifications
while predicateFn(value) returns false.
- Rx.Observable.prototype.ignoreElements() - drops all next notifications.
Useful when only interested by eventual "error" or "complete" notification.


### Transformation Operators

- Rx.Observable.prototype.map(projectFn) - applies projectFn(value) on each
"next" notification and emits the result.
- Rx.Observable.prototype.scan(accumulatorFn, seed) - applies
accumulatorFn(lastResultOrSeed, value) on "next" notification and emit each
intermediary result.
- Rx.Observable.prototype.mergeMap(projectFn) - like map but projectFn(value)
must return an Observable (or promise). The values that observable emit will be
flatten.
- Rx.Observable.prototype.switchMap(projectFn) - like mergeMap, but it will
unsubscribe from the previous Observable returned by projectFn(value) before
subscribing to the new one.

[Examples](https://jsbin.com/sehafok/28/edit?js,console).


### Combining Operators

- Rx.Observable.prototype.startWith(value) - combine the operator with an
initial value to emit.
- Rx.Observable.prototype.merge(anObservable) - merge two (or more) observable
into one.
- Rx.Observable.prototype.concat(anObservable) - chain two (or more) observable
together.
- Rx.Observable.prototype.combineLatest(anObservable) - combine
the value of the two observables; each time one observable emit a value,
emit that value with the last value emitted by the other observable. By default
, it emit an array with both values. You can provide more than one

[Examples](https://jsbin.com/sehafok/21/edit?js,console).


### Subject

`Rx.Subject` is both an `Observable` that can be subscribed to and an observer
that notifications can be pushed to.

It can be used to broadcast data to multiple subscriptions. Unlike regular
Observable, all subscriptions share the same data source. It's also a hot
Observable; notifications sent before a subscription starts won't be received
by the new subscriptions:
[example](https://jsbin.com/bekiyok/2/edit?js,console).


### Scheduler

Scheduler are not part of the Observable specification. It's a RxJS
implementation details. It allow to configure when operations take place.

RxJS operator do not send notification (or run mapper function) directly, they
shedule them and let the sheduler run them when appropriated. By default, RxJS
sheduler run immediatly, but you use a scheduler running tasks in the next tick
or the next event loop instead.

It's unlikely to be useful for most application but it's part of most operators
API. You can just dismiss it except maybe in tests where the the order of
execution can matter.


## Alternatives

[Bacon], [Kefir], [Most.js] or [RxJS v4] to name a few.


## Ref

- [ES Observable proposal](https://github.com/zenparsing/es-observable)
- [RxJS v5](http://reactivex.io/rxjs/manual/overview.html#what-are-operators-)


[Bacon]: https://baconjs.github.io/
[Kefir]: https://rpominov.github.io/kefir/
[Most.js]: https://github.com/cujojs/most
[RxJS v4]: https://github.com/Reactive-Extensions/RxJS
