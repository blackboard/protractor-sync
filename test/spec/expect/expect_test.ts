import * as assert from 'assert';
import * as protractorSync from '../../../app/index';

describe('disallowed methods, including expect', () => {
  var _expect = (<any>global).expect;
  beforeAll(() => {
    protractorSync.disallowExpect();
  });

  afterAll(() => {
    (<any>global).expect = _expect; //restore the original method for use it on other tests
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
