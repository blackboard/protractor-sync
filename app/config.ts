export let IMPLICIT_WAIT_MS = 5000;
export let RETRY_INTERVAL = 10;

export let LARGE_BREAKPOINT_WIDTH = 1366;
export let MEDIUM_BREAKPOINT_WIDTH = 768;
// Ideally we'd like the small breakpoint to be 320px to mimic older smart phones.  We've found that this has not been practical (chrome
// on mac will set a minimum with of around 400px if you go lower than that, and chrome on linux stops showing the window all together if
// you go below the minimum).  550px currently works on the build server, so until we find a work-around, we'll stick with that.
export let SMALL_BREAKPOINT_WIDTH = 550;

export let CLICK_RETRY_INTERVAL = 200;

export let autoReselectStaleElements = true;
export let autoRetryClick = true;

export function configure(args: { implicitWaitMs: number }) {
  IMPLICIT_WAIT_MS = args.implicitWaitMs || IMPLICIT_WAIT_MS;
}
