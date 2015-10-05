/// <reference path="../../../node_modules/node-shared-typescript-defs/angular-protractor-sync/angular-protractor-sync.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/asyncblock/asyncblock.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/node/node.d.ts" />
declare module "protractor_sync" {
    var IMPLICIT_WAIT_MS: number;
    var RETRY_INTERVAL: number;
    var autoReselectStaleElements: boolean;

    var LARGE_BREAKPOINT_WIDTH: number;
    var MEDIUM_BREAKPOINT_WIDTH: number;
    var SMALL_BREAKPOINT_WIDTH: number;

    var DEFAULT_BREAKPOINT_WIDTH: number;
    var DEFAULT_BREAKPOINT_HEIGHT: number;

    /**
     * Apply synchronous patches to protractor
     */
    function patch(): void;
    var disallowMethods: () => void;
    function injectjQuery(): void;
    function waitForNewWindow(action: Function, waitTimeMs?: number): void;

    function takeScreenshot(filename: string): void;
    function resizeViewport(size: { width?: number; height?: number; }, callback: Function): void;
}
