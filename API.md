Detailed API for Protractor-sync

# elementSync
Provides finder methods that will locate any element on the page that meets the given parameters.
Each of these methods returns an instance of ElementFinderSync.

Simple example usage:
````
import {elementSync} from 'protractor-sync';
elementSync.findVisible('#my-id');
````

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
* **getActiveElement()** - Returns the current active element on the page

# ElementFinderSync

Wraps the `ElementFinder` class from Protractor and provides:

## Finder Methods
Same as with `elementSync`, except note that these find elements _descended from_ the current element.

Simple example usage:
````
import {elementSync} from 'protractor-sync';
let myRootElement = elementSync.findVisible('#my-id');
let childElement = myRootElement.findVisible('.some-child-element');
````
* **findVisible(locator | selector)** - Finds a single visible instance of an element descended from this element. If more than one visible element matches the selector,
  an error is thrown. If no visible elements match the selector, an error is thrown. Implicitly waits until there is exactly one visible element.
  (Errors will only be thrown after timeout.)
* **findVisibles(locator | selector)** - Finds multiple visible elements descended from this element. If no visible elements match the selector, an error is thrown.
  Implicitly waits until at least one visible element is found. (Errors will only be thrown after timeout.)
* **findElement(locator | selector)** - Finds a single element descended from this element. If no elements match the selector, an error is thrown.
  Implicitly waits until exactly one element is found. (Errors will only be thrown after timeout.)
* **findElements(locator | selector)** - Finds multiple elements descended from this element. If no elements match the selector, an error is thrown.
  Implicitly waits until at least one element is found. (Errors will only be thrown after timeout.)
* **assertElementDoesNotExist(locator | selector)** - Asserts that no elements matching the selector exist as descendants of this element. If an element matching
  the selector is found, an error is thrown. Implicitly waits until no elements matching the selector are found. (Errors will only be thrown after timeout.)

