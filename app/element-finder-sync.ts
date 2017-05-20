import * as ab from 'asyncblock';
import * as fs from 'fs';
import * as path from 'path';
import { ElementFinder, ProtractorBrowser, ProtractorBy } from 'protractor';
import { Locator } from 'protractor/built/locators';
import { ILocation, ISize, IWebElementId, Key, WebElement } from 'selenium-webdriver';

import { BrowserSync } from './browser-sync';
import { autoRetryClick, CLICK_RETRY_INTERVAL, IMPLICIT_WAIT_MS } from './config';
import { exec } from './exec';
import { polledWait } from './polled-wait';
import { _getElements, assertElementDoesNotExist, findElement, findElements, findVisible, findVisibles  } from './selection';
import { browserSync } from './vars';

export class ElementFinderSync {
  public selectionArgs: any;
  public selectionOrdinal: number;

  constructor(private element: ElementFinder) {

  }

  findVisible(selector: string | ProtractorBy) {
    return findVisible(selector, this);
  }

  findVisibles(selector: string | ProtractorBy) {
    return findVisibles(selector, this);
  }

  findElement(selector: string | ProtractorBy) {
    return findElement(selector, this);
  }

  findElements(selector: string | ProtractorBy) {
    return findElements(selector, this);
  }

  assertElementDoesNotExist(selector: string | ProtractorBy) {
    return assertElementDoesNotExist(selector, this);
  }

  getElementFinder() {
    return this.element;
  }

  getSelectionPath() {
    let path = '';
    const args = this.selectionArgs;
    if (args) {
      if (args.rootElement) {
        path += args.rootElement.getSelectionPath() + ' -> ';
      }

      if (args.selector) {
        path += args.selector;
      } else if (args.method) {
        path += args.method + '(' + (args.arg || '') + ')';
      }

      if (this.selectionOrdinal > 0 || args.single === false) {
        path += '[' + this.selectionOrdinal + ']';
      }
    }

    return path;
  }

