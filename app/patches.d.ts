// Type definitions for Angular Protractor 0.17.0
// Project: https://github.com/angular/protractor
// Definitions by: Bill Armstrong <https://github.com/BillArmstrong>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/* tslint:disable */

import {ProtractorBrowser, ProtractorBy, WebDriver, WebElement} from 'protractor';

export interface Element {
  /** Finds a single visible instance of an element within this element. If more than one visible element matches the selector,
   *  an error is thrown. If no visible elements match the selector, an error is thrown. Implicitly waits until there is exactly one
   *  visible element.
   *
   * @param selector A css selector
   */
  findVisible(selector: string): ElementFinder;

  /** Finds a single visible instance of an element within this element. If more than one visible element matches the locator,
   *  an error is thrown. If no visible elements match the locator, an error is thrown. Implicity waits until there is exactly one
   *  visible element.
   *
   * @param locator An element locator
   */
  findVisible(locator: ProtractorBy): ElementFinder;

  /** Finds multiple visible elements on the page. If no visible elements match the selector, an error is thrown.
   *  Implicitly waits until at least one visible element is found.
   *
   * @param selector A css selector
   */
  findVisibles(selector: string): ElementFinder[];

  /** Finds multiple visible elements on the page. If no visible elements match the locator, an error is thrown.
   *  Implicitly waits until at least one visible element is found.
   *
   * @param locator An element locator
   */
  findVisibles(locator: ProtractorBy): ElementFinder[];

  /** Finds a single element on the page. If no elements match the selector, an error is thrown.
   *  Implicitly waits until exactly one element is found.
   *
   * @param selector A css selector
   */
  findElement(selector: string): ElementFinder;

  /** Finds a single element on the page. If no elements match the selector, an error is thrown.
   *  Implicitly waits until exactly one element is found.
   *
   * @param locator An element locator
   */
  findElement(locator: ProtractorBy): ElementFinder;

  /** Finds multiple elements on the page. If no elements match the selector, an error is thrown.
   *  Implicitly waits until at least one element is found.
   *
   * @param selector A css selector
   */
  findElements(selector: string): ElementFinder[];

  /** Finds multiple elements on the page. If no elements match the locator, an error is thrown.
   *  Implicitly waits until at least one element is found.
   *
   * @param locator An element locator
   */
  findElements(locator: ProtractorBy): ElementFinder[];

  /**
   * Asserts that no elements matching the selector exist. Throws an error if
   * a matching element is found.
   * @param selector A css selector
   */
  assertElementDoesNotExist(selector: string): boolean;

  /**
   * Asserts that no elements matching the selector exist. Throws an error if
   * a matching element is found.
   * @param locator An element locator
   */
  assertElementDoesNotExist(locator: ProtractorBy): boolean;

  /**
   * Returns the active element on the page
   */
  getActiveElement(): ElementFinder;
}

export interface ElementFinder {
  /**
   * Schedules a command to click on this element.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved when
   *     the click command has completed.
   */
  click(): ElementFinder;

  /**
   * Schedules a command to type a sequence on the DOM element represented by this
   * instance.
   * <p/>
   * Modifier keys (SHIFT, CONTROL, ALT, META) are stateful; once a modifier is
   * processed in the keysequence, that key state is toggled until one of the
   * following occurs:
   * <ul>
   * <li>The modifier key is encountered again in the sequence. At this point the
   * state of the key is toggled (along with the appropriate keyup/down events).
   * </li>
   * <li>The {@code webdriver_sync.Key.NULL} key is encountered in the sequence. When
   * this key is encountered, all modifier keys current in the down state are
   * released (with accompanying keyup events). The NULL key can be used to
   * simulate common keyboard shortcuts:
   * <code>
   *     element.sendKeys("text was",
   *                      webdriver_sync.Key.CONTROL, "a", webdriver_sync.Key.NULL,
   *                      "now text is");
   *     // Alternatively:
   *     element.sendKeys("text was",
   *                      webdriver_sync.Key.chord(webdriver_sync.Key.CONTROL, "a"),
   *                      "now text is");
   * </code></li>
   * <li>The end of the keysequence is encountered. When there are no more keys
   * to type, all depressed modifier keys are released (with accompanying keyup
   * events).
   * </li>
   * </ul>
   * <strong>Note:</strong> On browsers where native keyboard events are not yet
   * supported (e.g. Firefox on OS X), key events will be synthesized. Special
   * punctionation keys will be synthesized according to a standard QWERTY en-us
   * keyboard layout.
   *
   * @param {...string} var_args The sequence of keys to
   *     type. All arguments will be joined into a single sequence (var_args is
   *     permitted for convenience).
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved when all
   *     keys have been typed.
   */
  sendKeys(...var_args: string[]): ElementFinder;

