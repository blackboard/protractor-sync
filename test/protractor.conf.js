var ab = require('asyncblock');
var config = require('./config');

// protractor configuration file (see options doc at https://github.com/angular/protractor/blob/master/docs/referenceConf.js)
exports.config = {
  baseUrl: 'http://localhost',

  // ----- How to setup Selenium -----

  // Do not start a Selenium Standalone sever - only run this using chrome.
  directConnect: true,
  chromeDriver: '../node_modules/webdriver-manager/selenium/chromedriver_'+config.webdriverComponents['chromedriver'],

  // Comment out directConnect and chromeDriver and uncomment this to run on separate Selenium server
  //seleniumAddress: 'http://someServer:4444/wd/hub',

  // ----- Capabilities to be passed to the webdriver instance ----

  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
        'args': ['enable-precise-memory-info','disable-infobars'],
        prefs: {
            'credentials_enable_service': false,
            'profile': {
                'password_manager_enabled': false
            }
        }
    }
  },

  // ----- What tests to run -----

  // Spec patterns are relative to the current working directory when protractor is called.
  specs: ['../build/develop/test/spec/**/*_test.js'],

  // ----- More information for your tests ----

  onPrepare: function (){
    ab.enableTransform();

    // The require statement must be down here, since jasmine-reporters
    // needs jasmine to be in the global and protractor does not guarantee
    // this until inside the onPrepare function.
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      // junit reporter for build server
      new jasmineReporters.JUnitXmlReporter({savePath: 'build/test/test/ui/results', consolidate: true, useDotNotation: true})
    );

    var jasmineSpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(
      // console reporter for running tests locally
      new jasmineSpecReporter({displayStacktrace: 'all'})
    );

    browser.manage().timeouts().pageLoadTimeout(30000);

    //NOTE: We don't setup an implicit wait for selenium because we want to be able to check for the existence of items without waiting
    //      This shouldn't matter practically because all of our element selection methods have their own built in polling.

		browser.ignoreSynchronization = true;
  },

  // ----- The test framework -----

  framework: 'jasmine2',

  // Options to be passed to minijasminenode.
  jasmineNodeOpts: {
    // If true, print colors to the terminal.
    showColors: true,
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 1000000,
    // remove protractor dot reporter; we are using a custom reporter instead
    print: function() {}
  }
};