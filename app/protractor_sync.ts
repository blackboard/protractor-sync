/// <reference path='../node_modules/node-shared-typescript-defs/angular-protractor-sync/angular-protractor-sync.d.ts'/>
/// <reference path='../node_modules/node-shared-typescript-defs/asyncblock/asyncblock.d.ts'/>
/// <reference path='../node_modules/node-shared-typescript-defs/node/node.d.ts'/>
/* tslint:disable: no-var-requires no-eval */
import ab = require('asyncblock');
import fs = require('fs');
import path = require('path');
import baseDir = require('../base_dir');
var webdriver = require('grunt-protractor-runner/node_modules/protractor/node_modules/selenium-webdriver');
'use strict';

export module protractor_sync {
  'use strict';
  export var IMPLICIT_WAIT_MS = 5000;
  export var RETRY_INTERVAL = 10;

//Create an instance of an ElementFinder and ElementArrayFinder to grab their prototypes.
//The prototypes can be used to augment all instances of ElementFinder and ElementArrayFinder.
  var elPrototype = Object.getPrototypeOf(element(by.css('')));
  var elArrayPrototype = Object.getPrototypeOf(element.all(by.css('')));

//Get access to the ElementFinder type
  var ElementFinder: any = element(by.css('')).constructor;

  var elementPatches = [
    'isPresent', 'evaluate', 'allowAnimations', //These 3 are added by protractor

    'isElementPresent', 'click', 'sendKeys', //The rest of these are part of the core selenium webdriver
    'getTagName', 'getCssValue', 'getAttribute', 'getText', 'getSize', 'getLocation', 'isEnabled',
    'isSelected', 'submit', 'clear', 'isDisplayed', 'getOuterHtml', 'getInnerHtml', 'getId', 'getRawId'
  ];

  /**
   * Executes a function repeatedly until it returns a value other than undefined. Waits RETRY_INTERVAL ms between function calls.
   *
   * @param fn The function to execute repeatedly
   * @param onTimeout An optional function to call when fn doesn't return a defined value before IMPLICIT_WAIT_MS.
   *                  If this is not specified then a generic exception will be raised.
   * @param waitTimeMs Override the amount of time to wait before timing out
   * @returns {any} The last value the function returned, as long as it did not time out
   */
  function _polledWait(fn: () => { keepPolling: boolean; data: any; }, onTimeout?: (data: any) => void, waitTimeMs?: number) {
    var startTime = new Date();
    var timeout = waitTimeMs || IMPLICIT_WAIT_MS;
    var result: any;
    var flow = ab.getCurrentFlow();

    while (true) {
      if (new Date().getTime() - startTime.getTime() < timeout) {
        result = fn();

        if (result.keepPolling) {
          flow.sync(setTimeout(flow.add(), RETRY_INTERVAL)); //Wait a bit before checking again
        } else {
          break;
        }
      } else {
        if (onTimeout) {
          onTimeout(result.data);
          break;
        } else {
          throw new Error('Timed out(' + timeout + ') waiting for function: ' + (<any>fn).name);
        }
      }
    }

    return result.data;
  }

