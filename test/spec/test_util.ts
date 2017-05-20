import * as fs from 'fs';
import * as path from 'path';

import { browserSync } from '../../app/index';

export function injectjQuery() {
  var jQuery = browserSync.executeScript(function() {
    return !!(<any>window).jQuery;
  });

  if (!jQuery) {
    var jquerySource = fs.readFileSync(path.join(__dirname, '../../../../node_modules/jquery/dist/jquery.js'), 'utf8');

    browserSync.executeScript((jquerySource: string) => {
      eval(jquerySource);

      (<any>window).$.noConflict();
    }, jquerySource);
  }
}