## Waiting Methods
Simple example usage:
````
myRootElement.waitUntil(':visible');
````
* **waitUntil(condition)** - Waits until the condition is true (or times out if it doesn't become true before the implicit wait interval).
  The condition can be any JQuery selector, for example: `.ready`, `:not(.ready)`, `:focus`, `:visible`, `:enabled`
* **waitUntilRemoved()** - Waits until this element is removed from the DOM. If it is not removed from the DOM before the implicit wait interval,
  an error will be thrown.

## JQuery
Simple example usage:
````
let isRed = myRootElement.hasClass('red');
````
* **executeJQueryElementMethod** - Use it to execute any JQuery method not specifically called out below
* **injectjQuery** - Inject JQuery if it isn't already present
* **closest(selector)** - Examines the current element and ancestor elements, and returns the first one which matches the selector.
* **hasClass(class)** - Determines whether the current element contains the specified class or not.
* **innerHeight()** - Get the computed inner height (including padding but not border) of the current element.
* **innerWidth()** - Get the computed inner width (including padding but not border) of the current element.
* **is(selector)** - Check the current element against a selector, return true if it matches the selector.
* **isFocused()** - Returns whether this element is the current active element on the page
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

## Wrappers Around Protractor's `ElementFinder` Methods
These methods work like their ElementFinder counterparts in Protractor, but they execute synchronously and optionally use stale element reselection when appropriate (options can be changed by calling config; see below).

Simple example usage:
````
let text = myRootElement.getText();
````
* **isPresent()**
* **evaluate(expression)**
* **allowAnimations(boolean)**
* **isElementPresent(subLocator)**
* **click()** - if the click is blocked by another element, optionally it can automatically retry the click until it becomes unblocked or the timeout expires (option is on by default)
* **sendKeys(keys)**
* **getTagName()**
* **getCssValue(cssPropertyName)**
* **getAttribute(attributeName)**
* **getText()**
* **getSize()**
* **getLocation()**
* **getWebElement()**
* **isEnabled()**
* **isSelected()**
* **submit()**
* **clear()**
* **isDisplayed()**
* **takeScreenshot()**
* **getId()**

## Extras Unique to ElementFinderSync
Simple example usage:
````
myRootElement.sendEnterKey();
````
* **getElementFinder()** - Returns the instance of Protractor's ElementFinder that this ElementFinderSync is wrapping.
Once you have this, you can call Protractor methods on it as usual, but doing so is not recommended except in special cases.
The recommended approach is to call the equivalent Protractor-sync method on the ElementFinderSync object.
* **getInnerHtml()** - Returns this element's innerHTML
* **getOuterHtml()** - Returns this element's outerHTML
* **getSelectionPath()** - Retrieves information about how the element was selected
* **reselect()** - Attempt to select this element again using the original selection path. Mainly used in automatic reselection.
* **scrollIntoView()** - Scroll the page such that the top of the current element is at the top of the visible page.
* **sendEnter()** - Convenience method to send the ENTER key to this element
* **sendTabKey()** - Convenience method to send the TAB key to this element

# browserSync

Wraps the `browser` object from Protractor and provides:

## Wrappers Around Protractor's `browser` Methods
These methods work like their counterparts in Protractor, but they execute synchronously.
Simple example usage:
````
import {browserSync} from 'protractor-sync';
browserSync.pause();
````
* **actions()** - Creates a sequence of user actions
* **executeScript(script, ...args)** - Executes the specified synchronous javascript in the browser.
* **executeAsyncScript(script, ...args)** - Executes the specified async javascript in the browser.
* **get(destination, timeoutMs)** - Loads the specified URL in the browser.
* **getAllWindowHandles()** - Returns handles for all open browser windows.
* **getProcessedConfig()**
* **getWindowHandle()** - Returns the handle for the currently focused window.
* **getCurrentUrl()** - Gets the URL of the currently focused window.
* **close()** - Closes the current browser window.
* **quit()** - Quits the current browser session.
* **switchTo()** - Returns a TargetLocatorSync instance which can be used to focus other browser windows.
* **manage()** - Returns an OptionsSync instance which can be used to manage cookies or the current window.
* **takeScreenshot()** - Takes a screenshot.
* **pause()** - Pauses the current control flow.
* **debugger()** - Pauses the current control flow and allows debugging to occur in the browser.
* **waitForAngularEnabled(optionalBoolean)** - Sets (when a boolean is passed) or returns (when no argument is passed) whether waitForAngular is enabled

## Extras Unique to browserSync
Simple example usage:
````
import {browserSync} from 'protractor-sync';
let protractorBrowserInstance = browserSync.getBrowser();
````
* **forkAndSwitchToNewDriverInstance()** - Forks a new browser instance and switches control to it automatically.
* **getBrowser()** - Returns the wrapped `browser` object from Protractor.
Once you have this, you can call Protractor methods on it as usual, but doing so is not recommended except in special cases.
The recommended approach is to call the equivalent Protractor-sync method on the browserSync object.

# TargetLocatorSync
For working with other browser windows or frames
* **window(nameOrHandle)** - Targets a window with the given name or handle. Example: `browserSync.switchTo().window('name');`
* **frame(ElementFinderSync)** - Targets a frame idenfied by the given ElementFinderSync object.
Example: `browserSync.switchTo().frame(frameElement);`
* **defaultContent()** - Targets the default content.
Example: `browserSync.switchTo().defaultContent();`

# OptionsSync
For managing cookies or the current window

Simple example usage:
````
browserSync.manage().deleteAllCookies();
````
* **addCookie(name, value, optPath, optDomain, optIsSecure, optExpiry)**
* **deleteAllCookies()**
* **deleteCookie(name)**
* **getCookies()**
* **getCookie(name)**
* **window()** Returns a windowSync object which can be used to manage the current window

# WindowSync
Simple example usage:
````
browserSync.window().maximize();
````
* **getPosition()**
* **setPosition(x, y)**
* **getSize()**
* **setSize()**
* **maximize()**

# Standalone Util Methods
Util methods that stand alone as part of Protractor-sync.

Simple example usage:
````
import {configure, polledExpect} from 'protractor-sync';
configure({implicitWaitMS: 1000});
polledExpect(() => myValue).toBe(true);
````

* **configure(options)** - Allows configuration options to be specified
    * **implicitWaitMs** - The amount of time to wait before timing out operations which wait implicitly. Note: An implicit wait SHOULD NOT be set in Selenium/Protractor. Use this value instead. Default: 5 seconds.
    * **retryIntervalMs** - The amount of time to wait before retrying operations which wait. Default: 10ms.
    * **clickRetryIntervalMs** - The amount of time to wait before attempting to re-click a blocked element. Default: 200ms.
    * **autoReselectStaleElements** - A boolean value indicating whether stale elements should be automatically re-selected or not.
    * **autoRetryClick** - A boolean value indicating whether Protractor-sync should attempt to automatically retry blocked clicks or not.
* **disallowExpect()** - Prevents jasmine's expect from being used (in favor of `polledExpect`)
* **getActiveElement** - Returns the current active element
* **polledExpect(func, waitTimeMs?)** - Works like jasmine's "expect", but retries the function until it passes or times out.
* **resizeViewport(size: { width?: number; height?: number; })** - Resize the viewport (not the window) to the specified size.
* **takeScreenshot(filename)** - Takes a screenshot and saves a .png file at the specified file path.
* **waitFor(condition, waitTimeMS?)** - Waits for the condition function to return a truthy value. An exception will be raised if it times out.
* **waitForNewWindow(action, waitTimeMs)** - Executes the action function, then waits for a new popup window to appear.
  The current window will be switched to the new window when it opens. Times out after waitTimeMs milliseconds.

# Re-Exported Classes
For convenience, Protractor-sync re-exports `By` from Protractor and `Key` from Selenium, unchanged.
Simple example usage:
````
import {Key} from 'protractor-sync';
````