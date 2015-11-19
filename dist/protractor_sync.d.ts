/// <reference path="../../../node_modules/node-shared-typescript-defs/angular-protractor-sync/angular-protractor-sync.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/asyncblock/asyncblock.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/mkdirp/mkdirp.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/node/node.d.ts" />
declare module "protractor_sync" {
    var IMPLICIT_WAIT_MS: number;
    var RETRY_INTERVAL: number;
    var LARGE_BREAKPOINT_WIDTH: number;
    var MEDIUM_BREAKPOINT_WIDTH: number;
    var SMALL_BREAKPOINT_WIDTH: number;
    var DEFAULT_BREAKPOINT_WIDTH: number;
    var DEFAULT_BREAKPOINT_HEIGHT: number;
    var CLICK_RETRY_INTERVAL: number;
    var autoReselectStaleElements: boolean;
    var autoRetryClick: boolean;
    /**
     * Apply synchronous patches to protractor
     */
    function patch(): void;
    var disallowMethods: (options?: {
        expect: boolean;
    }) => void;
    function injectjQuery(): void;
    function waitForNewWindow(action: Function, waitTimeMs?: number): void;
    function polledExpect(func: Function, waitTimeMS?: number): any;
    /**
     * Takes a screenshot and saves a .png file in the configured screenshot directory.
     *
     * @param filename The name of the file to save
     */
    function takeScreenshot(filename: string): any;
    function resizeViewport(size: {
        width?: number;
        height?: number;
    }): void;
}
