import {expect} from 'chai';
import {Controller} from './example.js'

describe('example Controller', function() {
  describe('updateZ', function() {
    it('should assign to z the addition of x and y', function() {
      const ctrl = new Controller();

      ctrl.x = 1;
      ctrl.y = 2;
      ctrl.update();
      expect(ctrl.total).to.equal(3);
    })
  });
});
