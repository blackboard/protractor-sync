import * as ab from 'asyncblock';

import { implicitWaitMs, retryIntervalMs } from './config';

/**
 * Executes a function repeatedly until it returns a value other than undefined. Waits RETRY_INTERVAL ms between function calls.
 *
 * @param fn The function to execute repeatedly
 * @param onTimeout An optional function to call when fn doesn't return a defined value before IMPLICIT_WAIT_MS.
 *                  If this is not specified then a generic exception will be raised.
 * @param waitTimeMs Override the amount of time to wait before timing out
 * @returns {any} The last value the function returned, as long as it did not time out
 */
export function polledWait(
  fn: () => { keepPolling: boolean; data: any; },
  onTimeout?: (data: any) => void,
  waitTimeMs?: number
) {
  const startTime = new Date();
  const timeout = waitTimeMs != null ? waitTimeMs : implicitWaitMs;
  let result: any;
  const flow = ab.getCurrentFlow();

  while (true) {
    if (result == null || new Date().getTime() - startTime.getTime() < timeout) {
      result = fn();

      if (result.keepPolling) {
        flow.sync(setTimeout(flow.add(), retryIntervalMs)); //Wait a bit before checking again
      } else {
        break;
      }
    } else {
      if (onTimeout) {
        onTimeout(result.data);
        break;
      } else {
        throw new Error('Timed out(' + timeout + ') waiting for function: ' + (<any>fn).name);
      }
    }
  }

  return result.data;
}