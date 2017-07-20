# What is this?

Protractor-sync builds on protractor and provides:

* Synchronous-style test writing (using fibers, behind the scenes)
* Polling mechanisms for testing asynchronous apps (polledExpect, elementFinderSync.waitUntil & .waitUntilRemoved, waitFor)
* JQuery methods such as `hasClass`, `closest`, and `is`
* Automatic stale element re-selection (if a stale element is encountered, try to re-select it based on its original selector)
* Automatic blocked click retrying
* Chaining (e.g. `elementFinder.clear().sendKeys('text')``)
* Allows 'try/catch' syntax for straightforward error handling

# Installation

Pre-reqs:

* Protractor (or something like grunt-protractor-runner, which includes it)
* asyncblock (`npm install asyncblock`)
* jasmine (Comes with protractor. Other frameworks can be used, but some features only work with jasmine)

`npm install protractor-sync`
* Update webdriver (`grunt shell:webdriverUpdate`)

# Examples

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

# API

## elementSync

* **findVisible(locator | selector)** - Finds a single visible element on the page. If more than one visible element matches the selector,
  an error is thrown. If no visible elements match the selector, an error is thrown. Implicitly waits until there is exactly one
  visible element. (Errors will only be thrown after timeout.)
* **findVisibles(locator | selector)** - Finds multiple visible elements on the page. If no visible elements match the selector, an error is thrown.
  Implicitly waits until at least one visible element is found. (Errors will only be thrown after timeout.)
* **findElement(locator | selector)** - Finds a single element on the page. If no elements match the selector, an error is thrown.
  Implicitly waits until exactly one element is found. (Errors will only be thrown after timeout.)
* **findElements(locator | selector)** - Finds multiple elements on the page. If no elements match the selector, an error is thrown.
  Implicitly waits until at least one element is found. (Errors will only be thrown after timeout.)
* **assertElementDoesNotExist(locator | selector)** - Asserts that no elements matching the selector exist on the page. If an element matching
  the selector is found, an error is thrown. Implicitly waits until no elements matching the selector are found. (Errors will only be thrown after timeout.)

## ElementFinderSync (instance methods on element)

* **findVisible(locator | selector)** - Finds a single visible instance of an element within this element. If more than one visible element matches the selector,
  an error is thrown. If no visible elements match the selector, an error is thrown. Implicitly waits until there is exactly one visible element.
  (Errors will only be thrown after timeout.)
* **findVisibles(locator | selector)** - Finds multiple visible elements within this element. If no visible elements match the selector, an error is thrown.
  Implicitly waits until at least one visible element is found. (Errors will only be thrown after timeout.)
* **findElement(locator | selector)** - Finds a single element within this element. If no elements match the selector, an error is thrown.
  Implicitly waits until exactly one element is found. (Errors will only be thrown after timeout.)
* **findElements(locator | selector)** - Finds multiple elements within this element. If no elements match the selector, an error is thrown.
  Implicitly waits until at least one element is found. (Errors will only be thrown after timeout.)
* **assertElementDoesNotExist(locator | selector)** - Asserts that no elements matching the selector exist within this element. If an element matching
  the selector is found, an error is thrown. Implicitly waits until no elements matching the selector are found. (Errors will only be thrown after timeout.)
* **waitUntil(condition)** - Waits until the condition is true (or times out if it doesn't become true before the implicit wait interval).
  The condition can be any JQuery selector, for example: `.ready`, `:not(.ready)`, `:focus`, `:visible`, `:enabled`
* **waitUntilRemoved()** - Waits until this element is removed from the DOM. If it is not removed from the DOM before the implicit wait interval,
  an error will be thrown.
* **closest(selector)** - Examines the current element and ancestor elements, and returns the first one which matches the selector.
* **hasClass(class)** - Determines whether the current element contains the specified class or not.
* **innerHeight()** - Get the computed inner height (including padding but not border) of the current element.
* **innerWidth()** - Get the computed inner width (including padding but not border) of the current element.
* **is(selector)** - Check the current element against a selector, return true if it matches the selector.
* **outerHeight()** - Get the computed height for the current element, including padding, border, and optionally margin.
* **outerWidth()** - Get the computed width for the current element, including padding, border, and optionally margin.
* **next(selector?)** - Get the immediately following sibling of the current element, optionally filtered by a selector.
* **offset()** - Get the coordinates of the current element relative to the document.
* **parent(selector?)** - Get the parent of the current element, optionally filtered by a selector.
* **parents(selector?)** - Get the ancestors of the current element, optionally filtered by a selector.
* **position()** - Get the coordinates of the current element, relative to the offset parent.
* **prev(selector?)** - Get the immediately preceding sibling of the current element, optionally filtered by a selector.
* **prop(name)** - Get the value of a property for the current element.
* **scrollLeft()** - Get the horizontal position of the scroll bar for the current element.
* **scrollTop()** - Get the vertical position of the scroll bar for the current element.
* **scrollIntoView()** - Scroll the page such that the top of the current element is at the top of the visible page.
* **getSelectionPath()** - Retrieves information about how the element was selected

## browserSync

Wraps the `browser` object from protractor and synchronizes the following methods.

* **executeScript(script, ...args)** - Executes the specified synchronous javascript in the browser.
* **executeAsyncScript(script, ...args)** - Executes the specified async javascript in the browser.
* **get(destination, timeoutMs)** - Loads the specified URL in the browser.
* **getAllWindowHandles()** - Returns handles for all open browser windows.
* **getWindowHandle()** - Returns the handle for the currently focused window.
* **getCurrentUrl()** - Gets the URL of the currently focused window.
* **close()** - Closes the current browser window.
* **quit()** - Quits the current browser session.
* **switchTo()** - Returns a TargetLocatorSync instance which can be used to focus other browser windows.
* **manage()** - Returns an OptionsSync instance which can be used to manage cookies.
* **takeScreenshot()** - Takes a screenshot.
* **pause()** - Pauses the current control flow.
* **debugger()** - Pauses the current control flow and allows debugging to occur in the browser.

## protractor-sync

* **disallowExpect()** - Prevents jasmine's expect from being used (in favor of `polledExpect`)
* **waitForNewWindow(action, waitTimeMs)** - Executes the action function, then waits for a new popup window to appear.
  The current window will be switched to the new window when it opens. Times out after waitTimeMs milliseconds.
* **polledExpect(func, waitTimeMs?)** - Works like jasmine's "expect", but retries the function until it passes or times out.
* **takeScreenshot(filename)** - Takes a screenshot and saves a .png file at the specified file path.
* **resizeViewport(size: { width?: number; height?: number; })** - Resize the viewport (not the window) to the specified size.
* **waitFor(condition, waitTimeMS?)** - Waits for the condition function to return a truthy value. An exception will be raised if it times out.
* **configure(options)** - Allows configuration options to be specified
    * **implicitWaitMs** - The amount of time to wait before timing out operations which wait implicitly. Note: An implicit wait SHOULD NOT be set in selenium/protractor. Use this value instead. Default: 5 seconds.
    * **retryIntervalMs** - The amount of time to wait before retrying operations which wait. Default: 10ms.
    * **clickRetryIntervalMs** - The amount of time to wait before attempting to re-click a blocked element. Default: 200ms.
    * **autoReselectStaleElements** - A boolean value indicating whether stale elements should be automatically re-selected or not.
    * **autoRetryClick** - A boolean value indicating whether protractor-sync should attempt to automatically retry blocked clicks or not.
    
# Tips

* Do not set an implicit wait in protractor/selenium. Set an implicit wait time using protractorSync.configure instead.
* Turn off protractor synchronization (browser.ignoreSynchronization = true;) for faster tests. You can also enable/disable it during portions of tests.
* Always use findVisible, except for special situations where you want to select a hidden element.
* If you must manually pass a waitTimeMS, set it as a multiple of the implicitWaitTimeMs so it will scale on slower machines.

# Build tasks

* `npm start` - Builds the code and watches for changes
* `npm test` - Builds the code, runs the linter and runs the test suite
* `npm publish` - Publish a new version to NPM

This project will automatically build, lint and test when pushing code to a remote repository.

# How to publish a new version to NPM

* Checkout/pull develop
* Verify the version in package.json is set to the correct version for this release, if not increment and commit it
    * This should normally be completed at the end of the publishing steps
* Create a tag, for example: `git tag v1.0.1; git push --tags`
* `npm login` with the *blackboard* NPM account
* Run `npm publish`
* Check npmjs.com to verify the publish was successful
* Increment version # in package.json (use semantic versioning) and commit