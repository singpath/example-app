/**
 * example-app/components/example-app/example-app.js - defines exampleApp component.
 *
 * Should configure routes and render the view.
 */
import template from './example-app.html!text';
import './example-app.css!';

/**
 * App controller - make sure the user is always signed in.
 */
class AppController {

  constructor($log, eaLists) {
    this.subscription = eaLists.user.get().subscribe(user => {
      if (!user) {
        eaLists.user.signIn().catch(
          e => $log.error(`Failed to log in: ${e.toString()}.`)
        );
      } else if (!user.registeredAt) {
        eaLists.user.register().catch(
          e => $log.error(`Failed to register in: ${e.toString()}.`)
        );
      }
    });
  }

  $onDestroy() {
    this.subscription.unsubscribe();
  }

}

// See https://docs.angularjs.org/guide/di#-inject-property-annotation
AppController.$inject = ['$log', 'eaLists'];

export const component = {
  template, controller: AppController
};
