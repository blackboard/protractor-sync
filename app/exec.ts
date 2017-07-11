import * as ab from 'asyncblock';
import { ElementFinder } from 'protractor';
import { ElementFinderSync } from './element-finder-sync';

export function exec(obj: any) {
  if (obj.then) {
    const flow = ab.getCurrentFlow();

    if (flow == null) {
      throw new Error('Could not find the current asyncblock flow. Please make sure this method is called from an asyncblock context.');
    }

    const cb = flow.add();

    return flow.sync(obj.then((result: any) => {
      if (result instanceof ElementFinder) {
        result = new ElementFinderSync(result);
      }

      cb(null, result);
    }, (err: any) => {
      cb(err);
    }));
  } else {
    return obj;
  }
}