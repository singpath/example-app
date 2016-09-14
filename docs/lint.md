# Linting

Linting, analyzing code for potential errors, is done with eslint.
```shell
npm run lint
```


## setup

Install `eslint` and the set of default rules (`eslint-config-singpath`)
and a plugin to handle html files:
```shell
npm install --save-dev eslint@3 eslint-plugin-html eslint-config-singpath
```

Setup a YAML or JSON encoded eslint config file:
```shell
rm .eslintrc*
echo -e 'extends: singpath/module\nplugins: ["html"]' > .eslintrc.yml
```

To run lint, add a lint command to `package.json` (add it to the map of command
in the `scripts` object):
```json
{
  "scripts": {
    "lint": "eslint src/ index.html",
    "format": "npm run lint -- --fix",
    "test": "bash ./tools/bin/test.sh"
  }
}
```

Then:
```shell
npm run lint
```

To auto fix most formatting issue:
```shell
npm run format
```


## Rules

Using an other set of rules (eslint-config-xo), this project would show
369 errors; e.g.:

    /Users/me/dev/example-app/index.js
    16:33  error  Unexpected function expression                       prefer-arrow-callback
    16:41  error  Missing space before function parentheses            space-before-function-paren
    17:3   error  Expected indentation of 1 tab character but found 0  indent


Notice the last column; it shows an error code which can be looked up on eslint
documentation:

    http://eslint.org/docs/rules/prefer-arrow-callback
    http://eslint.org/docs/rules/space-before-function-paren
    http://eslint.org/docs/rules/indent


You can adjust the default rules settings to your coding style; `.eslintrc.yml`:
```yml
# using "xo/esnext" as an example. You should use "singpath/module"
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

Rules can be set to "off", "warn" (shows warning but doesn't fail) or "error".
Some rules can be configured: indent should be 2 spaces. The rule definition
explains how to configure it.

After those changes it would be down to 87, with many "no-undef" errors, e.g.:

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

`npm run format` will fix trivial errors (like trailing white spaces). The
`lint` command could be used in git hook or a CI test.


## Rule exceptions

You sometime need to turn off a rules for just one instance. E.g. `index.html` is
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


## Precommit hook

To lint changes on commit, you can use a git pre-commit hook. npm "pre-commit"
module can setup it for you.

Install `pre-commit`:
```
npm install pre-commit --save-dev
```

Update `package.json` with:
```json
{
  "pre-commit": [ "lint" ]
}
```


## Sharing configs

`eslint-config-singpath` is currently defined in this repository, in
`packages/eslint-config-singpath`. The rules are defined in `default.yml`.
Specific node or jspm settings are defined in `node.js` and `module.js`.

`default.yml` has each rule commented; it emntion if it's recommended by eslint
and if it's fixable (using `--fix` CLI option).

To publish it:
```
cd packages/eslint-config-singpath
npm version (patch|minor|major)
npm publish
```

(This example app uses the local version, not the published one)


## Reference

- [eslint](http://eslint.org/)
- [eslint-config-xo](https://github.com/sindresorhus/eslint-config-xo)
