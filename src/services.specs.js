/* eslint max-nested-callbacks: "off"*/

import {expect} from 'chai';
import {testInjectMatch} from 'example-app/tools/inspect.js';

import * as services from './services.js';

describe('services', function() {

  describe('eaLists', function() {
    let listsService;

    beforeEach(function() {
      listsService = new services.Lists();
    });

    testInjectMatch(services.Lists);

    describe('getLists', function() {

      it('should return an array', function() {
        expect(listsService.getLists()).to.eql([]);
      });

    });

    describe('create', function() {

      it('should add a new list', function() {
        const list = listsService.create('Grocery');

        expect(list).to.be.an('array');
        expect(listsService.getLists()).to.eql(['Grocery']);
      });

      it('should not overwrite an existing list', function() {
        listsService.create('Grocery');

        expect(listsService.create('Grocery')).to.be.undefined;
      });

    });

    describe('remove', function() {

      it('should delete a list', function() {
        listsService.create('Grocery');
        listsService.remove('Grocery');
        expect(listsService.getLists()).to.eql([]);
      });

    });

    describe('getListById', function() {

      it('should load a list', function() {
        listsService.create('Grocery');

        expect(listsService.getListById('Grocery')).to.be.an('array');
      });

      it('should create the list if it does not exist', function() {
        const xmas = listsService.getListById('xmas');

        expect(xmas).to.be.an('array');
        expect(listsService.getListById('xmas')).to.equal(xmas);
      });

      describe('shopping list', function() {
        let shopping;

        beforeEach(function() {
          shopping = listsService.getListById('Grocery');
        });

        it('should keep the list sorted', function() {
          shopping.add('bread');
          shopping.add('bacon');
          shopping.add('egg');
          expect(shopping.slice()).to.eql(['bacon', 'bread', 'egg']);
        });

        it('should keep items unique', function() {
          shopping.add('bread');
          shopping.add('bacon');
          shopping.add('egg');
          shopping.add('bacon');
          expect(shopping.slice()).to.eql(['bacon', 'bread', 'egg']);
        });

        it('should remove item', function() {
          shopping.add('bread');
          shopping.add('bacon');
          shopping.add('egg');
          shopping.remove('bacon');
          expect(shopping.slice()).to.eql(['bread', 'egg']);
        });

      });

    });

  });

});