  /**
   * Schedules a command to query for the tag/node name of this element.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with the
   *     element's tag name.
   */
  getTagName(): string;

  /**
   * Schedules a command to query for the computed style of the element
   * represented by this instance. If the element inherits the named style from
   * its parent, the parent will be queried for its value.  Where possible, color
   * values will be converted to their hex representation (e.g. #00ff00 instead of
   * rgb(0, 255, 0)).
   * <p/>
   * <em>Warning:</em> the value returned will be as the browser interprets it, so
   * it may be tricky to form a proper assertion.
   *
   * @param {string} cssStyleProperty The name of the CSS style property to look
   *     up.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with the
   *     requested CSS value.
   */
  getCssValue(cssStyleProperty: string): string;

  /**
   * Schedules a command to query for the value of the given attribute of the
   * element. Will return the current value even if it has been modified after the
   * page has been loaded. More exactly, this method will return the value of the
   * given attribute, unless that attribute is not present, in which case the
   * value of the property with the same name is returned. If neither value is
   * set, null is returned. The "style" attribute is converted as best can be to a
   * text representation with a trailing semi-colon. The following are deemed to
   * be "boolean" attributes and will be returned as thus:
   *
   * <p>async, autofocus, autoplay, checked, compact, complete, controls, declare,
   * defaultchecked, defaultselected, defer, disabled, draggable, ended,
   * formnovalidate, hidden, indeterminate, iscontenteditable, ismap, itemscope,
   * loop, multiple, muted, nohref, noresize, noshade, novalidate, nowrap, open,
   * paused, pubdate, readonly, required, reversed, scoped, seamless, seeking,
   * selected, spellcheck, truespeed, willvalidate
   *
   * <p>Finally, the following commonly mis-capitalized attribute/property names
   * are evaluated as expected:
   * <ul>
   *   <li>"class"
   *   <li>"readonly"
   * </ul>
   * @param {string} attributeName The name of the attribute to query.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with the
   *     attribute's value.
   */
  getAttribute(attributeName: string): string;

  /**
   * Get the visible (i.e. not hidden by CSS) innerText of this element, including
   * sub-elements, without any leading or trailing whitespace.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with the
   *     element's visible text.
   */
  getText(): string;

  /**
   * Schedules a command to compute the size of this element's bounding box, in
   * pixels.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with the
   *     element's size as a {@code {width:number, height:number}} object.
   */
  getSize(): { width: number; height: number; };

  /**
   * Schedules a command to compute the location of this element in page space.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved to the
   *     element's location as a {@code {x:number, y:number}} object.
   */
  getLocation(): { x: number; y: number; };

  /**
   * Schedules a command to query whether the DOM element represented by this
   * instance is enabled, as dicted by the {@code disabled} attribute.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with
   *     whether this element is currently enabled.
   */
  isEnabled(): boolean;

  /**
   * Schedules a command to query whether this element is selected.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with
   *     whether this element is currently selected.
   */
  isSelected(): boolean;

  /**
   * Schedules a command to submit the form containing this element (or this
   * element if it is a FORM element). This command is a no-op if the element is
   * not contained in a form.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved when
   *     the form has been submitted.
   */
  submit(): ElementFinder;

  /**
   * Schedules a command to clear the {@code value} of this element. This command
   * has no effect if the underlying DOM element is neither a text INPUT element
   * nor a TEXTAREA element.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved when
   *     the element has been cleared.
   */
  clear(): ElementFinder;

