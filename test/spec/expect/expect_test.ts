/// <reference path='../../../node_modules/node-shared-typescript-defs/jasmine/jasmine.d.ts'/>
import ab = require('asyncblock');
import assert = require('assert');
import _protractorSync = require('../../../app/protractor_sync');

var protractorSync = _protractorSync.protractor_sync;

describe('disallowed methods, including expect', () => {
  var _expect = global.expect;
  beforeAll(() => {
    protractorSync.disallowMethods({ expect: true });
  });

  afterAll(() => {
    global.expect = _expect; //restore the original method for use it on other tests
  });

  it('should prevent calling expect', () => {
    var catchRan = false;

    try {
      expect('test');
    } catch (e) {
      catchRan = true;
      assert.equal(e.message, 'expect() has been disabled in this project! Use polledExpect instead of expect.');
    }

    assert(catchRan);
  });
});
