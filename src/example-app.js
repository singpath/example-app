/**
 * example-app - Shopping list example of an Angular application.
 */
import angular from 'angular';
import 'angular-route';

import * as config from './config.js';

import * as services from './services.js';

import {component as exampleApp} from './components/example-app/example-app.js';
import {component as eaShopping} from './components/shopping/shopping.js';
import {component as eaShoppingLists} from './components/shopping-lists/shopping-lists.js';

const module = angular.module('exampleApp', ['ngRoute']);

module.service('eaLists', services.Lists);

module.component('exampleApp', exampleApp);
module.component('eaShopping', eaShopping);
module.component('eaShoppingLists', eaShoppingLists);

module.config(config.route);

export default module;