  /**
   * Selects an element or elements. This function is not intended to be called directly (use findVisible, findVisibles, findElement, etc.)
   *
   * @param args.selector A css selector or locator used to select the element(s)
   * @param args.single True if we're only selecting one element, false otherwise
   * @param args.requireVisible True if the elements must be visible
   * @param args.rootElement Constrain selection to descendants of this element only
   * @returns {protractor.ElementFinder[]}
   * @private
   */
  function _getElements(args: { selector: any; single: boolean; requireVisible: boolean; rootElement: protractor.ElementFinder }) {
    function extractResult(elements: protractor.ElementFinder[]) {
      var filteredCount = elements && elements.length || 0;

      if (args.single && filteredCount === 1) {
        return {keepPolling: false, data: wrapElementFinderArray(elements)};
      } else if (!args.single && filteredCount > 0) {
        return {keepPolling: false, data: wrapElementFinderArray(elements)};
      }

      return {keepPolling: true, data: elements};
    }

    function onTimeout(elements: protractor.ElementFinder[]) {
      var filteredCount = elements && elements.length || 0;

      if (filteredCount === 0) {
        if (args.requireVisible) {
          throw new Error('No visible instances of (' + args.selector + ') were found');
        } else {
          throw new Error('No instances of (' + args.selector + ') were found');
        }
      } else if (args.single && filteredCount > 1) {
        if (args.requireVisible) {
          throw new Error('More than one visible instance of (' + args.selector + ') was found!');
        } else {
          throw new Error('More than one instance of (' + args.selector + ') was found!');
        }
      }
    }

    var locator = args.selector;
    if (typeof args.selector === 'string') {
      locator = by.css(args.selector);
    }

    var flow = ab.getCurrentFlow();

    return _polledWait(() => {
      var elements: protractor.ElementArrayFinder;
      var filtered: protractor.ElementFinder[];

      if (args.rootElement) {
        elements = args.rootElement.all(locator);
      } else {
        elements = element.all(locator);
      }

      //Force the elements to resolve immediately (we want to make sure elements selected with findElement are present before continuing)
      var resolveElementsCb = flow.add();
      var resolved = flow.sync(elements.getWebElements().then(function (result: any) {
        resolveElementsCb(null, result);
      }, function (err: any) {
        resolveElementsCb(err);
      }));

      //Convert from an array of selenium web elements to an array of protractor element finders
      resolved = resolved.map((webElement: any) => {
        return ElementFinder.fromWebElement_((<any>elements).ptor_, webElement, locator);
      });

      if (args.requireVisible) {
        filtered = resolved.filter((element: protractor.ElementFinder) => {
          try {
            return element.isDisplayed();
          } catch (e) {
            //If the element has been removed from the DOM between when it was selected and now,
            //don't treat it as an error and fail the test.
            //Instead we will keep polling until we get a stable reference.
            if (e.state === 'stale element reference') {
              return false;
            } else {
              throw e;
            }
          }
        });
      } else {
        filtered = resolved;
      }

      return extractResult(filtered);
    }, onTimeout);
  }

  /**
   * Asserts that an element is NOT present and throws an error if the element is found. Returns instantly (no polling).
   * @param selector A CSS selector or element locator
   * @param rootElement If specified, only search for descendants of this element
   */
  function assertElementDoesNotExist(selector: any, rootElement?: protractor.ElementFinder) {
    var locator = selector;
    if (typeof selector === 'string') {
      locator = by.css(selector);
    }

    var elements: protractor.ElementArrayFinder;

    if (rootElement) {
      elements = rootElement.all(locator);
    } else {
      elements = element.all(locator);
    }

    var flow = ab.getCurrentFlow();

    //Force the elements to resolve immediately
    var resolveElementsCb = flow.add();
    var resolved = flow.sync(elements.getWebElements().then(function (result: any) {
      resolveElementsCb(null, result);
    }, function (err: any) {
      resolveElementsCb(err);
    }));

    if (resolved.length > 0) {
      throw new Error(selector + ' was found when it should not exist!');
    }
  }

  /**
   * Finds a single visible instance of an element. If more than one visible elements match the locator,
   * and error is thrown. If no visible elements match the locator, an error is thrown. Implicitly waits until there is exactly one
   * visible element.
   *
   * @param selector A CSS selector or element locator
   * @param rootElement If specified, only find descendants of this element
   * @returns {protractor.ElementFinder}
   */
  function findVisible(selector: any, rootElement?: protractor.ElementFinder) {
    var displayed = _getElements({
      selector: selector,
      single: true,
      requireVisible: true,
      rootElement: rootElement
    });

    return displayed[0];
  }

  /**
   * Finds multiple visible elements. If no visible elements match the locator, an error is thrown.
   * Implicitly waits until at least one visible element is found.
   *
   * @param selector A CSS selector or element locator
   * @param rootElement If specified, only find descendants of this element
   * @returns {protractor.ElementFinder[]}
   */
  function findVisibles(selector: any, rootElement?: protractor.ElementFinder) {
    var displayed = _getElements({
      selector: selector,
      single: false,
      requireVisible: true,
      rootElement: rootElement
    });

    return displayed;
  }

  /**
   * Finds a single element. If no elements match the locator, an error is thrown.
   * Implicity waits until one element is found.
   *
   * @param selector A CSS selector or element locator
   * @param rootElement If specified, only find descendants of this element
   * @returns {protractor.ElementFinder}
   */
  function findElement(selector: any, rootElement?: protractor.ElementFinder) {
    var elements = _getElements({
      selector: selector,
      single: true,
      requireVisible: false,
      rootElement: rootElement
    });

    return elements[0];
  }

  /**
   * Finds multiple elements. If no elements match the locator, an error is thrown.
   * Implicitly waits until at least one element is found.
   *
   * @param selector A CSS selector or element locator
   * @param rootElement If specified, only find descendants of this element
   * @returns {protractor.ElementFinder}
   */

