import * as ab from 'asyncblock';
import { ProtractorBrowser, Runner } from 'protractor';
import { ILocation, ISize, IWebDriverOptionsCookie, Options, TargetLocator, Window } from 'selenium-webdriver';

import { ElementFinderSync } from './element-finder-sync';
import { exec } from './exec';

export class BrowserSync {
  private readonly PAUSE_DEBUGGER_DELAY_MS = 500;

  constructor(private _getBrowser: () => ProtractorBrowser) {

  }

  getBrowser() {
    return this._getBrowser();
  }

  executeScript<T>(script: string | Function, ...varArgs: any[]): T {
    return exec(this.getBrowser().executeScript.apply(this.getBrowser(), arguments));
  }

  executeAsyncScript<T>(script: string | Function, ...varArgs: any[]): T {
    return exec(this.getBrowser().executeAsyncScript.apply(this.getBrowser(), arguments));
  }

  get(destination: string, timeout?: number) {
    return exec(this.getBrowser().get(destination, timeout));
  }

  getAllWindowHandles(): string[] {
    return exec(this.getBrowser().getAllWindowHandles());
  }

  getWindowHandle(): string {
    return exec(this.getBrowser().getWindowHandle());
  }

  getCurrentUrl(): string {
    return exec(this.getBrowser().getCurrentUrl());
  }

  close() {
    return exec(this.getBrowser().close());
  }

  quit() {
    return exec(this.getBrowser().quit());
  }

  actions() {
    return exec(this.getBrowser().actions());
  }

  switchTo() {
    return new TargetLocatorSync(this.getBrowser().switchTo());
  }

  manage() {
    return new OptionsSync(this.getBrowser().manage());
  }

  takeScreenshot(): string {
    return exec(this.getBrowser().takeScreenshot());
  }

  pause(): any {
    const result = this.getBrowser().pause();

    const flow = ab.getCurrentFlow();
    if (flow) {
      //Sometimes pause and debugger don't work without a delay before executing the next command
      flow.sync(setTimeout(flow.add(), this.PAUSE_DEBUGGER_DELAY_MS));
    }

    return result;
  }

  debugger(): any {
    const result = this.getBrowser().debugger();

    const flow = ab.getCurrentFlow();
    if (flow) {
      //Sometimes pause and debugger don't work without a delay before executing the next command
      flow.sync(setTimeout(flow.add(), this.PAUSE_DEBUGGER_DELAY_MS));
    }

    return result;
  }

  forkAndSwitchToNewDriverInstance(useSameUrl?: boolean, copyMockModules?: boolean, copyConfigUpdates?: boolean) {
    const newBrowser = this.getBrowser().forkNewDriverInstance(useSameUrl, copyMockModules, copyConfigUpdates);

    const waitForAngularEnabled = this.waitForAngularEnabled();

    //Use the runner class to reset global variables after spawning the new instance
    const runner = new Runner(this.getProcessedConfig());
    runner.setupGlobals_(newBrowser);

    //By default the new browser will wait for angular, so we need to manually carry over the setting
    newBrowser.waitForAngularEnabled(waitForAngularEnabled);

    return this;
  }

  getProcessedConfig() {
    return exec(this.getBrowser().getProcessedConfig());
  }

  waitForAngularEnabled(enabled?: boolean) {
    return exec(this.getBrowser().waitForAngularEnabled(enabled));
  }
}

export class TargetLocatorSync {
  constructor(private targetLocator: TargetLocator) {

  }

  window(nameOrHandle: string): void {
    exec(this.targetLocator.window(nameOrHandle));
  }

  frame(frameElement: ElementFinderSync): void {
    exec(this.targetLocator.frame(frameElement.getElementFinder().getWebElement()));
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