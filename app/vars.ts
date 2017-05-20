import {BrowserSync} from './browser-sync';
import {assertElementDoesNotExist, findElement, findElements, findVisible, findVisibles} from './selection';
import {getActiveElement} from './utility';
import { ElementFinderSync } from './element-finder-sync';

export const browserSync = new BrowserSync((global as any).browser);

export const elementSync = {
  findVisible,
  findVisibles,

  findElement,
  findElements,

  assertElementDoesNotExist,

  getActiveElement
};