  function findElements(selector: any, rootElement?: protractor.ElementFinder) {
    var elements = _getElements({
      selector: selector,
      single: false,
      requireVisible: false,
      rootElement: rootElement
    });

    return elements;
  }

  function wrapElementFinder(elementFinder: protractor.ElementFinder) {
    //We have to patch individual ElementFinder instances instead of just updating the prototype because
    //these methods are added to the ElementFinder instances explicitly and are not a part of the prototype.
    patchWithExec(elementFinder, elementPatches);

    //For the methods which don't return a value, we want to change the return value to allow chaining (field.clear().sendKeys())
    _patch(elementFinder, ['clear', 'click', 'sendKeys', 'submit'], function (returnValue: any) {
      return elementFinder;
    });

    return elementFinder;
  }

  function wrapElementFinderArray(elementFinders: protractor.ElementFinder[]) {
    elementFinders.forEach(ef => wrapElementFinder(ef));

    return elementFinders;
  }

  /**
   * Augments ElementFinder and ElementArrayFinder "types" with synchronous extensions
   */
  function patchElementFinder() {
    _patch(ElementFinder, ['fromWebElement_'], returnValue => {
      return wrapElementFinder(returnValue);
    });

    //Add exec functions to ElementFinder and ElementArrayFinder, which can be used to resolve the elements synchronously
    elPrototype.exec = function () {
      return exec(this);
    };

    elArrayPrototype.exec = function () {
      return exec(this);
    };

    //Add in findVisible and findVisibles
    elPrototype.findVisible = function (selector: any) {
      return findVisible(selector, this);
    };

    elPrototype.findVisibles = function (selector: any) {
      return findVisibles(selector, this);
    };

    //Add in aliases for findElement and findElements
    elPrototype.findElement = function (selector: any) {
      return findElement(selector, this);
    };

    elPrototype.findElements = function (selector: any) {
      return findElements(selector, this);
    };

    //Add in assertElementDoesNotExist
    elPrototype.assertElementDoesNotExist = function(selector: any) {
      return assertElementDoesNotExist(selector, this);
    };

    //Polled waiting

    elPrototype.waitUntil = function (condition: string) {
      _polledWait(() => {
        var val = browser.driver.executeScript(function (element: HTMLElement, condition: string) {
          return (<any>window).$(element).is(condition);
        }, this.getWebElement(), condition);

        return {data: <any>null, keepPolling: !val};
      }, () => {
        throw new Error('Timed out(' + IMPLICIT_WAIT_MS + ') waiting for condition: ' + condition);
      });

      return this;
    };

    elPrototype.waitUntilRemoved = function () {
      _polledWait(() => {
        return {data: <any>null, keepPolling: this.isPresent()};
      }, () => {
        throw new Error('Timed out(' + IMPLICIT_WAIT_MS + ') waiting for element to be removed');
      });

      return this;
    };

    //JQuery methods

    function executeJQueryElementMethod(element: protractor.ElementFinder, method: string, arg?: any) {
      //Warning: this method requires jQuery to be in the page
      var result: any = browser.executeScript(function (element: HTMLElement, method: string, arg: any) {
        var $ = (<any>window).jQuery;
        var result = arg ? $(element)[method](arg) : $(element)[method]();

        if (result instanceof (<any>window).jQuery) {
          return result.toArray();
        } else {
          return result;
        }
      }, element.getWebElement(), method, arg);

      if (Array.isArray(result)) {
        return result.map((webElement: any) => {
          return ElementFinder.fromWebElement_((<any>element).ptor_, webElement, method, arg);
        });
      } else {
        return result;
      }
    }

    elPrototype.closest = function (selector: string) {
      return executeJQueryElementMethod(this, 'closest', selector)[0];
    };

    elPrototype.hasClass = function (className: string) {
      return browser.executeScript(function (element: HTMLElement, className: string) {
        return element.classList.contains(className);
      }, this.getWebElement(), className);
    };

    elPrototype.innerHeight = function () {
      return executeJQueryElementMethod(this, 'innerHeight');
    };

    elPrototype.innerWidth = function () {
      return executeJQueryElementMethod(this, 'innerWidth');
    };

    elPrototype.is = function (selector: string) {
      return executeJQueryElementMethod(this, 'is', selector);
    };

    elPrototype.outerHeight = function (includeMargin?: boolean) {
      return executeJQueryElementMethod(this, 'outerHeight', includeMargin);
    };

    elPrototype.outerWidth = function (includeMargin?: boolean) {
      return executeJQueryElementMethod(this, 'outerWidth', includeMargin);
    };

    elPrototype.next = function (selector?: string) {
      return executeJQueryElementMethod(this, 'next', selector)[0];
    };

    elPrototype.offset = function () {
      return executeJQueryElementMethod(this, 'offset');
    };

    elPrototype.parent = function (selector?: string) {
      return executeJQueryElementMethod(this, 'parent', selector)[0];
    };

    elPrototype.parents = function (selector?: string) {
      return executeJQueryElementMethod(this, 'parents', selector);
    };

    elPrototype.position = function () {
      return executeJQueryElementMethod(this, 'position');
    };

    elPrototype.prev = function (selector?: string) {
      return executeJQueryElementMethod(this, 'prev', selector)[0];
    };

    elPrototype.prop = function (name: string) {
      return executeJQueryElementMethod(this, 'prop', name);
    };

    elPrototype.scrollLeft = function () {
      return executeJQueryElementMethod(this, 'scrollLeft');
    };

    elPrototype.scrollTop = function () {
      return executeJQueryElementMethod(this, 'scrollTop');
    };

    elPrototype.scrollIntoView = function () {
      browser.executeScript(function (element: HTMLElement) {
        element.scrollIntoView();
      }, this.getWebElement());
      return this;
    };
  }

