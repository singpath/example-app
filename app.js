import angular from 'angular';

import {Controller as ExampleController} from 'example-app/example.js';

const module = angular.module('sampleApp', []);

module.controller('ExampleController', ExampleController);

angular.element(document).ready(function() {
  angular.bootstrap(document, [module.name], {strictDi: true});
});
