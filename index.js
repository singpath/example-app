/**
 * Example-app entry point - boostrap the the angular app.
 */

/* eslint-env browser */

import angular from 'angular';
import exampleApp from 'example-app';

const module = angular.module('exampleApp.bootstrap', [exampleApp.name]);

// Overwrite constant here; e.g.:
//
// module.constant('firebaseApp', firebase.initializeApp([...]));

angular.element(document).ready(function() {
  angular.bootstrap(document, [module.name], {strictDi: true});
});
