# Unit Testing

## setup

Install Nodejs mocha via our singpath helper:
```
npm install @singpath/tools --save-dev
```

It links together [mocha], [instanbul] \(coverage) and [systemjs-istanbul-hook].

Install [chai] \(assertion library) as a jspm dependency:
```
jspm install npm:chai npm:sinon-chai npm:dirty-chai

```

[sinon-chai] and [dirty-chai] are chai plugins extending the [chai] API.


## Mocha + chai

The tests are defined using [mocha], Nodejs test runner, and [chai], an
assertion library. For spy, with will use [sinon] with its chai plugin,
[sinon-chai].

example.js:
```js
export function Controller(someMath) {
  this.x = 0;
  this.y = 0;
  this.total = 0;

  this.update = () => this.total = someMath.add(this.x + this.y);
}

Controller.$inject = [];

```

example.specs.js:
```js
// Grouping testing framework import, chai plugin registration and our helpers
// in src/tools/chai.js
import {expect, sinon} from 'example-app/tools/chai.js';

import {Controller} from './example.js'

describe('example Controller', function() {

  describe('update', function() {

    it('should assign the addition of x and y to total', function() {
      // to compare reference (I could use an unlikely number instead);
      const result = {};
      const someMath = {
        add: sinon.stub().returns(result)
      };
      const ctrl = new Controller(someMath);

      ctrl.x = 1;
      ctrl.y = 2;
      ctrl.update();

      expect(someMath.add).to.have.been.calledOnce();
      expect(someMath.add).to.have.been.calledWithExactly(1, 2);
      expect(ctrl.total).to.equal(result);
    });

  });

});

```

    Note: `describe` and `it` are global, injected at run time with
    other helpers like `beforeEach` or `afterEach`.


## Test Run

To run example-app tests:
```shell
npm test
```

The tests are run in Nodejs using mocha API and JSPM `import`. Our
runner follows those steps:

1.  loads JSPM configurations;
2.  starts a [mocha] runner to collect tests cases;
3.  using JSPM loader, load test files, filling the [mocha] runner;
4.  run the test cases.

See [@singpath/tools] and [tools/bin/test.js] for more details.


## Coverage

To run example-app tests with coverage:
```shell
npm run cover
```

It takes the following steps:

1.  loads JSPM configurations;
2.  register a JSPM loader hook to add [instanbul] instrumentations to the
    source code;
3.  starts a [mocha] runner to collect tests cases;
4.  using JSPM loader, load test files and fill the [mocha] runner with test
    cases;
5.  run the test cases;
6.  collect coverage data and save them in a JSON file (it can used with
    instanbul CLI to create different reports);
7.  create default reports using [instanbul] API.


See [@singpath/tools] and [tools/bin/cover.js] for more details.


## References

- [Testing and coverage with SystemJS, Mocha + Istanbul](http://guybedford.com/systemjs-mocha-istanbul)
- [mocha]
- [chai]
- [sinon]
- [instanbul]


[mocha]: https://mochajs.org/
[chai]: http://chaijs.com/
[sinon]: http://sinonjs.org/
[sinon-chai]: https://github.com/domenic/sinon-chai
[dirty-chai]: https://www.npmjs.com/package/dirty-chai
[instanbul]: https://gotwarlost.github.io/istanbul/
[systemjs-istanbul-hook]: https://www.npmjs.com/package/systemjs-istanbul-hook
[@singpath/tools]: https://www.npmjs.com/package/@singpath/tools
[tools/bin/test.js]: ../tools/bin/test.js
[tools/bin/cover.js]: ../tools/bin/cover.js
