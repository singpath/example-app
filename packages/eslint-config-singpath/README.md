# SingPath Linting Configuration

[Eslint](http://eslint.org)
| [Configuring](http://eslint.org/docs/user-guide/configuring)
| [Rules](http://eslint.org/docs/rules/)

Contains the default ESLint configuration for SingPath projects.


## Installation

You can install ESLint using npm:
```js
npm install eslint --save-dev
```

Then install this configuration:
```js
npm install eslint-config-singpath --save-dev
```


## Usage

Add a `.eslintrc.yml` file (for node 4+ project):
```yaml
extends: eslint-config-singpath/node
```

or for a ES6 module based project:
```yaml
extends: eslint-config-singpath/module
```

Then create a "lint" command; e.g., to lint `src/` and `test/` js files, add to
`package.json` (only showing the `script` field):
```json
{
  "scripts": {
    "lint": "eslint src/ tests/"
  }
}
```

To lint the folders:
```
npm run lint
```

To attempt to fix them:
```
npm run lint -- --fix
```
