import { BrowserSync} from './browser-sync';
import { ElementFinderSync } from './element-finder-sync';
import { assertElementDoesNotExist, findElement, findElements, findVisible, findVisibles } from './selection';
import { getActiveElement} from './utility';

export const browserSync = new BrowserSync((global as any).browser);

export const elementSync = {
  findVisible,
  findVisibles,

  findElement,
  findElements,

  assertElementDoesNotExist,

  getActiveElement
};

(() => ElementFinderSync)(); //prevent compiler error