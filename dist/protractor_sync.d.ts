/// <reference path="../../../node_modules/node-shared-typescript-defs/angular-protractor-sync/angular-protractor-sync.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/asyncblock/asyncblock.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/node/node.d.ts" />
declare module "protractor_sync" {
    var IMPLICIT_WAIT_MS: number;
    var RETRY_INTERVAL: number;
    /**
     * Apply synchronous patches to protractor
     */
    function patch(): void;
    var disallowMethods: () => void;
    function injectjQuery(): void;
    function waitForNewWindow(action: Function, waitTimeMs?: number): void;
}
