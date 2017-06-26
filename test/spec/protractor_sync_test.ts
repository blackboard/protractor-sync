import * as ab from 'asyncblock';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';

import { by } from 'protractor';
import * as protractorSync from '../../app/index';
import { browserSync, ElementFinderSync, elementSync, polledExpect } from '../../app/index';

protractorSync.configure({ implicitWaitMs: 500 });

const TEST_AREA_ID = 'protractor_sync-test-area';
const PNG_HEADER_BASE_64 = 'iVBORw0KGgo';

interface IAppendTestAreaOptions {
  style?: { [name: string]: string; };
  innerHtml?: string;
}

function appendTestArea(options?: IAppendTestAreaOptions) {
  browserSync.executeScript((id: string, _options?: IAppendTestAreaOptions) => {
    const existing = document.querySelector('#' + id);
    if (existing) {
      existing.parentNode.removeChild(existing);
    }

    const testArea = document.createElement('div');
    testArea.setAttribute('id', id);

    if (_options && _options.innerHtml) {
      testArea.innerHTML = _options.innerHtml;
    }

    if (_options && _options.style) {
      Object.keys(_options.style).forEach((item) => {
        (<any>testArea.style)[item] = _options.style[item];
      });
    }

    document.body.appendChild(testArea);
  }, TEST_AREA_ID, options);
}

function createTest(fn: Function, errorMsg?: string) {
  return (done: Function) => {
    ab(() => {
      fn();
    }, (err: any) => {
      if (errorMsg) {
        expect(err.message).toEqual(errorMsg);
      } else {
        expect(err && err.stack || err || undefined).toBeUndefined();
      }
      done();
    });
  };
}

