/// <reference path="../../../node_modules/node-shared-typescript-defs/angular-protractor-sync/angular-protractor-sync.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/asyncblock/asyncblock.d.ts" />
/// <reference path="../../../node_modules/node-shared-typescript-defs/node/node.d.ts" />
export declare var IMPLICIT_WAIT_MS: number;
export declare var RETRY_INTERVAL: number;
/**
 * Apply synchronous patches to protractor
 */
export declare function patch(): void;
export declare var disallowMethods: () => void;
export declare function injectjQuery(): void;
