# Linting

Linting, analyzing code for potential errors, is done with eslint.
```shell
npm run lint
```


## setup

Install `eslint`, a set of default rules (`eslint-config-xo`) and an ES6 plugin.
```shell
npm install --save-dev eslint eslint-config-xo
npm install --save-dev babel-eslint eslint-plugin-babel
```

Setup a YAML or JSON encoded eslint config file:
```shell
echo "extends: xo/esnext" > .eslintrc.yml
```

To run lint, add a lint command to `package.json` (add it to the map of command
in the `scripts` object):
```json
{
  "scripts": {
    "lint": "eslint src/ index*.js",
    "test": "./tools/bin/test.sh"
  }
}
```

Then:
```shell
npm run lint
```

## Rules

With the default rules and this project at this stage, it would show 369 errors;
e.g.:

    /Users/me/dev/example-app/index.js
    16:33  error  Unexpected function expression                       prefer-arrow-callback
    16:41  error  Missing space before function parentheses            space-before-function-paren
    17:3   error  Expected indentation of 1 tab character but found 0  indent

Notice the last column; it shows an error code which can be looked up on eslint
documentation:

    http://eslint.org/docs/rules/prefer-arrow-callback
    http://eslint.org/docs/rules/space-before-function-paren
    http://eslint.org/docs/rules/indent

You can then adjust the rules settings to your coding style; `.eslintrc.yml`:
```yml
extends: xo/esnext
rules:
  prefer-arrow-callback: "off"
  indent:
    - "error"
    - 2
  space-before-function-paren:
    - "error"
    - "never"
```

Rules can be set "off", "warn" (shows warning but doesn't fail) or "error".
Some rules can be configured: indent should be 2 spaces. The rule definition
explains how to config it.

After those adjustments we are down to 87, with many "no-undef" errors, e.g.:

    /Users/me/dev/example-app/src/tools/inspect.specs.js
     5:1   error  'describe' is not defined                no-undef

We do no want to turn this rule off but eslint needs to allow mocha globals.
Thankfully, we can indicate in which environment the code will run:
```yaml
extends: xo/esnext
env:
  es6: true
  mocha: true
  shared-node-browser: true
rules:
  prefer-arrow-callback: "off"
  indent:
    - "error"
    - 2
  space-before-function-paren:
    - "error"
    - "never"
```

Down to 44 error. Check [.eslintrc.yml](../.eslintrc.yml) for the final set of
rules.

Once the rules are stable, you can change the the lint command to:
```json
{
  "scripts": {
    "lint": "eslint src/ index*.js --fix",
    "lint-no-fix": "eslint src/ index*.js",
    "test": "./tools/bin/test.sh"
  }
}
```

`npm run lint` will fix trivial errors (like trailing white spaces). The
`lint-no-fix` command could be used in git hook or a CI test.


## Rule exceptions

You sometime need to turn off a rules for just one instance. E.g. `index.js` is
exclusively run in the browser and need to access `document`. The error can be
disable with those comments:
```js
/* eslint-env browser */
```

We could also have added document in list of allowed globals:
```js
/* global document:true */
```

Or by disabling the rules:
```js
/* eslint no-undef: "off" */
```

## Reference

- [eslint](http://eslint.org/)
- [eslint-config-xo](https://github.com/sindresorhus/eslint-config-xo)
- [eslint-plugin-babel](https://github.com/babel/eslint-plugin-babel) (include
extra rule definitions - starting by "babel/")
