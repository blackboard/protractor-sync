/* tslint:disable:no-eval */

import * as fs from 'fs';
import * as path from 'path';

import { browserSync } from '../../app/index';

export function injectjQuery() {
  const jQuery = browserSync.executeScript(() => {
    return !!(<any>window).jQuery;
  });

  if (!jQuery) {
    const jquerySource = fs.readFileSync(path.join(__dirname, '../../../../node_modules/jquery/dist/jquery.js'), 'utf8');

    browserSync.executeScript((_jquerySource: string) => {
      eval(_jquerySource);

      (<any>window).$.noConflict();
    }, jquerySource);
  }
}