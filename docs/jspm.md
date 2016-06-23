# JSPM primer

JSPM is used to manage dependencies and to build the application for production.

The production build is required to optimize the application size and limit
the number of assets. HTTP 1 is a stateless protocol and each assets an
application require generates a new connection.

Unlike alternatives, you mostly only need to manage dependencies via `import`
statements in your source code; there is no need to maintain lists of resources
in various config file. It's also more explicit where resources are coming from.


## setup

Install the nodejs JSPM CLI globally:
```shell
npm install -g jspm
```

Then setup your project:
```shell
mkdir my-project
cd my-project
npm init -y
npm install jspm@^0.17.0-beta.17 --save-dev
jspm init -y
mkdir src
touch src/my-project.js
```

`node_module` holds jspm (and other npm tools you might need, like a test
runner or linting tools).

`jspm_packages` holds your dependencies: front-end dependencies and
JSPM dependencies (plugins and loaders).

`jspm.config.js` defines settings for the module loader `SystemJS`. `SystemJS`
acts as a polyfill for the upcoming `System`, the Javascript api for the ES6
module  loader. It allows to load any type of JavaScript modules that ES6
modules will replace.


## ES6 modules

ES6 modules are defined using the `export` keyword:
```js
// mymodule.js

// default export
export default function() {}

// named export
export function something(){}
export const somethingElse = foo;
```

They then can be loaded using the `import` keyword:
```js
// import default object, in this case a function
import mymodule from './mymodule.js';
// or
import mymodule as someAlias from './mymodule.js';

// import named object
import {something, somethingElse} from './mymodule.js';
// or
import {something as someAlias, somethingElse as someOtherAlias} from './mymodule.js';

// import all
import * as all from './mymodule.js';
```

The module syntax is part the ES6/ES2015 standard. The loader is still in
development with Microsoft Edge browser starting experimental deployment.


## Dependencies

To install dependencies, use the JSPM CLI; e.g. to install `angular`:
```shell
jspm install angular@1.5.5
```

It will install angular in `jspm_packages`, update the list of dependencies in
`package.json` and add configuration to `jspm.config.js`.

To use angular in the application, you `import` it:
```js
import angular from 'angular';

angular.module('myProject', []);
```

JSPM support its own registry and the NPM registry. By default, it try to find
a package JSPM registry. If it fails, it will suggest to explicitly install it
from npm (using `npm:` prefix):
```
jspm install npm:some-package
```


### CSS assets

JSPM can also load other type of resource using the right plugin, e.g. to load
CSS files, you need the `css` plugin:
```shell
jspm install css
```

Then you can import CSS files by adding '!css' at the then end of the import. It
will indicate which loaded to use to import the file. Because the matching
file extension, you can just use '!' instead of '!css'. E.g:
```js
import './my-project.css!css';
import 'some-dependency/some.css!css'
```

Equivalent to:
```js
import './my-project.css!';
import 'some-dependency/some.css!'
```


### Text assets

You can also load text and assign it to a variable using the text loaded:
```shell
jspm install text
```

Then:
```js
import template from './template.html!text'
```


## Development

Loading and trans-coding modules happens in the browser. You need to include
`system.js`, the jspm configuration and then use the System API to load modules:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Example App</title>
  </head>
  <body>

    [...]

    <script src="jspm_packages/system.js"></script>
    <script src="jspm.config.js"></script>

    <script>
      Promise.all([
        System.import('angular'),
        System.import('example-app')
      ]).then(modules => {
        const angular = modules[0];
        const exampleApp = modules[1];
        const module = angular.module('exampleApp.bootstrap', [exampleApp.module.name]);

        // Overwrite constant here; e.g.:
        //
        // module.constant('firebaseApp', firebase.initializeApp([...]));

        angular.element(document).ready(function() {
          angular.bootstrap(document, [module.name], {strictDi: true});
        });
      }).catch(
        console.error.bind(console)
      );
    </script>

  </body>
</html>
```


## Production build

The build command is `jspm build [main module] [output script]`:
```
mkdir -p dist/
jspm build /some/entry/point.js ./dist/my-project.js --minify --skip-source-maps
```

The return script is self contain and can be used directly:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Project</title>
  </head>
  <body>
    [...]
    <script src="/dist/my-project.js"></script>
  </body>
</html>
```

By default it will create a [UMD](https://github.com/umdjs/umd) bundle and
transcode the code to ES5.

It can be tweaked to not include dependencies (to load from external servers):
```
jspm build example-app - angular \
  --global-name exampleApp \
  --global-deps "{'angular/angular.js':'angular'}" \
  --format umd --skip-source-maps
```

"example-app - angular" request to build "example-app" module, minus any
dependency to angular. "--global-name" defines the global variable the
"example-app" will be set to. "--global-deps" defines which global variable to
seek to find the missing modules.

See [tools/bin/build.sh](./tools/bin/build.sh) for more details.


## Alternative to JSPM

### For-purpose bash script, Make, Gulp, Grunt...

Those scripts usually grow in complexity with the number of dependencies and
the size of the application. It can be difficult to maintain.

Once the HTTP2 protocol is fully supported and browsers implement the module
loader natively, the building process will be limited to compressing assets.
A simple bash script would then work.


### Webpack

[Webpack](https://webpack.github.io/) is similar to JSPM. It's simpler, relying
only the npm registry, and has better support but uses primarily nodejs modules
and doesn't load/transcode in the browser; the application needs to be build
during developement to run in the browser.


## References

- [JSPM](http://jspm.io/)
- [JSPM v0.17 Guide](http://jspm.io/0.17-beta-guide/)
- [SystemJS](https://github.com/systemjs/systemjs)
- [ES6 module](http://exploringjs.com/es6/ch_modules.html)
