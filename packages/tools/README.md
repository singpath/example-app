# Singpath's tools

Singpath package script helpers.

## Install

```shell
npm install --save-dev @singpath/tools
```


## Usage

### `exec`

```js
const tools = require('@singpath/tools');

// Execute shell command synchronously.
tools.exec('ls -la dist', {
  // by default it will print the command to the stdout
  printCmd: true,

  // by default, the command will inherit the node script stdout;
  // set this property to false to ignore the command stdout
  ignoreStdout: false,

  // same for the command stderr
  ignoreStderr: false
});
```

For more complex usage like piping, try [shelljs's](http://documentup.com/shelljs/shelljs)
`exec`.
