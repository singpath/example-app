# chai-angular-injectable

Check a function can be safely used with Angular 1 dependency injector.

Support inline Array annotation and property annotation.


## Install

```
npm install --save-dev mocha chai chai-angular-injectable
```

## Usage

Register the plugin:

```js
const chai = require('chai');
const injectableChai = require('./index.js');

chai.use(injectableChai);
```

Test your factories, services and controllers:

```js
var SomeCtrl = ['foo', function(foo) {}];
var fooFactory = function($log) {};

fooFactory.$inject = ['$log'];

describe('SomeCtrl', function() {

  it('should be injectable', function() {
    expect(SomeCtrl).to.be.injectable;
  });

});

describe('fooFactory', function() {

  it('should be injectable', function() {
    expect(fooFactory).to.be.injectable;
  });

});
```
