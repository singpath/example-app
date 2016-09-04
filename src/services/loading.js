/**
 * example-app/service/loading.js - loading helpers.
 */

/**
 * Help controller keeping track of loading resources.
 */
export class Loading {

  /**
   * Loading constructor
   *
   * @param  {ng.Scope} $rootScope Angular $rootScope service.
   * @param  {ng.$log}       $log       Angular $log service.
   */
  constructor($rootScope, $log) {

    /**
     * @private
     * @type {ng.Scope}
     * @private
     */
    this.$rootScope = $rootScope;

    /**
     * @private
     * @type {ng.$log}
     * @private
     */
    this.$log = $log;

    /**
     * Async operation context. Help handling concurrent requests.
     * @type {Map<string, ?{done: boolean}>}
     * @private
     */
    this.$context = new Map();

    /**
     * list errors
     * @type {Map<string, boolean>}
     */
    this.errors = new Map();

    /**
     * Number of resources currently loading.
     * @type {number}
     */
    this.size = 0;

    /**
     * True when there are no pending resources.
     * @type {boolean}
     */
    this.ready = true;

  }

  /**
   * Increment the list of loading resources.
   *
   * Set the context of concurrent loading resource as "done" and
   * set "ready" state to false.
   *
   * Return a context object. Should be used to check if the loading this
   * resource have been cancelled, most likely because the parameters to load
   * the resource have changed.
   *
   * @param {string}  name     Name of resource
   * @param {?object} ctx      Data to add to the context object.
   * @return {{done: boolean}}
   */
  add(name, ctx) {
    this.done(name);

    ctx = Object.assign(ctx || {}, {done: false});
    this.$context.set(name, ctx);
    this.errors.delete(name);

    this.size = this.$context.size;
    this.ready = false;
    this.$rootScope.$applyAsync();

    return ctx;
  }

  /**
   * Remove the resource for the loading resources list.
   *
   * Set the loading resource context as "done" and update the "ready" state.
   *
   * @param {string} name Name of resource
   */
  remove(name) {
    this.done(name);
    this.$context.delete(name);
    this.size = this.$context.size;
    this.ready = this.size === 0;
    this.$rootScope.$applyAsync();
  }

  /**
   * Set the context of current loading resource as "done".
   *
   * @param {string} name Name of resource
   * @private
   */
  done(name) {
    if (!name) {
      throw new Error('the loading resource needs a name.');
    }

    const prev = this.$context.get(name);

    if (prev) {
      prev.done = true;
    }
  }

  /**
   * Log an error for a resource and add it to the list of errors.
   *
   * It also remove the resource from the list.
   *
   * @param {string} name  Name of resource
   * @param {Error}  err   error to log
   */
  error(name, err) {
    if (!err) {
      err = new Error(`Error loading ${name}`);
    }

    this.remove(name);
    this.errors.set(name, true);
    this.$log.error(err);
  }

}

/**
 * Create the loading factory.
 * @param  {ng.Scope} $rootScope Angular $rootScope service.
 * @param  {ng.$log}       $log       Angular logging service.
 * @return {function(): Loading}
 */
export function loadingFactory($rootScope, $log) {
  return function loading() {
    return new Loading($rootScope, $log);
  };
}

loadingFactory.$inject = ['$rootScope', '$log'];

export default loadingFactory;
