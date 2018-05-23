import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { ISize, WebElement } from 'selenium-webdriver';

import { ElementFinderSync } from './element-finder-sync';
import { polledWait } from './polled-wait';
import { browserSync } from './vars';

const DEFAULT_BREAKPOINT_WIDTH = 1366;
const DEFAULT_BREAKPOINT_HEIGHT = 1024;

/**
 * Returns the active element on the page
 */
export function getActiveElement(): ElementFinderSync {
  return browserSync.executeScript<ElementFinderSync>(() => {
    return document.activeElement;
  });
}

export function waitForNewWindow(action: Function, waitTimeMs?: number) {
  const handlesBefore = browserSync.getAllWindowHandles();
  let handles: string[];

  action();

  waitFor(() => {
    handles = browserSync.getAllWindowHandles();

    return handles.length === handlesBefore.length + 1;
  }, waitTimeMs);

  const newWindowHandle = handles[handles.length - 1];

  browserSync.switchTo().window(newWindowHandle);

  waitFor(() => {
    return browserSync.getCurrentUrl() !== '';
  }, waitTimeMs);
}

/**
 * Takes a screenshot and saves a .png file in the configured screenshot directory.
 *
 * @param filename The name of the file to save
 */
export function takeScreenshot(filename: string) {
  if (filename) {
    const basePath = path.dirname(filename);
    if (!fs.existsSync(basePath)) {
      mkdirp.sync(basePath);
    }

    if (!(/\.png$/i).test(filename)) {
      filename += '.png';
    }
  }

  const base64png = browserSync.takeScreenshot();

  if (filename) {
    fs.writeFileSync(filename, base64png, 'base64');
  }

  return base64png;
}

function calculateDimension(dimension: number, window: number, viewport: number) {
  return dimension + (window - viewport);
}

export function resizeViewport(size: { width?: number; height?: number; }) {
  const windowSize = browserSync.manage().window().getSize();
  const viewportSize = browserSync.executeScript<ISize>(() => {
    return {
      height: window.document.documentElement.clientHeight,
      width: window.document.documentElement.clientWidth
    };
  });

  const calcWidth = (width: number) => calculateDimension(width, windowSize.width, viewportSize.width);
  const calcHeight = (height: number) => calculateDimension(height, windowSize.height, viewportSize.height);

  let width = windowSize.width;
  let height = windowSize.height;

  if (size) {
    width = calcWidth(size.width || DEFAULT_BREAKPOINT_WIDTH);
    height = calcHeight(size.height || DEFAULT_BREAKPOINT_HEIGHT);
  } else if (windowSize.width < DEFAULT_BREAKPOINT_WIDTH) {
    width = calcWidth(DEFAULT_BREAKPOINT_WIDTH);
  } else {
    // No size set and width is wider than the minimum.  We can return early without resizing the browser
    return;
  }

  browserSync.manage().window().setSize(width, height);
}

export const disallowExpect = (() => {
  const ALLOWED_LOCATIONS = ['node_modules', 'protractor_sync.'];

  function disableMethod(object: any, method: string, extraInfo?: string) {
    if (object[method] == null) {
      throw new Error('Cannot disable ' + method + '(). It does not exist');
    }

    const original = object[method];
    object[method] = function() {
      // We don't want to block access from protractor or selenium or the current file
      const stack = (<any>new Error()).stack;

      //First line is the error message, second line is where the error was created, third line is the caller
      const secondFrame = stack.split('\n')[2];

      if (ALLOWED_LOCATIONS.every(location => secondFrame.indexOf(location) < 0)) {
        throw new Error(method + '() has been disabled in this project! ' + (extraInfo || ''));
      } else {
        return original.apply(this, arguments);
      }
    };
  }

  return () => {
    const EXPECT_ADVICE = 'Use polledExpect instead of expect.';

    disableMethod(global, 'expect', EXPECT_ADVICE);
  };
})();

export function waitFor<T>(condition: () => boolean | {data: T, keepPolling: boolean}, waitTimeMs?: number): T {
  return polledWait(() => {
    const result = condition();

    if (typeof result === 'boolean') {
      return { data: <any>null, keepPolling: !result };
    } else {
      return result;
    }
  }, null, waitTimeMs);
}

function deepCloneAndTransform(obj: any, transformer: (val: any) => any): any {
  if (obj == null) {
    return transformer(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepCloneAndTransform(item, transformer));
  } else if (obj.constructor === Object || obj.constructor == null) {
    // Plain object
    return Object.keys(obj).reduce((clone, key) => {
      clone[key] = deepCloneAndTransform(obj[key], transformer);

      return clone;
    }, Object.create(null));
  } else {
    return transformer(obj);
  }
}

export function transformElementFinderSyncToWebElementIn(obj: any): any {
  return deepCloneAndTransform(obj, (arg) => {
    if (arg instanceof ElementFinderSync) {
      return arg.getWebElement();
    } else {
      return arg;
    }
  });
}

export function transformWebElementToElementFinderSyncIn(obj: any): any {
  return deepCloneAndTransform(obj, (arg) => {
    if (arg instanceof WebElement) {
      return ElementFinderSync.fromWebElement_(browserSync.getBrowser(), arg);
    } else {
      return arg;
    }
  });
}