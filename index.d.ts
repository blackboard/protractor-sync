declare module 'protractor' {
  export = protractor;
}

declare function polledExpect(func: () => any): jasmine.Matchers<any>;

declare var browser: protractor.Protractor;
declare var by: protractor.IProtractorLocatorStrategy;
declare var element: protractor.Element;