  reselect(): ElementFinderSync {
    const args = this.selectionArgs;
    if (args) {
      let elements: ElementFinderSync[];

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
        return elements[this.selectionOrdinal];
      } else {
        return elements;
      }
    } else {
      console.error('(Protractor-sync): Attempting to re-select stale element, but selection info is missing');
    }
  }

  //Polled waiting

  waitUntil(condition: string) {
    polledWait(() => {
      const val = this.element.browser_.executeScript((element: HTMLElement, _condition: string) => {
        return (<any>window).$(element).is(_condition);
      }, this.element , condition);

      return {data: <any>null, keepPolling: !val};
    }, () => {
      throw new Error('Timed out(' + IMPLICIT_WAIT_MS + ') waiting for condition: ' + condition);
    });

    return this;
  }

  waitUntilRemoved() {
    polledWait(() => {
      return { data: <any>null, keepPolling: this.isPresent() };
    }, () => {
      throw new Error('Timed out(' + IMPLICIT_WAIT_MS + ') waiting for element to be removed');
    });

    return this;
  }

  //ElementFinder methods

  isPresent(): boolean {
    return exec(this.element.isPresent());
  }

  static fromWebElement_(browser: BrowserSync | ProtractorBrowser, webElem: WebElement, locator?: Locator) {
    const _browser = browser instanceof BrowserSync ? browser.getBrowser() : browser;

    return new ElementFinderSync(ElementFinder.fromWebElement_(_browser, webElem, locator));
  }

  evaluate(expression: string): ElementFinderSync {
    return this.runWithStaleDetection(() => exec(this.element.evaluate(expression)));
  }

  allowAnimations(value: boolean): ElementFinderSync {
    return this.runWithStaleDetection(() => exec(this.element.allowAnimations(value)));
  }

  isElementPresent(subLocator: Locator): boolean {
    return this.runWithStaleDetection(() => exec(this.element.isElementPresent(subLocator)));
  }

  click(): ElementFinderSync {
    const startTime = new Date().getTime();

    const attempt: any = () => {
      try {
        exec(this.element.click());
      } catch (e) {
        if (autoRetryClick && /Other element would receive the click/.test(e.message) && new Date().getTime() - startTime < IMPLICIT_WAIT_MS) {
          console.log('(Protractor-sync): Element (' + this.getSelectionPath() + ') was covered, retrying click.');

          const flow = ab.getCurrentFlow();
          flow.sync(setTimeout(flow.add(), CLICK_RETRY_INTERVAL)); //We don't need this to retry as quickly

          return attempt();
        } else {
          throw e;
        }
      }
    };

    this.runWithStaleDetection(() => attempt());

    return this;
  }

  sendKeys(...varArgs: Array<string | number>): ElementFinderSync {
    this.runWithStaleDetection(() => exec(this.element.sendKeys.apply(this.element, varArgs)));

    return this;
  }

  getTagName(): string {
    return this.runWithStaleDetection(() => exec(this.element.getTagName()));
  }

  getCssValue(cssStyleProperty: string): string {
    return this.runWithStaleDetection(() => exec(this.element.getCssValue(cssStyleProperty)));
  }

  getAttribute(attributeName: string): string {
    return this.runWithStaleDetection(() => exec(this.element.getAttribute(attributeName)));
  }

  getText(): string {
    return this.runWithStaleDetection(() => exec(this.element.getText()));
  }

  getSize(): ISize {
    return this.runWithStaleDetection(() => exec(this.element.getSize()));
  }

  getLocation(): ILocation {
    return this.runWithStaleDetection(() => exec(this.element.getLocation()));
  }

  isEnabled(): boolean {
    return this.runWithStaleDetection(() => exec(this.element.isEnabled()));
  }

  isSelected(): boolean {
    return this.runWithStaleDetection(() => exec(this.element.isSelected()));
  }

  submit(): ElementFinderSync {
    this.runWithStaleDetection(() => exec(this.element.submit()));

    return this;
  }

  clear(): ElementFinderSync {
    this.runWithStaleDetection(() => exec(this.element.clear()));

    return this;
  }

  isDisplayed(): boolean {
    return this.runWithStaleDetection(() => exec(this.element.isDisplayed()));
  }

  takeScreenshot(optScroll?: boolean): string {
    return this.runWithStaleDetection(() => exec(this.element.takeScreenshot(optScroll)));
  }

  getOuterHtml(): string {
    return this.runWithStaleDetection(() => exec(this.element.getOuterHtml()));
  }

  getInnerHtml(): string {
    return this.runWithStaleDetection(() => exec(this.element.getInnerHtml()));
  }

  serialize(): IWebElementId {
    return this.runWithStaleDetection(() => exec(this.element.serialize()));
  }

  getId(): string {
    return this.runWithStaleDetection(() => exec(this.element.getId()));
  }

  //JQuery methods

  executeJQueryElementMethod(method: string, arg?: any): any {
    const attempt = () => {
      this.injectjQuery(); //Automatically inject jQuery into the page for testing sites that don't use it

      return browserSync.executeScript((element: HTMLElement, _method: string, _arg: any) => {
        const $ = (<any>window).jQuery;

        if (!$) {
          return '!!jquery not present!!';
        }

        const result = _arg ? $(element)[_method](_arg) : $(element)[_method]();

        if (result instanceof (<any>window).jQuery) {
          return result.toArray();
        } else {
          return result;
        }
      }, this.element, method, arg);
    };

    const result = this.runWithStaleDetection(() => attempt());

    if (result === '!!jquery not present!!') {
      throw Error('jQuery not present, unable to continue');
    }

    if (Array.isArray(result)) {
      return result.map((webElement: any, i: number) => {
        const elementFinder = ElementFinderSync.fromWebElement_(this.element.browser_, webElement);

        //TODO: clean up
        elementFinder.selectionArgs = {
          rootElement: this,
          method,
          arg
        };
        elementFinder.selectionOrdinal = i;

        return elementFinder;
      });
    } else {
      return result;
    }
  }

  injectjQuery() {
    const jQuery = browserSync.executeScript(() => {
      return !!(<any>window).jQuery;
    });

    if (!jQuery) {
      const jquerySource = fs.readFileSync(path.join(__dirname, '../../../node_modules/jquery/dist/jquery.js'), 'utf8');

      browserSync.executeScript((_jquerySource: string) => {
        /* tslint:disable-next-line:no-eval */
        eval(_jquerySource);

        (<any>window).$.noConflict();
      }, jquerySource);
    }
  }

  closest(selector: string): ElementFinderSync {
    return this.executeJQueryElementMethod('closest', selector)[0];
  }

  hasClass(className: string): boolean {
    return this.runWithStaleDetection(() => exec(this.element.browser_.executeScript((element: HTMLElement, _className: string) => {
      return element.classList.contains(_className);
    }, this.element, className)));
  }

  isFocused(): boolean {
    return this.runWithStaleDetection(() => exec(this.element.browser_.executeScript((element: HTMLElement) => {
      return document.activeElement === element;
    }, this.element)));
  }

  innerHeight(): number {
    return this.executeJQueryElementMethod('innerHeight');
  }

  innerWidth(): number {
    return this.executeJQueryElementMethod('innerWidth');
  }

  is(selector: string): boolean {
    return this.executeJQueryElementMethod('is', selector);
  }

  outerHeight(includeMargin?: boolean) {
    return this.executeJQueryElementMethod('outerHeight', includeMargin);
  }

  outerWidth(includeMargin?: boolean) {
    return this.executeJQueryElementMethod('outerWidth', includeMargin);
  }

  next(selector?: string): ElementFinderSync {
    return this.executeJQueryElementMethod('next', selector)[0];
  }

  offset(): { top: number; left: number } {
    return this.executeJQueryElementMethod('offset');
  }

  parent(selector?: string): ElementFinderSync {
    return this.executeJQueryElementMethod('parent', selector)[0];
  }

  parents(selector?: string): ElementFinderSync[] {
    return this.executeJQueryElementMethod('parents', selector);
  }

  position(): { top: number; left: number } {
    return this.executeJQueryElementMethod('position');
  }

  prev(selector?: string): ElementFinderSync {
    return this.executeJQueryElementMethod('prev', selector)[0];
  }

  prop(name: string): string | number | boolean {
    return this.executeJQueryElementMethod('prop', name);
  }

  sendEnterKey(): ElementFinderSync {
    this.sendKeys(Key.ENTER);

    return this;
  }

  sendTabKey(): ElementFinderSync {
    this.sendKeys(Key.TAB);

    return this;
  }

  scrollLeft(): number {
    return this.executeJQueryElementMethod('scrollLeft');
  }

  scrollTop(): number {
    return this.executeJQueryElementMethod('scrollTop');
  }

  scrollIntoView(): ElementFinderSync {
    this.runWithStaleDetection(() => browserSync.executeScript((element: HTMLElement) => {
      element.scrollIntoView();
    }, this.element));

    return this;
  }

  private runWithStaleDetection<T>(func: () => T): T {
    const attempt: () => T = () => {
      try {
        return func();
      } catch (e) {
        if (e.name === 'StaleElementReferenceError') {
          this.element = this.reselect().getElementFinder();

          return attempt();
        } else {
          throw e;
        }
      }
    };

    return attempt();
  }
}