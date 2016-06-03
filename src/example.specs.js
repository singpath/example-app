import {expect} from 'chai';

import {Controller} from './example.js'

describe('example Controller', function() {
  describe('update', function() {
    it('should assign the addition of x and y to total', function() {
      const ctrl = new Controller();

      ctrl.x = 1;
      ctrl.y = 2;
      ctrl.update();
      expect(ctrl.total).to.equal(3);
    });
  });
});
