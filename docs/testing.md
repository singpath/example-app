# Unit Testing

## setup

Install Nodejs mocha:
```
npm install mocha --save-dev
```

Install the chai as a jspm dependency:
```
jspm install npm:chai

```


## Mocha + chai

The tests are defined using [mocha], Nodejs test runner, and [chai], an
assertion library.

example.js:
```js
export function Controller() {
  this.x = 0;
  this.y = 0;
  this.total = 0;

  this.update = () => this.total = this.x + this.y;
}

Controller.$inject = [];

```

example.specs.js:
```js
import {expect} from 'chai';

import {Controller} from './example.js'

describe('example Controller', function() {
  describe('update', function() {
    it('should assign the addition of x and y to total', function() {
      const ctrl = new Controller();

      ctrl.x = 1;
      ctrl.y = 2;
      ctrl.update();
      expect(ctrl.total).to.equal(3);
    });
  });
});

```

    Note: `describe` and `it` are global, injected by mocha at run time with
    other helpers like `beforeEach` or `afterEach`.


## Test Run

The tests are run in Nodejs using mocha CLI. To bridge JSPM and Nodejs, we first
need to bundle the tests and dependency into a Nodejs module format:
```
mkdir -p tests/
jspm build src/example.specs.js tests/bundle.js --skip-rollup --format cjs
```

It can then be run with mocha:
```
./node_modules/.bin/mocha tests/bundle.js
```

It works but any error will trace back to the bundle file wich is unhelpful.
Thankfully, the bundle include a source map which map the the transcoded code
to the source code. Using the `source-map-support` npm package, NodeJS will
translate the traceback error message path to the source file paths:
```
npm install source-map-support --save-dev
./node_modules/.bin/mocha --require source-map-support/register tests/bundle.js
```

We can write a bash script to combine those two commands, edit the script
command in package.json to point to the script and just use `npm run test` or
`npm test`:
```
mkdir -p tools/bin
touch tools/bin/test.sh
chmod +x tools/bin/test.sh
```

`tools/bin/test.sh`:
```shell
#!/usr/bin/env bash
set -e

SRC=./src/example.specs.js
DIST=_test
DEST=${DIST}/test.js

# Clean up
rm -rf "$DIST"
mkdir -p "$DIST"

# Transcode and bundle tests in a format Nodejs can load.
./node_modules/.bin/jspm build "$SRC" "$DEST" --skip-rollup --format cjs

# Run test using mocha (test runner).
./node_modules/.bin/mocha --require source-map-support/register "$DEST"
```

package.json (show only relevent fields):
```json
{
  "scripts": {
    "clean": "rm -rf _test/",
    "postinstall": "jspm install",
    "start": "python -m SimpleHTTPServer 8000",
    "test": "./tools/bin/test.sh"
  },
  "devDependencies": {
    "jspm": "^0.17.0-beta.17",
    "mocha": "^2.5.3",
    "source-map-support": "^0.4.0"
  }
}
```

Running tests:
```shell
npm test
```


## Coverage

We will use the same strategy to run tests with coverage:

- install istanbul and remap-istanbul;
- build tests;
- run the tests with istanbul instructions;
- remap the coverage data to the source file;
- build the report.

See [tools/bin/cover.sh](../tools/bin/cover.sh) for more details.

TODO: fix uncovered line report.


## References

- [mocha](https://mochajs.org/)
- [chai](http://chaijs.com/)
- [istanbul](https://gotwarlost.github.io/istanbul/)
- [source-map-support](https://github.com/evanw/node-source-map-support)
- [remap-istanbul](https://github.com/SitePen/remap-istanbul)
