import {expect} from 'chai';

import {component} from './example-app.js';
import template from './example-app.html!text';

describe('exampleApp component', function() {

  it('should use /src/components/example-app/example-app.html as template', function() {
    expect(component.template).to.equal(template);
  });

});