describe('Protractor extensions', () => {
  describe('jQuery methods', () => {
    let testArea: ElementFinderSync;
    let testSpan: ElementFinderSync;
    let testInput: ElementFinderSync;
    let testMultilineInput: ElementFinderSync;

    beforeAll(createTest(() => {
      //Make sure we are starting on a fresh page
      browserSync.get('data:,');

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
          '<span class="test-span-2">test span 2</span>' +
          '<input type="text"/>' +
          '<textarea></textarea>'
        }
      );

      testArea = elementSync.findVisible('#' + TEST_AREA_ID);
      testSpan = elementSync.findVisible('.test-span');
      testInput = elementSync.findVisible('input');
      testMultilineInput = elementSync.findVisible('textarea');
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

    it('Can determine an element is focused', createTest(() => {
      testInput.click();
      expect(testInput.isFocused()).toEqual(true);
    }));

    it('Can determine an element is not focused', createTest(() => {
      testSpan.click();
      expect(testInput.isFocused()).toEqual(false);
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

    it('Can send the ENTER key to an element', createTest(() => {
      testMultilineInput.sendKeys('Hello')
        .sendEnterKey();
      expect(testMultilineInput.getAttribute('value')).toBe('Hello\n');
    }));

    it('Can send the TAB key to an element', createTest(() => {
      testInput.clear(); // focus the input
      testInput.sendTabKey(); // tabbing twice should move focus forward
      expect(testMultilineInput.isFocused()).toEqual(true);
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
      browserSync.get('data:,');

      appendTestArea({
        style: { height: '100px', overflow: 'scroll' },
        innerHtml: '<div class="target" style="margin-top: 500px; margin-bottom: 500px;">World</div>'
      });

      const el = elementSync.findElement('#' + TEST_AREA_ID + ' .target');
      expect(el.parent().scrollTop()).toEqual(0);
      el.scrollIntoView();
      expect(el.parent().scrollTop()).toEqual(500);
    }));

    it('innerHTML', createTest(() => {
      //Make sure we are starting on a fresh page
      browserSync.get('data:,');

      appendTestArea({
        innerHtml: '<div class="div-with-text">Some <b>HTML</b> In The Div</div>'
      });

      expect(elementSync.findVisible('.div-with-text').getInnerHtml()).toBe('Some <b>HTML</b> In The Div');

    }));

    it('outerHTML', createTest(() => {
      //Make sure we are starting on a fresh page
      browserSync.get('data:,');

      appendTestArea({
        innerHtml: '<div class="div-with-text">Some Text In The Div</div>'
      });

      expect(elementSync.findVisible('.div-with-text').getOuterHtml()).toBe('<div class="div-with-text">Some Text In The Div</div>');
    }));
  });

  describe('Element finder methods', () => {
    let testArea: ElementFinderSync;

    beforeAll(createTest(() => {
      //Make sure we are starting on a fresh page
      browserSync.get('data:,');

      // add some text in the spans so they will be visible by default
      appendTestArea({
        innerHtml: '<span class="visible-element">Span 1</span>' +
                   '<span class="duplicate-selector">Span 2</span>' +
                   '<span class="duplicate-selector">Span 3</span>' +
                   '<span class="duplicate-selector not-visible" style="display:none">Span 4</span>' +
                   '<span class="invisible not-visible" style="display:none">Span 5</span>' +
                   '<a>Link Text</a>'
      });

      testArea = elementSync.findElement('#' + TEST_AREA_ID);
    }));

    describe('findElement', () => {
      it('finds a visible element', createTest(() => {
        testArea.findElement('.visible-element');
      }));

      it('finds an invisible element', createTest(() => {
        testArea.findElement('.invisible');
      }));

      it('throws an error if element was not found', createTest(() => {
        testArea.findElement('.does-not-exist');
      }, 'No instances of (.does-not-exist) were found'));

      it('throws an error if more than one element was found', createTest(() => {
        testArea.findElement('.duplicate-selector');
      }, 'More than one instance of (.duplicate-selector) was found!'));

      it('accepts a Locator', createTest(() => {
        testArea.findElement(by.linkText('Link Text'));
      }));
    });

    describe('findVisible', () => {
      it('finds a visible element', createTest(() => {
        testArea.findVisible('.visible-element');
      }));

      it('throws an error if more than one element was found', createTest(() => {
        testArea.findVisible('.duplicate-selector');
      }, 'More than one visible instance of (.duplicate-selector) was found!'));

      it('throws an error if the element found was not visible', createTest(() => {
        testArea.findVisible('.invisible');
      }, 'No visible instances of (.invisible) were found'));

      it('accepts a Locator', createTest(() => {
        testArea.findVisible(by.linkText('Link Text'));
      }));
    });

    describe('findElements', () => {
      it('finds an element', createTest(() => {
        testArea.findElement('.visible-element');
      }));

      it('finds an invisible element', createTest(() => {
        testArea.findElement('.invisible');
      }));

      it('finds more than one element, even if some are invisible', createTest(() => {
        expect(testArea.findElements('.duplicate-selector').length).toBe(3);
      }));

      it('throws an error if no elements were found', createTest(() => {
        testArea.findElements('.not-found');
      }, 'No instances of (.not-found) were found'));

      it('accepts a Locator', createTest(() => {
        testArea.findElements(by.linkText('Link Text'));
      }));
    });

    describe('findVisibles', () => {
      it('finds a visible element', createTest(() => {
        testArea.findVisibles('.visible-element');
      }));

      it('finds more than one visible element', createTest(() => {
        expect(testArea.findVisibles('.duplicate-selector').length).toBe(2);
      }));

      it('throws an error if no visible elements were found', createTest(() => {
        testArea.findVisibles('.invisible');
      }, 'No visible instances of (.invisible) were found'));

      it('accepts a Locator', createTest(() => {
        testArea.findVisibles(by.linkText('Link Text'));
      }));
    });

  });

  describe('assertElementDoesNotExist', () => {
    let testArea: ElementFinderSync;

    beforeAll(createTest(() => {
      //Make sure we are starting on a fresh page
      browserSync.get('data:,');

      appendTestArea({
        innerHtml: '<span class="element-does-exist"></span>'
      });

      testArea = elementSync.findElement('#' + TEST_AREA_ID);
    }));

    it('throws an error if the element exists', createTest(() => {
      testArea.assertElementDoesNotExist('.element-does-exist');
    }, '.element-does-exist was found when it should not exist!'));

    it('does not throw an error if the element does not exist', createTest(() => {
      testArea.assertElementDoesNotExist('.does-not-exist');
    }));

    it('accepts a Locator', createTest(() => {
      testArea.assertElementDoesNotExist(by.buttonText('button does not exist'));
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
      browserSync.get('data:,');
    }));

    beforeEach(createTest(() => {
      appendStaleTestArea();
    }));

    it('re-selects a stale element', createTest(() => {
      const el = elementSync.findElement('.stale-test');

      browserSync.executeScript(() => {
        const stale = document.querySelector('.stale-test');
        stale.parentNode.removeChild(stale);
      });

      appendStaleTestArea('second');

      expect(el.hasClass('second')).toEqual(true);
    }));

    it('re-selects a stale element using findElements', createTest(() => {
      const el = elementSync.findElements('.stale-test');

      browserSync.executeScript(() => {
        const stale = document.querySelector('.stale-test');
        stale.parentNode.removeChild(stale);
      });

      appendStaleTestArea('second');

      expect(el[0].hasClass('second')).toEqual(true);
    }));

    it('re-selects a stale element with a stale parent', createTest(() => {
      const parent = elementSync.findElement('.stale-test');
      const el = parent.findElement('.inner-stale');

      browserSync.executeScript(() => {
        const stale = document.querySelector('.stale-test');
        stale.parentNode.removeChild(stale);
      });

      appendStaleTestArea('second');

      expect(el.getText()).toEqual('test');
    }));

    it('re-selects a stale element with two stale parents', createTest(() => {
      const parent = elementSync.findElement('.stale-test');
      const inner = parent.findElement('.inner-stale');
      const el = inner.findElement('.inner-stale-2');

      browserSync.executeScript(() => {
        const stale = document.querySelector('.stale-test');
        stale.parentNode.removeChild(stale);
      });

      appendStaleTestArea('second');

      expect(el.getText()).toEqual('test');
    }));

    it('re-selects a stale element selected using next', createTest(() => {
      const el = elementSync.findElement('.stale-test').next();

      browserSync.executeScript(() => {
        const stale = document.querySelector('.stale-test-2');
        stale.parentNode.removeChild(stale);
      });

      appendStaleTestArea('second');

      expect(el.hasClass('second')).toEqual(true);
    }));

    it('re-selects a stale element selected using closest', createTest(() => {
      const el = elementSync.findVisible('.inner-stale').closest('.stale-test');

      browserSync.executeScript(() => {
        const stale = document.querySelector('.stale-test');
        stale.parentNode.removeChild(stale);
      });

      appendStaleTestArea('second');

      expect(el.hasClass('second')).toEqual(true);
    }));

    it('re-selects a stale element selected using parents', createTest(() => {
      const el = elementSync.findVisible('.inner-stale-2').parents()[1];

      browserSync.executeScript(() => {
        const stale = document.querySelector('.stale-test');
        stale.parentNode.removeChild(stale);
      });

      appendStaleTestArea('second');

      expect(el.hasClass('second')).toEqual(true);
    }));

    it('waits to re-select a stale element', createTest(() => {
      const el = elementSync.findElement('.stale-test');

      browserSync.executeScript(() => {
        const stale = document.querySelector('.stale-test');
        stale.parentNode.removeChild(stale);

        setTimeout(() => {
          const div = document.createElement('div');
          div.setAttribute('class', 'stale-test second');
          div.innerHTML = 'test';
          document.querySelector('#protractor_sync-test-area').appendChild(div);
        }, 200);
      });

      expect(el.hasClass('second')).toEqual(true);
    }));
  });

  describe('expect', () => {
    it('retries until the expectation passes', createTest(() => {
      let counter = 1;
      const spy = jasmine.createSpy('counter', () => true).and.callFake(() => 'test' + counter++);
      const expectation = protractorSync.polledExpect(spy);

      expectation.toEqual('test5');

      expect(spy.calls.count()).toEqual(5);
    }));

    it('is also available as a global variable', createTest(() => {
      let counter = 0;

      polledExpect(() => 'test' + counter++).toEqual('test5');
    }));

    it('works with not', createTest(() => {
      let counter = 0;
      const spy = jasmine.createSpy('counter', () => true).and.callFake(() => 'test' + counter++);
      const expectation = protractorSync.polledExpect(spy).not;

      expectation.toEqual('test0');

      expect(spy.calls.count()).toEqual(2);
    }));

    it('works with the toBeGreaterThan matcher', createTest(() => {
      let counter = 1;
      const spy = jasmine.createSpy('counter', () => true).and.callFake(() => counter++);
      const expectation = protractorSync.polledExpect(spy);

      expectation.toBeGreaterThan(3);

      expect(spy.calls.count()).toEqual(4);
    }));

    it('works with multiple expectations', createTest(() => {
      let counter = 1;
      const spy = jasmine.createSpy('counter', () => true).and.callFake(() => counter++);

      let expectation = protractorSync.polledExpect(spy);
      expectation.toBeGreaterThan(3);
      expect(spy.calls.count()).toEqual(4);
      spy.calls.reset();

      expectation = protractorSync.polledExpect(spy);
      expectation.toBeGreaterThan(7);
      expect(spy.calls.count()).toEqual(4);
      spy.calls.reset();

      expectation = protractorSync.polledExpect(spy);
      expectation.toBeGreaterThan(10);
      expect(spy.calls.count()).toEqual(3);
    }));

    it('times out', createTest(() => {
      let counter = 0;

      expect(() =>
        protractorSync.polledExpect(() => counter++, 100).toBeLessThan(0)
      ).toThrowError(/Expected \d+ to be less than 0\./);
    }));

    it('works in conjunction with element finders', createTest(() => {
      browserSync.get('data:,');
      appendTestArea();

      const testArea = elementSync.findElement('#' + TEST_AREA_ID);
      const addClass = jasmine.createSpy('addClass').and.callFake(() => {
        browserSync.executeScript(() => {
          document.querySelector('#protractor_sync-test-area').classList.add('expect-test');
        });
      });

      const classCheck = jasmine.createSpy('classCheck').and.callFake(() => {
        const hasClass = testArea.hasClass('expect-test');
        if (!hasClass) {
          addClass();
        }

        return hasClass;
      });

      protractorSync.polledExpect(classCheck).toEqual(true);

      expect(classCheck.calls.count()).toEqual(2);
      expect(addClass.calls.count()).toEqual(1);
    }));

    it('errors if no matcher is called', createTest(() => {
      try {
        jasmine.clock().install();

        spyOn(console, 'error');
        spyOn(process, 'exit');

        polledExpect(() => 'something');
        jasmine.clock().tick(1);

        expect((<any>console.error).calls.count()).toEqual(1);
        expect((<any>console.error).calls.argsFor(0)[0]).toContain('polledExpect() was called without calling a matcher');
        expect((<any>process.exit).calls.count()).toEqual(1);
        expect((<any>process.exit).calls.argsFor(0)[0]).toEqual(1);
      } finally {
        jasmine.clock().uninstall();
      }
    }));
  });

  describe('Clicking an element', () => {
    it('retries until the element is uncovered', createTest(() => {
      browserSync.get('data:,');

      appendTestArea({ innerHtml:
        '<button class="covered" onclick="this.innerHTML = \'clicked\'">click</button>' +
        '<div class="cov" style="height:200px; width: 200px; position: absolute; top: 0; left: 0; z-index: 1;"></div>'
      });

      const consoleLog = console.log;
      let count = 0;
      spyOn(console, 'log').and.callFake(function(message: any) {
        if (/was covered, retrying click/.test(message)) {
          count++;

          if (count === 2) {
            browserSync.executeScript(() => {
              const cover = document.querySelector('div.cov');
              cover.parentNode.removeChild(cover);
            });
          } else if (count > 2) {
            throw new Error('Retried clicking too many times');
          }
        } else {
          throw new Error('Unexpected console.log received: ' + message);
        }

        return consoleLog.apply(this, arguments);
      });

      const button = elementSync.findVisible('button.covered').click();

      expect((<any>console.log).calls.count()).toEqual(2);
      expect(button.getText()).toEqual('clicked');
    }));
  });

  describe('Screenshots', () => {
    it('takes a screenshot', createTest(() => {
      spyOn(fs, 'writeFileSync');
      spyOn(fs, 'existsSync').and.returnValue(true);

      browserSync.get('data:,');
      protractorSync.takeScreenshot('test');

      expect((<any>fs.writeFileSync).calls.count()).toEqual(1);
      expect((<any>fs.writeFileSync).calls.argsFor(0)[0]).toEqual('test.png');
      expect((<any>fs.writeFileSync).calls.argsFor(0)[1].slice(0, PNG_HEADER_BASE_64.length)).toEqual(PNG_HEADER_BASE_64);
      expect((<any>fs.writeFileSync).calls.argsFor(0)[2]).toEqual('base64');
    }));

    it ('creates the screenshot dir if it doesn\'t exist', createTest(() => {
      spyOn(mkdirp, 'sync');
      spyOn(fs, 'writeFileSync');
      spyOn(fs, 'existsSync').and.returnValue(false);

      browserSync.get('data:,');
      protractorSync.takeScreenshot('test/path');

      expect((<any>mkdirp.sync).calls.count()).toEqual(1);
      expect((<any>mkdirp.sync).calls.argsFor(0)[0]).toEqual('test');
    }));
  });

  describe('Window size', () => {
    it('resizes the window', createTest(() => {
      browserSync.get('data:,');
      const viewportSize: any = browserSync.executeScript(() => {
        return {
          height: window.document.documentElement.clientHeight,
          width: window.document.documentElement.clientWidth
        };
      });

      const windowSize = browserSync.manage().window().getSize();

      expect(windowSize.width).toBeGreaterThan(0);
      expect(windowSize.height).toBeGreaterThan(0);

      protractorSync.resizeViewport({ width: 400, height: 200 });
      let newSize: any = browserSync.executeScript(() => {
        return {
          height: window.document.documentElement.clientHeight,
          width: window.document.documentElement.clientWidth
        };
      });

      expect(newSize.width).toEqual(400);
      expect(newSize.height).toEqual(200);

      protractorSync.resizeViewport(viewportSize);
      newSize = browserSync.executeScript(() => {
        return {
          height: window.document.documentElement.clientHeight,
          width: window.document.documentElement.clientWidth
        };
      });

      expect(newSize.width).toEqual(viewportSize.width);
      expect(newSize.height).toEqual(viewportSize.height);
    }));
  });
});