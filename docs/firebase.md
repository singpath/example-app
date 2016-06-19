# Firebase

Store and sync data in realtime.


## Setup

Install firebase as a JSPM dependency and some helper:
```shell
jspm install firebase@3 npm:rx-firebase npm:rxjs@5.0.0-beta.8
```

Add the firebaseApp service and extend firebase with Observable methods; in
src/example-app.js:
```js
import angular from 'angular'
import firebase from 'firebase';
import Rx from 'example-app/tools/rx.js';

import ngRxSubscribe from 'angular-rx-subscribe';
import rxFirebase from 'rx-firebase';

// extend Firebase with `rx-firebase`.
rxFirebase.extend(firebase, Rx.Observable);

// set `angular-rx-subscribe` as a dependency.
const module = angular.module('exampleApp', ['rxSubscribe'])
  // add `firebaseApp` constant.
  .constant('firebaseApp', firebase.initializeApp({
    apiKey: 'AIzaSyBG-0rkAfYmmWIltG3ffevLu4n3ZYuIito',
    authDomain: 'example-app-8c809.firebaseapp.com',
    databaseURL: 'https://example-app-8c809.firebaseio.com'
  }))
  // extend Rx.Observable with `$subscribe` method.
  .run(['$rootScope', function($rootScope) {
    ngRxSubscribe.extend(Rx.Observable, $rootScope);
  }]);
```


## Usage

`rx-firebase` adds `Firebase.auth.Auth.observeAuthState`. which behaves
like `onAuthStateChanged` but returns an observable, adds
`Firebase.database.Query.prototype.observe(eventType)`. which behaves like
`on(eventType, handler)` but return an observable, and adds
`Firebase.database.Query.prototype.observeChildren(eventType)` which compose observables
on the "child_*" event type to keep an array ordered and in sync with firebase
refence.


You can create a reference observable with:
```js
this.shopping = firebaseApp.database.ref(
  `/listItems/${uid}/${name}`
).orderByKey().observeChildren();
```

To consume the observable in your template (assuming you have
`angular-rx-subscribe` setup):
```html
<ul rx-subscribe="$ctrl.shopping">
  <li ng-repeat="item in $rx.next">{{item.$key}}</li>
</ul>
```

## Todo

- show rules.
- how to test rules.
- how to set db rules with firebase-tools.


## Reference

- [Firebase Documentation](https://firebase.google.com/docs/database/web/start).
- [angular-rx-subscribe](https://www.npmjs.com/package/angular-rx-subscribe).
- [rx-firebase](https://www.npmjs.com/package/rx-firebase).
- [RxJS v5](http://reactivex.io/rxjs/manual/index.html).
