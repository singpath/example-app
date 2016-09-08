import {expect} from 'example-app/tools/chai.js';

import {component} from './root-app.js';
import template from './root-app.html!text';

describe('rootApp component', function() {

  it('should use /src/components/root-app/root-app.html as template', function() {
    expect(component.template).to.equal(template);
  });

});
