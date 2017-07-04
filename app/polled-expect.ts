import * as ab from 'asyncblock';
import { implicitWaitMs, retryIntervalMs } from './config';
import { exec } from './exec';

export function polledExpect(func: Function, waitTimeMS?: number) {
  const timeout = waitTimeMS || implicitWaitMs;
  const startTime = new Date().getTime();
  const matchers = Object.create(null);
  const flow = ab.getCurrentFlow();
  const originalContext = new Error();
  let isNot = false;
  let matcherCalled = false;

  setTimeout(() => {
    if (!matcherCalled) {
      originalContext.message = 'polledExpect() was called without calling a matcher';
      console.error((<any>originalContext).stack);

      //There's no way to fail the current test because the afterEach has already run by this point
      //Exiting the process is the only way to guarantee a developer will notice the problem
      process.exit(1);
    }
  });

  Object.keys((<any>jasmine).matchers).forEach(key => {
    matchers[key] = (expected: any) => {
      matcherCalled = true;
      let passed = false;

      do {
        const actual = exec(func());
        const result = (<any>jasmine).matchers[key]((<any>jasmine).matchersUtil, null).compare(actual, expected);
        passed = result.pass;

        if (isNot) {
          passed = !passed;
        }

        if (!passed) {
          if (new Date().getTime() - startTime <= timeout) {
            setTimeout(flow.add(), retryIntervalMs);
          } else {
            let message = result.message;

            if (!message) {
              message = (<any>jasmine).matchersUtil.buildFailureMessage(key, isNot, actual, expected);
            }

            throw new Error(message);
          }
        }
      } while (!passed);
    };
  });

  Object.defineProperty(matchers, 'not', {
    get: () => {
      isNot = true;

      return matchers;
    }
  });

  return matchers;
}

//Expose global variable so callers can call "polledExpect" similar to just calling "expect"
(global as any).polledExpect = polledExpect;