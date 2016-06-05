/**
 * Example-app test entry point - import all tests.
 */

import * as chai from 'chai';
import sinonChai from 'sinon-chai';

// Register sinonChai plugin
//
// See https://github.com/domenic/sinon-chai
chai.use(sinonChai);

import 'example-app/tools/inspect.specs.js';

import 'example-app/services.specs.js';

import 'example-app/components/example-app/example-app.specs.js';
import 'example-app/components/shopping/shopping.specs.js';
import 'example-app/components/shopping-lists/shopping-lists.specs.js';
