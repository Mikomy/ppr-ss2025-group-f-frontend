module.exports = function (config) {
  config.set({
    // Base path to be used for resolving files and excluding files
    basePath: '',

    // Define which test frameworks to use
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],

    // Configuration for Karma-Jasmine HTML Reporter plugin
    client: {
      clearContext: false, // Prevents clearing the test run in the browser after completion
    },

    jasmineHtmlReporter: {
      suppressAll: true //removes the duplication traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '.coverage/ng-testing-and-debugging'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },

    // Define which reporters to use
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // Configure the browsers to be used for testing
    browsers: ['ChromeHeadless'],

    // Optional: Allow the tests to finish and exit Karma after running
    singleRun: false,

    // Automatically restart the browser when files change
    restartOnFileChange: true,


  });
};
