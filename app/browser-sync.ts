import * as ab from 'asyncblock';
import { ProtractorBrowser } from 'protractor';
import { ILocation, ISize, IWebDriverOptionsCookie, Options, TargetLocator, Window } from 'selenium-webdriver';

import { exec } from './exec';
import { polledWait } from './polled-wait';

export class BrowserSync {
  private readonly PAUSE_DEBUGGER_DELAY_MS = 500;

  constructor(private browser: ProtractorBrowser) {

  }

  getBrowser() {
    return this.browser;
  }

  executeScript<T>(script: string | Function, ...varArgs: any[]): T {
    return exec(this.browser.executeScript.apply(this.browser, arguments));
  }

  executeAsyncScript<T>(script: string | Function, ...varArgs: any[]): T {
    return exec(this.browser.executeAsyncScript.apply(this.browser, arguments));
  }

  get(destination: string, timeout?: number) {
    return exec(this.browser.get(destination, timeout));
  }

  getAllWindowHandles(): string[] {
    return exec(this.browser.getAllWindowHandles());
  }

  getWindowHandle(): string {
    return exec(this.browser.getWindowHandle());
  }

  getCurrentUrl(): string {
    return exec(this.browser.getCurrentUrl());
  }

  close() {
    return exec(this.browser.close());
  }

  quit() {
    return exec(this.browser.quit());
  }

  switchTo() {
    return new TargetLocatorSync(this.browser.switchTo());
  }

  manage() {
    return new OptionsSync(this.browser.manage());
  }

  takeScreenshot(): string {
    return exec(this.browser.takeScreenshot());
  }

  pause(): any {
    const result = this.browser.pause();

    const flow = ab.getCurrentFlow();
    if (flow) {
      //Sometimes pause and debugger don't work without a delay before executing the next command
      flow.sync(setTimeout(flow.add(), this.PAUSE_DEBUGGER_DELAY_MS));
    }

    return result;
  }

  debugger(): any {
    const result = this.browser.debugger();

    const flow = ab.getCurrentFlow();
    if (flow) {
      //Sometimes pause and debugger don't work without a delay before executing the next command
      flow.sync(setTimeout(flow.add(), this.PAUSE_DEBUGGER_DELAY_MS));
    }

    return result;
  }
}

export class TargetLocatorSync {
  constructor(private targetLocator: TargetLocator) {

  }

  window(nameOrHandle: string): void {
    exec(this.targetLocator.window(nameOrHandle));
  }

  defaultContent() {
    exec(this.targetLocator.defaultContent());
  }
}

export class OptionsSync {
  constructor(private options: Options) {

  }

  addCookie(name: string, value: string, optPath?: string, optDomain?: string, optIsSecure?: boolean, optExpiry?: number | Date) {
    exec(this.options.addCookie(name, value, optPath, optDomain, optIsSecure, optExpiry));
  }

  deleteAllCookies() {
    exec(this.options.deleteAllCookies());
  }

  deleteCookie(name: string) {
    exec(this.options.deleteCookie(name));
  }

  getCookies(): IWebDriverOptionsCookie[] {
    return exec(this.options.getCookies());
  }

  getCookie(name: string): IWebDriverOptionsCookie {
    return exec(this.options.getCookie(name));
  }

  window(): WindowSync {
    return new WindowSync(this.options.window());
  }
}

export class WindowSync {
  constructor(private window: Window) {

  }

  getPosition(): ILocation {
    return exec(this.window.getPosition());
  }

  setPosition(x: number, y: number) {
    exec(this.window.setPosition(x, y));
  }

  getSize(): ISize {
    return exec(this.window.getSize());
  }

  setSize(width: number, height: number) {
    exec(this.window.setSize(width, height));
  }

  maximize() {
    exec(this.window.maximize());
  }
}