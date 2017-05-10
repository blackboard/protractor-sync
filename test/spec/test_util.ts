import fs = require('fs');
import path = require('path');

export function injectjQuery() {
  var jQuery = browser.executeScript(function() {
    return !!(<any>window).jQuery;
  });

  if (!jQuery) {
    var jquerySource = fs.readFileSync(path.join(__dirname, '../../../../node_modules/jquery/dist/jquery.js'), 'utf8');

    browser.executeScript((jquerySource: string) => {
      eval(jquerySource);

      (<any>window).$.noConflict();
    }, jquerySource);
  }
}