  /**
   * Extend global element variable
   */
  function patchGlobals() {
    global.element.findVisible = findVisible;

    global.element.findVisibles = findVisibles;

    global.element.findElement = findElement;

    global.element.findElements = findElements;

    global.element.assertElementDoesNotExist = assertElementDoesNotExist;

    patchBrowser();
  }

  function patchBrowser() {
    patchWithExec(browser, ['getAllWindowHandles']);
    patchWithExec(browser.driver, ['executeScript', 'executeAsyncScript', 'sleep', 'get', 'getCurrentUrl', 'close']);

    var targetLocatorPrototype = Object.getPrototypeOf(browser.switchTo());
    patchWithExec(targetLocatorPrototype, ['window', 'defaultContent']);

    browser.waitFor = function (condition: () => boolean, waitTimeMs?: number) {
      _polledWait(() => {
        return {data: <any>null, keepPolling: !condition()};
      }, null, waitTimeMs);
    };

    var PAUSE_DEBUGGER_DELAY_MS = 500;
    _patch(browser, ['pause', 'debugger'], (returnValue: any) => {
      var flow = ab.getCurrentFlow();
      if (flow) {
        //Sometimes pause and debugger don't work without a delay before executing the next command
        flow.sync(setTimeout(flow.add(), PAUSE_DEBUGGER_DELAY_MS));
      }

      return returnValue;
    });
  }

  function _patch(obj: any, methods: string[], post: (returnValue: any) => any) {
    var patches = Object.create(null);

    methods.forEach(func => {
      patches[func] = obj[func];

      obj[func] = function () {
        var returnValue = patches[func].apply(this, arguments);

        if (post) {
          returnValue = post.call(this, returnValue);
        }

        return returnValue;
      };
    });
  }

  function patchWithExec(proto: any, methods: string[]) {
    _patch(proto, methods, returnValue => {
      if (returnValue && returnValue.exec && ab.getCurrentFlow()) {
        return returnValue.exec();
      } else {
        return returnValue;
      }
    });
  }

  /**
   * Patch the selenium webdriver promise
   */
  function patchPromise() {
    //Add an "exec" utility method which can be used to resolve the promise immediately
    webdriver.promise.Promise.prototype.exec = function () {
      return exec(this);
    };
  }

  function exec(obj: any) {
    if (obj.then) {
      var flow = ab.getCurrentFlow();
      var cb = flow.add();

      return flow.sync(obj.then(function (result: any) {
        cb(null, result);
      }, function (err: any) {
        cb(err);
      }));
    } else {
      return obj;
    }
  }

  /**
   * Apply synchronous patches to protractor
   */
  export function patch() {
    patchElementFinder();
    patchGlobals();
    patchPromise();
  }

