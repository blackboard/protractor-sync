/* tslint:disable: no-var-requires no-eval */

import fs = require('fs');
import path = require('path');

import ab = require('asyncblock');
import mkdirp = require('mkdirp');

import baseDir = require('../base_dir');

import protractor = require('protractor');

//declare var browser: protractor.Protractor;
//declare var by: protractor.IProtractorLocatorStrategy;
//declare var element: protractor.Element;

var webdriver = require('selenium-webdriver');

export module protractor_sync {
  'use strict';
  export var IMPLICIT_WAIT_MS = 5000;
  export var RETRY_INTERVAL = 10;

  export var LARGE_BREAKPOINT_WIDTH = 1366;
  export var MEDIUM_BREAKPOINT_WIDTH = 768;
  // Ideally we'd like the small breakpoint to be 320px to mimic older smart phones.  We've found that this has not been practical (chrome
  // on mac will set a minimum with of around 400px if you go lower than that, and chrome on linux stops showing the window all together if
  // you go below the minimum).  550px currently works on the build server, so until we find a work-around, we'll stick with that.
  export var SMALL_BREAKPOINT_WIDTH = 550;

  export var DEFAULT_BREAKPOINT_WIDTH = LARGE_BREAKPOINT_WIDTH;
  export var DEFAULT_BREAKPOINT_HEIGHT = 1024;

  export var CLICK_RETRY_INTERVAL = 200;

  export var autoReselectStaleElements = true;
  export var autoRetryClick = true;

  //Create an instance of an ElementFinder and ElementArrayFinder to grab their prototypes.
  //The prototypes can be used to augment all instances of ElementFinder and ElementArrayFinder.
  var elPrototype = Object.getPrototypeOf(element(by.css('')));
  var elArrayPrototype = Object.getPrototypeOf((<any>element).all(by.css('')));

  //Get access to the ElementFinder type
  var ElementFinder: any = element(by.css('')).constructor;

  var ELEMENT_PATCHES = [
    'isPresent', 'evaluate', 'allowAnimations', //These 3 are added by protractor

    'isElementPresent', 'click', 'sendKeys', //The rest of these are part of the core selenium webdriver
    'getTagName', 'getCssValue', 'getAttribute', 'getText', 'getSize', 'getLocation', 'isEnabled',
    'isSelected', 'submit', 'clear', 'isDisplayed', 'getOuterHtml', 'getInnerHtml', 'getId', 'getRawId'
  ];

  var RETRY_ON_STALE = ELEMENT_PATCHES.concat([
    'closest', 'hasClass', 'innerHeight', 'innerWidth', 'is', 'outerHeight', 'outerWidth', 'next', 'offset', 'parent',
    'parents', 'position', 'prev', 'prop', 'scrollLeft', 'scrollTop', 'scrollIntoView',
    'waitUntil'
  ]);

