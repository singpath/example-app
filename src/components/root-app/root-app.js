/**
 * example-app/components/root-app/root-app.js - defines rootApp component.
 */
import template from './root-app.html!text';
import './root-app.css!';

/**
 * exampleApp root component definition.
 * @type {Object}
 * @private
 */
export const component = {template};

/**
 * Defines the rootApp component renderng the app root directive.
 *
 * Hold the rootApp component definintion and would hold any other related
 * service, directive or filter needing to be register with angular injector.
 *
 * @type {{component: object}}
 */
const rootApp = {component};

export default rootApp;
