import * as ab from 'asyncblock';
import { ElementFinder } from 'protractor';
import { ElementFinderSync } from './element-finder-sync';

export function exec(obj: any) {
  if (obj.then) {
    var flow = ab.getCurrentFlow();
    var cb = flow.add();

    return flow.sync(obj.then(function (result: any) {
      if (result instanceof ElementFinder) {
        result = new ElementFinderSync(result);
      }

      cb(null, result);
    }, function (err: any) {
      cb(err);
    }));
  } else {
    return obj;
  }
}