  /**
   * Executes a function repeatedly until it returns a value other than undefined. Waits RETRY_INTERVAL ms between function calls.
   *
   * @param fn The function to execute repeatedly
   * @param onTimeout An optional function to call when fn doesn't return a defined value before IMPLICIT_WAIT_MS.
   *                  If this is not specified then a generic exception will be raised.
   * @param waitTimeMs Override the amount of time to wait before timing out
   * @returns {any} The last value the function returned, as long as it did not time out
   */
  function _polledWait(
    fn: () => { keepPolling: boolean; data: any; },
    onTimeout?: (data: any) => void,
    waitTimeMs?: number
  ) {
    var startTime = new Date();
    var timeout = waitTimeMs != null ? waitTimeMs : IMPLICIT_WAIT_MS;
    var result: any;
    var flow = ab.getCurrentFlow();

    while (true) {
      if (result == null || new Date().getTime() - startTime.getTime() < timeout) {
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
   * @param args.shouldExist True if we expect the element to be found, false otherwise
   * @param args.single True if we're only selecting one element, false otherwise
   * @param args.requireVisible True if the elements must be visible
   * @param args.rootElement Constrain selection to descendants of this element only
   * @returns {protractor.ElementFinder[]}
   * @private
   */
  function _getElements(
    args: {
      selector: any;
      shouldExist: boolean;
      single: boolean;
      requireVisible: boolean;
      rootElement: protractor.ElementFinder;
      poll: boolean
    }
  ) {
    function extractResult(elements: protractor.ElementFinder[]) {
      var filteredCount = elements && elements.length || 0;

      if (!args.shouldExist) {
        if (filteredCount === 0) {
          return {keepPolling: false, data: []};
        }
      } else {
        if (args.single && filteredCount === 1) {
          return {keepPolling: false, data: wrapElementFinderArray(elements)};
        } else if (!args.single && filteredCount > 0) {
          return {keepPolling: false, data: wrapElementFinderArray(elements)};
        }
      }

      return {keepPolling: true, data: elements};
    }

    function onTimeout(elements: protractor.ElementFinder[]) {
      var filteredCount = elements && elements.length || 0;

      if (!args.shouldExist && filteredCount > 0) {
        throw new Error(args.selector + ' was found when it should not exist!');
      }

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
      var elements: any;
      var filtered: protractor.ElementFinder[];

      if (args.rootElement) {
        elements = (<any>args.rootElement).all(locator);
      } else {
        elements = (<any>element).all(locator);
      }

      //Force the elements to resolve immediately (we want to make sure elements selected with findElement are present before continuing)
      var resolveElementsCb = flow.add();
      var resolved: any[] = [];

      try {
        resolved = flow.sync(elements.getWebElements().then(function (result: any) {
          resolveElementsCb(null, result);
        }, function (err: any) {
          resolveElementsCb(err);
        }));
      } catch (e) {
        if (autoReselectStaleElements && e.state === 'stale element reference' && args.rootElement) {
          //Try with the new root element on the next poll
          args.rootElement = args.rootElement.reselect();
        } else {
          throw e;
        }
      }

      //Convert from an array of selenium web elements to an array of protractor element finders
      resolved = resolved.map((webElement: any, i: number) => {
        var elementFinder = ElementFinder.fromWebElement_((<any>elements).ptor_, webElement, locator);
        elementFinder.__psync_selection_args = args;
        elementFinder.__psync_selection_ordinal = i;
        return elementFinder;
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
    }, onTimeout, args.poll ? IMPLICIT_WAIT_MS : 0);
  }

  /**
   * Asserts that an element is NOT present. Polls in order to give the element time to disappear from the DOM.
   * If time expires and the element is still present, an error will be thrown.
   * @param selector A CSS selector or element locator
   * @param rootElement If specified, only search for descendants of this element
   */
  function assertElementDoesNotExist(selector: any, rootElement?: protractor.ElementFinder) {
    var elements: any[] = [];

    elements = _getElements({
      selector: selector,
      shouldExist: false,
      rootElement: rootElement,
      poll: true,
      requireVisible: false,
      single: false
    });

    return elements;
  }

  /**
   * Returns the active element on the page
   */
  function getActiveElement() {
    var active = browser.executeScript(function() {
      return document.activeElement;
    });

    return ElementFinder.fromWebElement_((<any>element).ptor_, active);
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
      shouldExist: true,
      single: true,
      requireVisible: true,
      rootElement: rootElement,
      poll: true
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
      shouldExist: true,
      single: false,
      requireVisible: true,
      rootElement: rootElement,
      poll: true
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
      shouldExist: true,
      single: true,
      requireVisible: false,
      rootElement: rootElement,
      poll: true
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
      shouldExist: true,
      single: false,
      requireVisible: false,
      rootElement: rootElement,
      poll: true
    });

    return elements;
  }

  function wrapElementFinder(elementFinder: protractor.ElementFinder) {
    if (!(<any>elementFinder).__psync_wrapped) {
      //We have to patch individual ElementFinder instances instead of just updating the prototype because
      //these methods are added to the ElementFinder instances explicitly and are not a part of the prototype.
      patchWithExec(elementFinder, ELEMENT_PATCHES);

      //For the methods which don't return a value, we want to change the return value to allow chaining (field.clear().sendKeys())
      _patch(elementFinder, ['clear', 'click', 'sendKeys', 'submit'], (returnValue: any) => {
        return elementFinder;
      });

      if (autoRetryClick) {
        var prevClick = elementFinder.click;
        elementFinder.click = function () {
          var startTime = new Date().getTime();

          var attempt: any = (...args: any[]) => {
            try {
              return prevClick.apply(this, args);
            } catch (e) {
              if (/Other element would receive the click/.test(e.message) && new Date().getTime() - startTime < IMPLICIT_WAIT_MS) {
                console.log('(Protractor-sync): Element (' + this.getSelectionPath() + ') was covered, retrying click.');

                var flow = ab.getCurrentFlow();
                flow.sync(setTimeout(flow.add(), CLICK_RETRY_INTERVAL)); //We don't need this to retry as quickly

                return attempt();
              } else {
                throw e;
              }
            }
          };

          return attempt();
        };
      }

      if (autoReselectStaleElements) {
        RETRY_ON_STALE.forEach(func => {
          (<any>elementFinder)[func] = retryOnStale(elementFinder, func);
        });
      }

      (<any>elementFinder).__psync_wrapped = true;
    }

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
    if (!ElementFinder.__psync_patched) {
      _patch(ElementFinder, ['fromWebElement_'], returnValue => {
        return wrapElementFinder(returnValue);
      });

      ElementFinder.__psync_patched = true;
    }

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

    elPrototype.getSelectionPath = function() {
      var path = '';
      var args = this.__psync_selection_args;
      if (args) {
        if (args.rootElement) {
          path += args.rootElement.getSelectionPath() + ' -> ';
        }

        if (args.selector) {
          path += args.selector;
        } else if (args.method) {
          path += args.method + '(' + (args.arg || '') + ')';
        }

        if (this.__psync_selection_ordinal > 0 || args.single === false) {
          path += '[' + this.__psync_selection_ordinal + ']';
        }
      }

      return path;
    };

    elPrototype.reselect = function() {
      var args = this.__psync_selection_args;
      if (args) {
        var elements: any;

        if (args.selector) {
          console.log('(Protractor-sync): Re-selecting stale element: ' + this.getSelectionPath());

          elements = _getElements(args);
        } else if (args.method) {
          console.log('(Protractor-sync): Re-selecting stale element: ' + this.getSelectionPath());

          elements = args.rootElement[args.method](args.arg);
        } else {
          console.error('(Protractor-sync): Attempting to re-select stale element, but selection info is incomplete');
        }

        if (Array.isArray(elements)) {
          return elements[this.__psync_selection_ordinal];
        } else {
          return elements;
        }
      } else {
        console.error('(Protractor-sync): Attempting to re-select stale element, but selection info is missing');
      }
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

      var attempt = () => {
        return browser.executeScript(function (element: HTMLElement, method: string, arg: any) {
          var $ = (<any>window).jQuery;

          if (!$) {
            return '!!jquery not present!!';
          }

          var result = arg ? $(element)[method](arg) : $(element)[method]();

          if (result instanceof (<any>window).jQuery) {
            return result.toArray();
          } else {
            return result;
          }
        }, element.getWebElement(), method, arg);
      };

      var result = attempt();

      if (result === '!!jquery not present!!') {
        injectjQuery();
        result = attempt();
      }

      if (Array.isArray(result)) {
        return result.map((webElement: any, i: number) => {
          var elementFinder = ElementFinder.fromWebElement_((<any>element).ptor_, webElement, method, arg);

          elementFinder.__psync_selection_args = {
            rootElement: element,
            method: method,
            arg: arg
          };
          elementFinder.__psync_selection_ordinal = i;

          return elementFinder;
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

    elPrototype.isFocused = function () {
      return browser.executeScript(function(element: HTMLElement) {
        return document.activeElement === element;
      }, this.getWebElement());
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

    elPrototype.sendEnterKey = function() {
      this.sendKeys(protractor.Key.ENTER);
    };

    elPrototype.sendTabKey = function() {
      this.sendKeys(protractor.Key.TAB);
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
    (<any>global).element.findVisible = findVisible;

    (<any>global).element.findVisibles = findVisibles;

    (<any>global).element.findElement = findElement;

    (<any>global).element.findElements = findElements;

    (<any>global).element.assertElementDoesNotExist = assertElementDoesNotExist;

    (<any>global).element.getActiveElement = getActiveElement;

    patchBrowser();
  }

  function patchBrowser() {
    if (!(<any>browser).__psync_patched) {
      patchWithExec(browser, ['getAllWindowHandles']);
      patchWithExec(browser.driver, ['executeScript', 'executeAsyncScript', 'sleep', 'get', 'getCurrentUrl', 'close',
                                     'quit', 'getWindowHandle']);

      var targetLocatorPrototype = Object.getPrototypeOf(browser.switchTo());
      patchWithExec(targetLocatorPrototype, ['window', 'defaultContent']);

      browser.waitFor = function(condition: () => boolean, waitTimeMs?: number) {
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

      (<any>browser).__psync_patched = true;
    }

    var managePrototype = Object.getPrototypeOf(browser.manage());
    if (!managePrototype.__psync_patched) {
      patchWithExec(
        managePrototype,
        ['addCookie', 'deleteAllCookies', 'deleteCookie', 'getCookies', 'getCookie']
      );

      managePrototype.__psync_patched = true;
    }
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

  function retryOnStale(obj: any, func: string) {
    var original = obj[func];

    return function attempt() {
      try {
        return original.apply(this, arguments);
      } catch (e) {
        if (e.state === 'stale element reference') {
          var reselected = this.reselect();

          return reselected[func].apply(reselected, arguments);
        } else {
          throw e;
        }
      }
    };
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

    return (options?: { expect: boolean; }) => {
      var SELECTOR_GLOBAL_SINGLE_ADVICE = 'Use element.findVisible() or element.findElement() instead.';
      var SELECTOR_GLOBAL_MULTI_ADVICE = 'Use element.findVisibles() or element.findElements() instead.';
      var SELECTOR_INSTANCE_SINGLE_ADVICE = 'Use instance.findVisible() or instance.findElement() instead';
      var SELECTOR_INSTANCE_MULTI_ADVICE = 'Use instance.findVisibles() or instance.findElements() instead.';
      var SLEEP_ADVICE = 'Use browser.waitFor(), element.waitUntil(), element.waitUntilRemove() etc. instead of browser.sleep().';
      var WAIT_ADVICE = 'Use browser.waitFor() instead.';
      var EXPECT_ADVICE = 'Use polledExpect instead of expect.';

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

      if (options && options.expect) {
        disableMethod(global, 'expect', EXPECT_ADVICE);
      }

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
  }

  export function polledExpect(func: Function, waitTimeMS?: number) {
    var jasmine = (<any>global).jasmine;
    if (jasmine == null) {
      throw new Error('jasmine is required to use polledExpect');
    }

    var timeout = waitTimeMS || IMPLICIT_WAIT_MS;
    var startTime = new Date().getTime();

    var flow = ab.getCurrentFlow();
    var expectation: any;
    var matcherCalled = false;
    var originalContext = new Error(); //used to keep the original stack trace

    var options = {
      actual: func(),

      addExpectationResult: function(passed: boolean, info: any) {
        var recheck = function() {
          expectation.actual = func();
          expectation[info.matcherName](info.expected);
        };

        if (!passed) {
          if (new Date().getTime() - startTime <= timeout) {
            //We have to do some funny things with the flow control because jasminewd (included w/ protractor)
            //patches expect and makes it async (and therefore not execute in the current Fiber).
            //We use flow.queue to get the recheck code to execute under the Fiber.
            //We patch the jasmine matchers (like .toEqual, .toBeGreaterThan) to wait for the verification to finish
            //before allowing the code to continue.
            flow.queue((callback: Function) => {
              flow.sync(setTimeout(flow.add(), RETRY_INTERVAL));
              recheck();

              callback();
            });
          } else {
            //If we throw the error directly the caller can't catch it b/c this is a different context
            //However, returning it to the flow.queue will throw it on the Fiber running the test
            flow.queue((callback: Function) => {
              return callback(new Error(info.message));
            });

            flow.doneAdding(); //asyncblock will wait at flow.forceWait() until this is called
          }
        } else {
          flow.doneAdding(); //asyncblock will wait at flow.forceWait() until this is called
        }
      },

      util: jasmine.matchersUtil
    };

    //We create both the normal expectation class, and the one that will be used if the user uses ".not"
    //We pre-create them both here so the proper one can be referenced when rerunning the expectation later
    var plainExpectation = new jasmine.Expectation(options);
    var notExpectation = new jasmine.Expectation({
      isNot: true,
      actual: plainExpectation.actual,
      addExpectationResult: plainExpectation.addExpectationResult,
      util: plainExpectation.util
    });
    patchExpectation(plainExpectation, () => { matcherCalled = true; });
    patchExpectation(notExpectation, () => { matcherCalled = true; });

    Object.defineProperty(plainExpectation, 'not', {
      get: function() {
        expectation = notExpectation;

        return notExpectation;
      }
    });

    expectation = plainExpectation;

    setTimeout(() => {
      if (!matcherCalled) {
        originalContext.message = 'polledExpect() was called without calling a matcher';
        console.error((<any>originalContext).stack);

        //There's no way to fail the current test because the afterEach has already run by this point
        //Exiting the process is the only way to guarantee a developer will notice the problem
        process.exit(1);
      }
    });

    return plainExpectation;
  }

  //Expose global variable so callers can call "polledExpect" similar to just calling "expect"
  (<any>global).polledExpect = polledExpect;

  /** This patch will force the expectation to block execution until it passes or throws an error. */
  function patchExpectation(expectation: any, post: Function) {
    //jasmine.matchers contains all the matchers, like toEqual, toBeGreaterThan, etc.
    _patch(expectation, Object.keys((<any>jasmine).matchers), (result: any) => {
      post();

      var flow = ab.getCurrentFlow();

      //Calling forceWait more than once seems to deadlock things
      if (!(<any>flow)._forceWait) {
        flow.forceWait();
      }

      return result;
    });
  }

  /**
   * Takes a screenshot and saves a .png file in the configured screenshot directory.
   *
   * @param filename The name of the file to save
   */
  export function takeScreenshot(filename: string) {
    if (filename) {
      var basePath = path.dirname(filename);
      if (!fs.existsSync(basePath)) {
        mkdirp.sync(basePath);
      }

      if (!(/\.png$/i).test(filename)) {
        filename += '.png';
      }
    }

    var flow = ab.getCurrentFlow();
    var callback = flow.add();
    return flow.sync(browser.takeScreenshot().then((base64png: string) => {
      if (filename) {
        fs.writeFileSync(filename, base64png, 'base64');
      }
      return callback(null, base64png);
    }, callback));
  }

  function calculateDimension(dimension: number, window: number, viewport: number) {
    return dimension + (window - viewport);
  }

  export function resizeViewport(size: { width?: number; height?: number; }) {
    var flow = ab.getCurrentFlow();

    var windowSize = flow.sync(browser.manage().window().getSize().then(flow.add({firstArgIsError: false})));
    var viewportSize: any = browser.driver.executeScript(function () {
      return {
        height: window.document.documentElement.clientHeight,
        width: window.document.documentElement.clientWidth
      };
    });

    var calcWidth = (width: number) => calculateDimension(width, windowSize.width, viewportSize.width);
    var calcHeight = (height: number) => calculateDimension(height, windowSize.height, viewportSize.height);

    var width = windowSize.width;
    var height = windowSize.height;

    if (size) {
      width = calcWidth(size.width || DEFAULT_BREAKPOINT_WIDTH);
      height = calcHeight(size.height || DEFAULT_BREAKPOINT_HEIGHT);
    } else if (windowSize.width < DEFAULT_BREAKPOINT_WIDTH) {
      width = calcWidth(DEFAULT_BREAKPOINT_WIDTH);
    } else {
      // No size set and width is wider than the minimum.  We can return early without resizing the browser
      return;
    }

    flow.sync(browser.manage().window().setSize(width, height).then(flow.add()));
  }
}
