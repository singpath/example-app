/**
 * example-app/service.js - Business domain for this app.
 */
import loadingFactory from 'example-app/services/loading.js';
import Auth from 'example-app/services/auth.js';
import datastore from 'example-app/services/datastore.js';

/**
 * exampleApp services.
 * @type {{loadingFactory: loadingFactory, Auth: Auth, datastore: datastore}}
 */
const services = {loadingFactory, Auth, datastore};

export default services;
