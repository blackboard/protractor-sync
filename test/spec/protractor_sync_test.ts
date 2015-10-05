/// <reference path='../../node_modules/node-shared-typescript-defs/jasmine/jasmine.d.ts'/>
import ab = require('asyncblock');
import _protractorSync = require('../../app/protractor_sync');
'use strict';

var protractorSync = _protractorSync.protractor_sync;

protractorSync.patch();
protractorSync.disallowMethods();

var TEST_AREA_ID = 'protractor_sync-test-area';

interface IAppendTestAreaOptions {
  style?: { [name: string]: string; };
  innerHtml?: string;
}

function appendTestArea(options?: IAppendTestAreaOptions) {
  browser.executeScript((id: string, options?: IAppendTestAreaOptions) => {
    var existing = document.querySelector('#' + id);
    if (existing) {
      existing.parentNode.removeChild(existing);
    }

    var testArea = document.createElement('div');
    testArea.setAttribute('id', id);

    if (options && options.innerHtml) {
      testArea.innerHTML = options.innerHtml;
    }

    if (options && options.style) {
      Object.keys(options.style).forEach((item) => {
        (<any>testArea.style)[item] = options.style[item];
      });
    }

    document.body.appendChild(testArea);
  }, TEST_AREA_ID, options);
}

function createTest(fn: Function, errorMsg?: string) {
  return function(done: Function) {
    ab(() => {
      fn();
    }, function(err: any) {
      if (errorMsg) {
        expect(err.message).toEqual(errorMsg);
      } else {
        expect(err || undefined).toBeUndefined();
      }
      done();
    });
  };
}