  export var disallowMethods = (function () {
    var ALLOWED_LOCATIONS = ['node_modules', 'protractor_sync.'];

    function disableMethod(object: any, method: string, extraInfo?: string) {
      if (object[method] == null) {
        throw new Error('Cannot disable ' + method + '(). It does not exist');
      }

      var original = object[method];
      object[method] = function () {
        // We don't want to block access from protractor or selenium or the current file
        var stack = (<any>new Error()).stack;

        //First line is the error message, second line is where the error was created, third line is the caller
        var secondFrame = stack.split('\n')[2];

        if (ALLOWED_LOCATIONS.every(location => secondFrame.indexOf(location) < 0)) {
          throw new Error(method + '() has been disabled in this project! ' + (extraInfo || ''));
        } else {
          return original.apply(this, arguments);
        }
      };
    }

    return () => {
      var SELECTOR_GLOBAL_SINGLE_ADVICE = 'Use element.findVisible() or element.findElement() instead.';
      var SELECTOR_GLOBAL_MULTI_ADVICE = 'Use element.findVisibles() or element.findElements() instead.';
      var SELECTOR_INSTANCE_SINGLE_ADVICE = 'Use instance.findVisible() or instance.findElement() instead';
      var SELECTOR_INSTANCE_MULTI_ADVICE = 'Use instance.findVisibles() or instance.findElements() instead.';
      var SLEEP_ADVICE = 'Use browser.waitFor(), element.waitUntil(), element.waitUntilRemove() etc. instead of browser.sleep().';
      var WAIT_ADVICE = 'Use browser.waitFor() instead.';

      disableMethod(browser, '$', SELECTOR_GLOBAL_SINGLE_ADVICE);
      disableMethod(browser, '$$', SELECTOR_GLOBAL_MULTI_ADVICE);
      disableMethod(browser, 'element', SELECTOR_GLOBAL_SINGLE_ADVICE);
      disableMethod(element, 'all', SELECTOR_GLOBAL_MULTI_ADVICE);
      // I don't see a good way to disable the "element()" selector

      disableMethod(elPrototype, '$', SELECTOR_INSTANCE_SINGLE_ADVICE);
      disableMethod(elPrototype, '$$', SELECTOR_INSTANCE_MULTI_ADVICE);
      disableMethod(elPrototype, 'all', SELECTOR_INSTANCE_MULTI_ADVICE);
      disableMethod(elPrototype, 'element', SELECTOR_INSTANCE_SINGLE_ADVICE);

      disableMethod(browser.driver, 'wait', WAIT_ADVICE);
      disableMethod(browser.driver, 'findElement', SELECTOR_GLOBAL_SINGLE_ADVICE);
      disableMethod(browser.driver, 'findElements', SELECTOR_GLOBAL_MULTI_ADVICE);
      disableMethod(browser.driver, 'sleep', SLEEP_ADVICE);

      disableMethod(browser, 'wait', WAIT_ADVICE);
      disableMethod(browser, 'findElement', SELECTOR_GLOBAL_SINGLE_ADVICE);
      disableMethod(browser, 'findElements', SELECTOR_GLOBAL_MULTI_ADVICE);
      disableMethod(browser, 'sleep', SLEEP_ADVICE);

      var LOCATOR_ADVICE = 'Use a css selector or by.model instead.';

      [
        'binding',
        'buttonText',
        'className',
        'css',
        'cssContainingText',
        'deepCss',
        'exactBinding',
        'exactRepeater',
        'id',
        'js',
        'name',
        'options',
        'partialButtonText',
        'repeater',
        'tagName',
        'xpath'
      ].forEach(locator => {
            disableMethod(by, locator, LOCATOR_ADVICE);
          });
    };
  })();

  export function injectjQuery() {
    var jQuery = browser.executeScript(function() {
      return !!(<any>window).jQuery;
    });

    if (!jQuery) {
      var jquerySource = fs.readFileSync(path.join(__dirname, './jquery-1.11.3.js'), 'utf8');

      browser.executeScript((jquerySource: string) => {
        eval(jquerySource);

        (<any>window).$.noConflict();
      }, jquerySource);
    }
  }

  export function waitForNewWindow(action: Function, waitTimeMs?: number) {
    var handlesBefore: string[] = (<any>browser).getAllWindowHandles();
    var handles: string[];

    action();

    browser.waitFor(() => {
      handles = (<any>browser).getAllWindowHandles();
      return handles.length === handlesBefore.length + 1;
    }, waitTimeMs);

    var newWindowHandle = handles[handles.length - 1];

    browser.switchTo().window(newWindowHandle);

    browser.waitFor(() => {
      return (<any>browser.driver).getCurrentUrl() !== '';
    }, waitTimeMs);
  };

}