  /**
   * Schedules a command to test whether this element is currently displayed.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with
   *     whether this element is currently visible on the page.
   */
  isDisplayed(): boolean;

  /**
   * Schedules a command to retrieve the outer HTML of this element.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with
   *     the element's outer HTML.
   */
  getOuterHtml(): string;

  /**
   * Schedules a command to retrieve the inner HTML of this element.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with the
   *     element's inner HTML.
   */
  getInnerHtml(): string;

  /**
   * Schedules a command to test if there is at least one descendant of this
   * element that matches the given search criteria.
   *
   * <p>Note that JS locator searches cannot be restricted to a subtree of the
   * DOM. All such searches are delegated to this instance's parent WebDriver.
   *
   * @param {webdriver_sync.Locator|Object.<string>} locator The locator
   *     strategy to use when searching for the element.
   * @param {...} var_args Arguments to pass to {@code WebDriver#executeScript} if
   *     using a JavaScript locator.  Otherwise ignored.
   * @return {!webdriver_sync.promise.Promise} A promise that will be resolved with
   *     whether an element could be located on the page.
   */
  isElementPresent(locator: ProtractorBy, ...var_args: any[]): boolean;
  isElementPresent(locator: any, ...var_args: any[]): boolean;

  /**
   * Finds a single visible instance of an element within this element. If more than one visible element matches the selector,
   * an error is thrown. If no visible elements match the selector, an error is thrown. Implicitly waits until there is exactly one
   * visible element.
   *
   * @param selector A css selector
   */
  findVisible(selector: string): ElementFinder;

  /**
   * Finds a single visible instance of an element within this element. If more than one visible element matches the locator,
   * an error is thrown. If no visible elements match the locator, an error is thrown. Implicity waits until there is exactly one
   * visible element.
   *
   * @param locator An element locator
   */
  findVisible(locator: ProtractorBy): ElementFinder;

  /**
   * Finds multiple visible elements within this element. If no visible elements match the selector, an error is thrown.
   * Implicitly waits until at least one visible element is found.
   *
   * @param selector A css selector
   */
  findVisibles(selector: string): ElementFinder[];

  /**
   * Finds multiple visible elements within this element. If no visible elements match the locator, an error is thrown.
   * Implicitly waits until at least one visible element is found.
   *
   * @param locator An element locator
   */
  findVisibles(locator: ProtractorBy): ElementFinder[];

  /**
   * Finds a single element within this element. If no elements match the selector, an error is thrown.
   * Implicitly waits until exactly one element is found.
   *
   * @param selector A css selector
   */
  findElement(selector: string): ElementFinder;

  /**
   * Finds a single element within this element. If no elements match the selector, an error is thrown.
   * Implicitly waits until exactly one element is found.
   *
   * @param locator An element locator
   */
  findElement(locator: ProtractorBy): ElementFinder;

  /**
   * Finds multiple elements within this element. If no elements match the selector, an error is thrown.
   * Implicitly waits until at least one element is found.
   *
   * @param selector A css selector
   */
  findElements(selector: string): ElementFinder[];

  /**
   * Finds multiple elements within this element. If no elements match the locator, an error is thrown.
   * Implicitly waits until at least one element is found.
   *
   * @param locator An element locator
   */
  findElements(locator: ProtractorBy): ElementFinder[];

  /**
   * Asserts that no elements matching the selector exist. Throws an error if
   * a matching element is found. This method does an immediate check for the element, and does not wait.
   * @param selector A css selector
   */
  assertElementDoesNotExist(selector: string): boolean;

  /**
   * Asserts that no elements matching the selector exist. Throws an error if
   * a matching element is found. This method does an immediate check for the element, and does not wait.
   * @param locator An element locator
   */
  assertElementDoesNotExist(locator: ProtractorBy): boolean;

