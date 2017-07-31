# What is this?

Protractor-sync builds on Protractor and provides:

* Synchronous-style test writing (using fibers, behind the scenes)
* Polling mechanisms for testing asynchronous apps (polledExpect, elementFinderSync.waitUntil & .waitUntilRemoved, waitFor)
* JQuery methods such as `hasClass`, `closest`, and `is`
* Automatic stale element re-selection (if a stale element is encountered, try to re-select it based on its original selector)
* Automatic blocked click retrying (if another element would receive the click, keep retrying until timeout expires)
* Chaining (e.g. `myElement.clear().sendKeys('text')`)
* Allows 'try/catch' syntax for straightforward error handling

# Installation

Pre-reqs:

* Protractor (or something like grunt-protractor-runner, which includes it)
* asyncblock (`npm install asyncblock`)
* Jasmine (Comes with Protractor. Other frameworks can be used, but some features only work with Jasmine)

Installation steps:

1. `npm install protractor-sync`
1. Update webdriver (`grunt shell:webdriverUpdate`)

# Example

```
import { browserSync, elementSync, polledExpect } from 'protractor-sync';

describe('The date field', () => {

    it('should set a new date', () => {

        var settings = elementSync.findVisible('.settings'); //Finds exactly one visible element with a class of "settings"
        settings.findVisible('input.start-date').clear().sendKeys('1/1/2000');
        settings.findVisible('.save').scrollIntoView().click();
    
        settings.waitUntilRemoved();
        
        polledExpect(function() { return element.findVisible('div.start-date').getText(); }).toEqual('1/1/2000');
        //With ES6/Typescript: polledExpect(() => element.findVisible('div.start-date').getText()).toEqual('1/1/2000');
    });

});
```

See test/spec/protractor-sync_test.ts for more examples.

# How to contribute
 
Thanks you for your interest in Protractor-sync.  In lieu of a formal style guide, take care to maintain the existing coding style. Please add tests for any new or changed functionality.

# API

See API.md

# Tips

* Do not set an implicit wait in Protractor/selenium. Set an implicit wait time using protractorSync.configure instead.
* Turn off Protractor synchronization (`browserSync.getBrowser().waitForAngularEnabled(false);`) for faster tests. You can also enable/disable it during portions of tests.
* Always use `findVisible`, except for special situations where you want to select a hidden element.
* If you must manually pass a waitTimeMS, set it as a multiple of the implicitWaitTimeMs so it will scale on slower machines.

# Build tasks

* `npm start` - Builds the code and watches for changes
* `npm test` - Builds the code, runs the linter and runs the test suite
* `npm publish` - Publish a new version to NPM

This project will automatically build, lint and test when pushing code to a remote repository.