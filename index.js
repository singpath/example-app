/**
 * Example-app entry point - boostrap the the angular app.
 */

/* eslint-env browser */

import angular from 'angular';
import exampleApp from 'example-app';

angular.element(document).ready(function() {
  angular.bootstrap(document, [exampleApp.name], {strictDi: true});
});