  /**
   * Waits until the condition is true (or times out if it doesn't become true before the implicit wait interval).
   * The condition can be any JQuery selector, for example:
   *
   * .ready                (has a class of "ready")
   * :not(.ready)          (does not have a class of "ready")
   * :focus                (has focus)
   * :visible              (element is visible - don't use this one, use elementFinder.isDisplayed() instead)
   * :enabled              (element is enabled - don't use this one, use elementFinder.isEnabled() instead)
   *
   * @param condition A JQuery selector to poll for until it is true for this element
   */
  waitUntil(condition: string): ElementFinder;

  /**
   * Waits until this element is removed from the DOM. If it is not removed from the DOM before the implicit wait interval,
   * an error will occur.
   */
  waitUntilRemoved(): ElementFinder;

  /**
   * Examines the current element and ancestor elements, and returns the first one which matches the selector.
   *
   * @param selector A css selector
   */
  closest(selector: string): ElementFinder;

  /**
   * Determines whether the current element contains the specified class or not.
   * @param className A single class name to test for
   */
  hasClass(className: string): boolean;

  /**
   * Determines whether the current element is focused
   */
  isFocused(): boolean;

  /**
   * Get the computed inner height (including padding but not border) of the current element.
   */
  innerHeight(): number;

  /**
   * Get the computed inner width (including padding but not border) of the current element.
   */
  innerWidth(): number;

  /**
   * Check the current element against a selector, return true if it matches the selector.
   *
   * @param selector A jQuery selector
   */
  is(selector: string): boolean;

  /**
   * Get the computed height for the current element, including padding, border, and optionally margin.
   *
   * @param includeMargin
   */
  outerHeight(includeMargin?: boolean): number;

  /**
   * Get the computed width for the current element, including padding, border, and optionally margin.
   *
   * @param includeMargin
   */
  outerWidth(includeMargin?: boolean): number;

  /**
   * Get the immediately following sibling of the current element.
   * If a selector is provided, it retrieves the next sibling only if it matches that selector.
   *
   * @param selector A jQuery selector
   */
  next(selector?: string): ElementFinder;

  /**
   * Get the coordinates of the current element relative to the document.
   */
  offset(): { top: number; left: number };

  /**
   * Get the parent of the current element, optionally filtered by a selector.
   * @param selector A jQuery selector
   */
  parent(selector?: string): ElementFinder;

  /**
   * Get the ancestors of the current element, optionally filtered by a selector.
   *
   * @param selector A jQuery selector
   */
  parents(selector?: string): ElementFinder[];

  /**
   * Get the coordinates of the current element, relative to the offset parent.
   */
  position(): { top: number; left: number };

  /**
   * Get the immediately preceding sibling of the current element, optionally filtered by a selector.
   *
   * @param selector A jQuery selector
   */
  prev(selector?: string): ElementFinder;

  /**
   * Get the value of a property for the current element.
   *
   * @param name The name of the property to retrieve (checked, disabled, etc.)
   */
  prop(name: string): any;

  /**
   * Send the ENTER key to the current element
   */
  sendEnterKey(): void;

  /**
   * Send the TAB key to the current element
   */
  sendTabKey(): void;

  /**
   * Get the horizontal position of the scroll bar for the current element.
   */
  scrollLeft(): number;

  /**
   * Get the vertical position of the scroll bar for the current element.
   */
  scrollTop(): number;

  /**
   * Scroll the page such that the top of the current element is at the top of the visible page.
   */
  scrollIntoView(): ElementFinder;

  /**
   * Based on the selection method used to find this element originally, selects the element from the DOM again
   */
  reselect(): ElementFinder;

  /**
   * Retrieves information about how the element was selected
   */
  getSelectionPath(): string;

  getWebElement(): WebElement;

  /**
   * Evalates the input as if it were on the scope of the current element.
   * @param {string} expression
   *
   * @return {!webdriver_sync.promise.Promise} A promise that will resolve to the
   *     evaluated expression. The result will be resolved as in
   *     {@link webdriver_sync.WebDriver.executeScript}. In summary - primitives will
   *     be resolved as is, functions will be converted to string, and elements
   *     will be returned as a WebElement.
   */
  evaluate(expression: string): any;

  isPresent(): boolean;
}

export const element: Element;
export const by: ProtractorBy;
export const browser: ProtractorBrowser;