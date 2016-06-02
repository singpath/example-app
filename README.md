# Example App

Example of Angular development using JSPM.

## Requirements

- git;
- python;
- nodejs v4+ with npm v3 (npm v2 probably work);
- a bash terminal.

## Setup

You simply clone the app and install the dependencies:
```
git clone https://github.com/singpath/example-app.git
cd example-app
npm install
```

## How it was setup

The project was setup by first installing [jspm] and [mocha]:
```shell
mkdir example-app
cd example-app/
npm init -y
npm install jspm@0.17.0-beta.17 mocha source-map-support --save-dev
```

    Note: we are using the beta version of JSPM because it works better with Travis,
    but version 0.16 would be fine for this example.

Then setting up [jspm] \(using default options except for the main script set to
`example.js` - which map `src/example.js`):
```
./node_modules/.bin/jspm init
```

We then install the dependencies [Angularjs] and [chai] \(for testing):
```shell
./node_modules/.bin/jspm install angular@1.5 chai
```

We then setup our skeleton:
```shell
touch index.html
touch app.js                # bootstrap angular app
touch tests.js              # bootstrap tests
mkdir -p src
touch src/example.js        # plain js components
touch src/example.specs.js  # plain mocha tests file
```

    Note: JSPM, with the default `init` setting, assume that the app is written
    in `src/` but that `./` will be served as the root; that's why we put
    `index.html` at the root and example-app code in `src`. It's matter of
    preference to put the bootstrap angular js file `app.js` with `index.html`
    or in `src/`.

Finally we edit our package.json to setup the test and start command:
```json
{
  [...]
  "scripts": {
    "build:test": "rm -rf dist/ && mkdir -p dist/ && jspm build ./tests.js dist/test.js --skip-rollup --format cjs",
    "clean": " rm -rf dist/",
    "postinstall": "jspm install",
    "start": "python -m SimpleHTTPServer 8000",
    "test": "npm run build:test && mocha --require source-map-support/register dist/test.js"
  },
  [...]
}
```
The `start` command simply starts a python standard lib static server.

The `test` command bundle all the tests and dependencies into dist/test.js in
a format suitable for nodejs, and run it with [mocha] \(a nodejs test runner).

The test bundle includes a source map. Using `source-map-support`, an error
trace pointing an error to a position in the bundle file will be mapped to the
original source file error.

To run them:
```shell
npm test
npm start
```

## Reference

- [AngularJS v1 guides](https://docs.angularjs.org/guide)
- [JSPM v0.16 Guide](http://jspm.io/0.17-beta-guide/)
- [mocha]

[Angularjs]: https://angularjs.org
[chai]: http://chaijs.com/
[jspm]: http://jspm.io/
[mocha]: https://mochajs.org/