describe('Protractor extensions', () => {

  describe('disallowed methods', () => {
    // browser/element selectors

    it('should prevent calling browser.$', () => {
        expect(() => {
          browser.$('body');
        }).toThrowError(
          '$() has been disabled in this project! Use element.findVisible() or element.findElement() instead.'
        );
    });

    it('should prevent calling browser.$$', () => {
        expect(() => {
          browser.$$('body');
        }).toThrowError(
          '$$() has been disabled in this project! Use element.findVisibles() or element.findElements() instead.'
        );
    });

    it('should prevent calling browser.element', () => {
        expect(() => {
          browser.element(by.model(''));
        }).toThrowError(
          'element() has been disabled in this project! Use element.findVisible() or element.findElement() instead.'
        );
    });

    it('should prevent calling browser.sleep', () => {
      expect(() => { browser.sleep(1); }).toThrowError(
        'sleep() has been disabled in this project! Use browser.waitFor(), element.waitUntil(), element.waitUntilRemove() etc. ' +
        'instead of browser.sleep().'
      );
    });

    it('should prevent calling browser.wait', () => {
      expect(() => { browser.wait(() => { return; }, 1); }).toThrowError(
        'wait() has been disabled in this project! Use browser.waitFor() instead.'
      );
    });

    it('should prevent calling browser.findElement', () => {
      expect(() => { browser.findElement('body'); }).toThrowError(
        'findElement() has been disabled in this project! Use element.findVisible() or element.findElement() instead.'
      );
    });

    it('should prevent calling browser.findElements', () => {
      expect(() => { browser.findElements('body'); }).toThrowError(
        'findElements() has been disabled in this project! Use element.findVisibles() or element.findElements() instead.'
      );
    });

    it('should prevent calling element.all', () => {
        expect(() => {
          element.all(by.model(''));
        }).toThrowError(
          'all() has been disabled in this project! Use element.findVisibles() or element.findElements() instead.'
        );
    });

    // elPrototype selectors.  These tests need an asyncblock so element.findVisible can call getCurrentFlow.

    it('should prevent calling element.$', (done) => {
      ab(() => {
        var body = element.findVisible('body');

        expect(() => {
          body.$('a');
        }).toThrowError(
          '$() has been disabled in this project! Use instance.findVisible() or instance.findElement() instead'
        );
      }, done);
    });

    it('should prevent calling element.$$', (done) => {
      ab(() => {
        var body = element.findVisible('body');

        expect(() => {
          body.$$('a');
        }).toThrowError(
          '$$() has been disabled in this project! Use instance.findVisibles() or instance.findElements() instead.'
        );
      }, done);
    });

    it('should prevent calling element.element', (done) => {
      ab(() => {
        var body = element.findVisible('body');
        expect(() => {
          body.element(by.model(''));
        }).toThrowError(
          'element() has been disabled in this project! Use instance.findVisible() or instance.findElement() instead'
        );
      }, done);
    });

    it('should prevent calling element.all', (done) => {
      ab(() => {
        var body = element.findVisible('body');
        expect(() => {
          body.all(by.model(''));
        }).toThrowError(
          'all() has been disabled in this project! Use instance.findVisibles() or instance.findElements() instead.'
        );
      }, done);
    });

    // wait/findElements/sleep

    it('should prevent calling browser.driver.wait', () => {
      expect(() => {
        browser.driver.wait(() => {
          return;
        }, 1);
      }).toThrowError(
        'wait() has been disabled in this project! Use browser.waitFor() instead.'
      );
    });

    it('should prevent calling browser.driver.findElement', () => {
        expect(() => {
          browser.driver.findElement('body');
        }).toThrowError(
          'findElement() has been disabled in this project! Use element.findVisible() or element.findElement() instead.'
        );
    });

    it('should prevent calling browser.driver.findElements', () => {
        expect(() => {
          browser.driver.findElements('body');
        }).toThrowError(
          'findElements() has been disabled in this project! Use element.findVisibles() or element.findElements() instead.'
        );
    });

    it('should prevent calling browser.driver.sleep', () => {
        expect(() => {
          browser.driver.sleep(1);
        }).toThrowError(
          'sleep() has been disabled in this project! Use browser.waitFor(), element.waitUntil(), element.waitUntilRemove() etc. ' +
          'instead of browser.sleep().'
        );
    });

    // locators

    it('should prevent calling by.binding', () => {
        expect(() => {
          by.binding('');
        }).toThrowError(
          'binding() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.buttonText', () => {
        expect(() => {
          by.buttonText('');
        }).toThrowError(
          'buttonText() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.className', () => {
        expect(() => {
          by.className('');
        }).toThrowError(
          'className() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.css', () => {
        expect(() => {
          by.css('');
        }).toThrowError(
          'css() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.id', () => {
        expect(() => {
          by.id('');
        }).toThrowError(
          'id() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.js', () => {
        expect(() => {
          by.js('');
        }).toThrowError(
          'js() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.name', () => {
        expect(() => {
          by.name('');
        }).toThrowError(
          'name() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.partialButtonText', () => {
        expect(() => {
          by.partialButtonText('');
        }).toThrowError(
          'partialButtonText() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.repeater', () => {
        expect(() => {
          by.repeater('');
        }).toThrowError(
          'repeater() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.tagName', () => {
        expect(() => {
          by.tagName('');
        }).toThrowError(
          'tagName() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    it('should prevent calling by.xpath', () => {
        expect(() => {
          by.xpath('');
        }).toThrowError(
          'xpath() has been disabled in this project! Use a css selector or by.model instead.'
        );
    });

    // locators that need a cast

    it('should prevent calling by.cssContainingText', () => {
      // These locator tests don't compile (Property 'cssContainingText' does not exist on type 'IProtractorLocatorStrategy'.)
      expect(() => {
        (<any>by).cssContainingText('');
      }).toThrowError(
        'cssContainingText() has been disabled in this project! Use a css selector or by.model instead.'
      );
    });

    it('should prevent calling by.deepCss', () => {
      expect(() => {
        (<any>by).deepCss('');
      }).toThrowError(
        'deepCss() has been disabled in this project! Use a css selector or by.model instead.'
      );
    });

    it('should prevent calling by.exactBinding', () => {
      expect(() => {
        (<any>by).exactBinding('');
      }).toThrowError(
        'exactBinding() has been disabled in this project! Use a css selector or by.model instead.'
      );
    });

    it('should prevent calling by.exactRepeater', () => {
      expect(() => {
        (<any>by).exactRepeater('');
      }).toThrowError(
        'exactRepeater() has been disabled in this project! Use a css selector or by.model instead.'
      );
    });

    it('should prevent calling by.options', () => {
      expect(() => {
        (<any>by).options('');
      }).toThrowError(
        'options() has been disabled in this project! Use a css selector or by.model instead.'
      );
    });

  });

  describe('jQuery methods', () => {
    var testArea: protractor.ElementFinder;
    var testSpan: protractor.ElementFinder;

    beforeAll(createTest(() => {
      //Make sure we are starting on a fresh page
      browser.get('data:,');

      protractorSync.injectjQuery();

      appendTestArea({
          style: {
            position: 'absolute',
            left: '15px',
            top: '15px',
            boxSizing: 'context-box'
          },
          innerHtml: '<span ' +
          '  style="height:50px; width:30px; display:block; position: absolute; left:10px; top:10px; border:black solid 2px;" ' +
          '  class="test-span">test span 1</span>' +
          '<span class="test-span-2">test span 2</span>'
        }
      );

      testArea = element.findVisible('#' + TEST_AREA_ID);
      testSpan = element.findVisible('.test-span');
    }));

    it('Finds the closest element matching the selector', createTest(() => {
       expect(testSpan.closest('div').getAttribute('id')).toEqual(TEST_AREA_ID);
    }));

    it('Can determine a class exists on an element', createTest(() => {
      expect(testSpan.hasClass('test-span')).toEqual(true);
    }));

    it('Can determine a class does not exist on an element', createTest(() => {
      expect(testSpan.hasClass('no')).toEqual(false);
    }));

    it('Can get the innerHeight of an element', createTest(() => {
      expect(testSpan.innerHeight()).toEqual(50);
    }));

    it('Can get the innerWidth of an element', createTest(() => {
      expect(testSpan.innerWidth()).toEqual(30);
    }));

    it('Can use "is" to determine the element is a span', createTest(() => {
      expect(testSpan.is('span')).toEqual(true);
    }));

    it('Can get the outerHeight of an element', createTest(() => {
      expect(testSpan.outerHeight()).toEqual(54);
    }));

    it('Can get the outerWidth of an element', createTest(() => {
      expect(testSpan.outerWidth()).toEqual(34);
    }));

    it('Can get the next element', createTest(() => {
      expect(testSpan.next().hasClass('test-span-2')).toEqual(true);
    }));

    it('Can get an element\'s offset', createTest(() => {
      expect(testSpan.offset()).toEqual({ top: 25, left: 25});
    }));

    it('Can get an element\'s parent', createTest(() => {
      expect(testSpan.parent().getAttribute('id')).toEqual(TEST_AREA_ID);
    }));

    it('Can get an element\'s parents', createTest(() => {
      expect(testSpan.parents().map(parent => parent.getTagName())).toEqual(['div', 'body', 'html']);
    }));

    it('Can get an element\'s position', createTest(() => {
      expect(testSpan.position()).toEqual({ top: 10, left: 10});
    }));

    it('Can get the previous element', createTest(() => {
      expect(testArea.findVisible('.test-span-2').prev().hasClass('test-span')).toEqual(true);
    }));

    it('Can get an element property', createTest(() => {
      expect(testSpan.prop('nodeType')).toEqual(1);
    }));

    it('Can get an element\'s scrollLeft', createTest(() => {
      expect(testSpan.scrollLeft()).toEqual(0);
    }));

    it('Can get an element\'s scrollTop', createTest(() => {
      expect(testSpan.scrollTop()).toEqual(0);
    }));
  });

  describe('Other element finder extensions', () => {
    it('can scroll to an element', createTest(() => {
      //Make sure we are starting on a fresh page
      browser.get('data:,');

      protractorSync.injectjQuery();

      appendTestArea({
        style: { height: '100px', overflow: 'scroll' },
        innerHtml: '<div class="target" style="margin-top: 500px; margin-bottom: 500px;">World</div>'
      });

      var el = element.findElement('#' + TEST_AREA_ID + ' .target');
      expect(el.parent().scrollTop()).toEqual(0);
      el.scrollIntoView();
      expect(el.parent().scrollTop()).toEqual(500);
    }));
  });

  describe('assertElementDoesNotExist', () => {
    var testArea: protractor.ElementFinder;

    beforeAll(createTest(() => {
      //Make sure we are starting on a fresh page
      browser.get('data:,');

      appendTestArea({
        innerHtml: '<span class="element-does-exist"></span>'
      });

      testArea = element.findElement('#' + TEST_AREA_ID);
    }));

    it('throws an error if the element exists', createTest(() => {
      testArea.assertElementDoesNotExist('.element-does-exist');
    }, '.element-does-exist was found when it should not exist!'));

    it('does not throw an error if the element does not exist', createTest(() => {
      testArea.assertElementDoesNotExist('.does-not-exist');
    }));
  });

  describe('stale element prevention', () => {
    function appendStaleTestArea(extraClass = '') {
      appendTestArea({
        innerHtml: '<div class="stale-test ' + extraClass + '">' +
                   '  <div class="inner-stale ' + extraClass + '">' +
                   '    <div class="inner-stale-2 ' + extraClass +  '">test</div>' +
                   '  </div>' +
                   '</div>' +
                   '<div class="stale-test-2 ' + extraClass + '">test</div>'
      });
    }

    beforeAll(createTest(() => {
      browser.get('data:,');

      protractorSync.injectjQuery();
    }));

    beforeEach(() => {
      appendStaleTestArea();
    });

    it('re-selects a stale element', createTest(() => {
      var el = element.findElement('.stale-test');

      browser.executeScript(() => {
        (<any>window).jQuery('.stale-test').remove();
      });

      appendStaleTestArea('second');

      expect(el.hasClass('second')).toEqual(true);
    }));

    it('re-selects a stale element using findElements', createTest(() => {
      var el = element.findElements('.stale-test');

      browser.executeScript(() => {
        (<any>window).jQuery('.stale-test').remove();
      });

      appendStaleTestArea('second');

      expect(el[0].hasClass('second')).toEqual(true);
    }));

    it('re-selects a stale element with a stale parent', createTest(() => {
      var parent = element.findElement('.stale-test');
      var el = parent.findElement('.inner-stale');

      browser.executeScript(() => {
        (<any>window).jQuery('.stale-test').remove();
      });

      appendStaleTestArea('second');

      expect(el.getText()).toEqual('test');
    }));

    it('re-selects a stale element with two stale parents', createTest(() => {
      var parent = element.findElement('.stale-test');
      var inner = parent.findElement('.inner-stale');
      var el = inner.findElement('.inner-stale-2');

      browser.executeScript(() => {
        (<any>window).jQuery('.stale-test').remove();
      });

      appendStaleTestArea('second');

      expect(el.getText()).toEqual('test');
    }));

    it('re-selects a stale element selected using next', createTest(() => {
      var el = element.findElement('.stale-test').next();

      browser.executeScript(() => {
        (<any>window).jQuery('.stale-test-2').remove();
      });

      appendStaleTestArea('second');

      expect(el.hasClass('second')).toEqual(true);
    }));

    it('re-selects a stale element selected using closest', createTest(() => {
      var el = element.findVisible('.inner-stale').closest('.stale-test');

      browser.executeScript(() => {
        (<any>window).jQuery('.stale-test').remove();
      });

      appendStaleTestArea('second');

      expect(el.hasClass('second')).toEqual(true);
    }));

    it('re-selects a stale element selected using parents', createTest(() => {
      var el = element.findVisible('.inner-stale-2').parents()[1];

      browser.executeScript(() => {
        (<any>window).jQuery('.stale-test').remove();
      });

      appendStaleTestArea('second');

      expect(el.hasClass('second')).toEqual(true);
    }));

    it('waits to re-select a stale element', createTest(() => {
      var el = element.findElement('.stale-test');

      browser.executeScript(() => {
        (<any>window).jQuery('.stale-test').remove();

        setTimeout(() => {
          (<any>window).jQuery('#protractor_sync-test-area').append('<div class="stale-test second">test</div>');
        }, 500);
      });

      expect(el.hasClass('second')).toEqual(true);
    }));
  });

  describe('expect', () => {
    it('retries until the expectation passes', createTest(() => {
      var counter = 1;
      var expectation = protractorSync.polledExpect(() => 'test' + counter++);

      spyOn(expectation, 'toEqual').and.callThrough();
      expectation.toEqual('test5');

      expect(expectation.toEqual.calls.count()).toEqual(5);
    }));

    it('is also available as a global variable', createTest(() => {
      var counter = 0;

      polledExpect(() => 'test' + counter++).toEqual('test5');
    }));

    it('works with not', createTest(() => {
      var counter = 0;
      var expectation = protractorSync.polledExpect(() => 'test' + counter++).not;

      spyOn(expectation, 'toEqual').and.callThrough();
      expectation.toEqual('test0');

      expect(expectation.toEqual.calls.count()).toEqual(2);
    }));

    it('works with the toBeGreaterThan matcher', createTest(() => {
      var counter = 1;
      var expectation = protractorSync.polledExpect(() => counter++);

      spyOn(expectation, 'toBeGreaterThan').and.callThrough();
      expectation.toBeGreaterThan(3);

      expect(expectation.toBeGreaterThan.calls.count()).toEqual(4);
    }));

    it('works with multiple expectations', createTest(() => {
      var counter = 1;

      var expectation = protractorSync.polledExpect(() => counter++);
      spyOn(expectation, 'toBeGreaterThan').and.callThrough();
      expectation.toBeGreaterThan(3);
      expect(expectation.toBeGreaterThan.calls.count()).toEqual(4);

      expectation = protractorSync.polledExpect(() => counter++);
      spyOn(expectation, 'toBeGreaterThan').and.callThrough();
      expectation.toBeGreaterThan(7);
      expect(expectation.toBeGreaterThan.calls.count()).toEqual(4);

      expectation = protractorSync.polledExpect(() => counter++);
      spyOn(expectation, 'toBeGreaterThan').and.callThrough();
      expectation.toBeGreaterThan(10);
      expect(expectation.toBeGreaterThan.calls.count()).toEqual(3);
    }));

    it('times out', createTest(() => {
      var counter = 0;
      var catchRan = false;

      //Can't use expect().toThrow() to check this because it doesn't run from the Fiber when patched by jasminewd
      try {
        protractorSync.polledExpect(() => counter++, { timeoutMS: 100 }).toBeLessThan(0);
      } catch (e) {
        catchRan = true;
        expect(e.message).toMatch(/Expected \d+ to be less than 0\./);
      }

      expect(catchRan).toEqual(true);
    }));

    it('works in conjunction with element finders', createTest(() => {
      browser.get('data:,');
      protractorSync.injectjQuery();
      appendTestArea();

      var testArea = element.findElement('#' + TEST_AREA_ID);
      var addClass = jasmine.createSpy('addClass').and.callFake(() => {
        browser.executeScript(() => {
          (<any>window).jQuery('#protractor_sync-test-area').addClass('expect-test');
        });
      });

      var classCheck = jasmine.createSpy('classCheck').and.callFake(() => {
        var hasClass = testArea.hasClass('expect-test');
        if (!hasClass) {
          addClass();
        }

        return hasClass;
      });

      protractorSync.polledExpect(classCheck).toEqual(true);

      expect(classCheck.calls.count()).toEqual(2);
      expect(addClass.calls.count()).toEqual(1);
    }));
  });
});