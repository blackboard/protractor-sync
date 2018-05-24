import * as ab from 'asyncblock';
import { ElementArrayFinder, ElementFinder, protractor, ProtractorBy } from 'protractor';

import { autoReselectStaleElements, implicitWaitMs } from './config';
import { ElementFinderSync } from './element-finder-sync';
import { polledWait } from './polled-wait';

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
export function _getElements(
  args: {
    selector: any;
    shouldExist: boolean;
    single: boolean;
    requireVisible: boolean;
    rootElement: ElementFinderSync;
    poll: boolean
  }
) {
  function extractResult(elements: ElementFinder[]) {
    const filteredCount = elements && elements.length || 0;

    if (!args.shouldExist) {
      if (filteredCount === 0) {
        return { keepPolling: false, data: [] };
      }
    } else {
      if (args.single && filteredCount === 1) {
        return { keepPolling: false, data: elements };
      } else if (!args.single && filteredCount > 0) {
        return { keepPolling: false, data: elements };
      }
    }

    return { keepPolling: true, data: elements };
  }

  function onTimeout(elements: ElementFinder[]) {
    const filteredCount = elements && elements.length || 0;

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

  let locator = args.selector;
  if (typeof args.selector === 'string') {
    locator = ((global as any).by as ProtractorBy).css(args.selector);
  }

  const flow = ab.getCurrentFlow();
  if (flow == null) {
    throw new Error('asyncblock context could not be found. Please make sure protractor-sync is being called from within an asyncblock.');
  }

  return polledWait(() => {
    let elements: ElementArrayFinder;
    let filtered: ElementFinder[];

    if (args.rootElement) {
      elements = (args.rootElement.getElementFinder() as ElementFinder).all(locator);
    } else {
      elements = protractor.element.all(locator);
    }

    //Force the elements to resolve immediately (we want to make sure elements selected with findElement are present before continuing)
    const resolveElementsCb = flow.add();
    let resolved: any[] = [];

    try {
      resolved = flow.sync(elements.getWebElements().then((result: any) => {
        resolveElementsCb(null, result);
      }, (err: any) => {
        resolveElementsCb(err);
      }));
    } catch (e) {
      if (autoReselectStaleElements && e.name === 'StaleElementReferenceError' && args.rootElement) {
        //Try with the new root element on the next poll
        args.rootElement = args.rootElement.reselect();
      } else {
        throw e;
      }
    }

    //Convert from an array of selenium web elements to an array of protractor element finders
    resolved = resolved.map((webElement: any, i: number) => {
      const elementFinder = ElementFinderSync.fromWebElement_(elements.browser_, webElement, locator);

      elementFinder.selectionArgs = args;
      elementFinder.selectionOrdinal = i;

      return elementFinder;
    });

    if (args.requireVisible) {
      filtered = resolved.filter((element: ElementFinderSync) => {
        try {
          return element.isDisplayed();
        } catch (e) {
          //If the element has been removed from the DOM between when it was selected and now,
          //don't treat it as an error and fail the test.
          //Instead we will keep polling until we get a stable reference.
          if (e.name === 'StaleElementReferenceError') {
            return false;
          } else {
            throw e;
          }
        }
      });

      //If elements were removed due to visibility then the list needs to be re-indexed.
      filtered.forEach((elementFinder, i) => {
        elementFinder.selectionOrdinal = i;
      });
    } else {
      filtered = resolved;
    }

    return extractResult(filtered);
  }, onTimeout, args.poll ? implicitWaitMs : 0);
}

/**
 * Asserts that an element is NOT present. Polls in order to give the element time to disappear from the DOM.
 * If time expires and the element is still present, an error will be thrown.
 * @param selector A CSS selector or element locator
 * @param rootElement If specified, only search for descendants of this element
 * @returns true if there are no matching elements
 */
export function assertElementDoesNotExist(selector: any, rootElement?: ElementFinderSync) {
  const elements = _getElements({
    selector,
    shouldExist: false,
    rootElement,
    poll: true,
    requireVisible: false,
    single: false
  });

  return elements.length === 0;
}

/**
 * Finds a single visible instance of an element. If more than one visible elements match the locator,
 * and error is thrown. If no visible elements match the locator, an error is thrown. Implicitly waits until there is exactly one
 * visible element.
 *
 * @param selector A CSS selector or element locator
 * @param rootElement If specified, only find descendants of this element
 * @returns {ElementFinder}
 */
export function findVisible(selector: any, rootElement?: ElementFinderSync): ElementFinderSync {
  const displayed = _getElements({
    selector,
    shouldExist: true,
    single: true,
    requireVisible: true,
    rootElement,
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
 * @returns {ElementFinder[]}
 */
export function findVisibles(selector: any, rootElement?: ElementFinderSync): ElementFinderSync[] {
  const displayed = _getElements({
    selector,
    shouldExist: true,
    single: false,
    requireVisible: true,
    rootElement,
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
 * @returns {ElementFinder}
 */
export function findElement(selector: any, rootElement?: ElementFinderSync): ElementFinderSync {
  const elements = _getElements({
    selector,
    shouldExist: true,
    single: true,
    requireVisible: false,
    rootElement,
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
 * @returns {ElementFinder}
 */

export function findElements(selector: any, rootElement?: ElementFinderSync): ElementFinderSync[] {
  const elements = _getElements({
    selector,
    shouldExist: true,
    single: false,
    requireVisible: false,
    rootElement,
    poll: true
  });

  return elements;
}