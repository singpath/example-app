# Firebase

Store and sync data in realtime.


## Setup

Install firebase and angularFire as JSPM dependencies:
```shell
jspm install firebase@3
jspm install angularfire@2
```

Add angulireFire module to the list of dependencies and setup the firebaseApp
service; in src/example-app.js:
```js
import angular from 'angular'
import firebase from 'firebase';
import 'angularfire';

// set `angularFire` as a dependency.
const module = angular.module('exampleApp', ['firebase'])
  // add `firebaseApp` constant.
  .constant('firebaseApp', firebase.initializeApp({
    apiKey: 'AIzaSyBG-0rkAfYmmWIltG3ffevLu4n3ZYuIito',
    authDomain: 'example-app-8c809.firebaseapp.com',
    databaseURL: 'https://example-app-8c809.firebaseio.com'
  }));
```


## Usage

`angularFire` adds `$firebaseObject`, `$firebaseArray` and `$firebaseAuth`. They
should be used to synchronise firebase database queries and firebase
authentications process with the scope.

You can create a synchronized object like that:
```js
// <app-config></app-config> component
module.component('appConfig', {
  template: `
  <p ng-if="$ctrl.loading">loading...</p>
  <p ng-if="!$ctrl.loading">Online: {{$ctrl.config.online}}</p>
  `,

  controller: [
    '$firebaseObject',
    'store',
    class Ctrl {

      constructor($firebaseObject, store) {
        const ref = store.configRef();

        this.config = $firebaseObject(ref);

        this.loading = true;
        this.config.$loaded().then(() => {
          this.loading = false;
        });
      }

    }
  ]
});
```

Play with [full example](https://jsbin.com/nepexol/edit?js,output).


## Todo

- show rules.
- how to test rules.
- how to set db rules with firebase-tools.
- more firebase example


## Reference

- [Firebase Documentation](https://firebase.google.com/docs/database/web/start).
- [AngularFire](https://github.com/firebase/angularfire/blob/master/docs/quickstart.md)
