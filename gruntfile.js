'use strict';
var ab = require('asyncblock');
if (ab.enableTransform(module)) {
  return;
}

var TS_FILES = [ 'app/**/*.ts', 'test/**/*.ts' ];

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: {
      build: 'build',
      dist: 'dist'
    },

    copy: {
      dist: {
        expand: true,
        cwd: 'build/develop/app',
        src: ['*.js', '*.d.ts'],
        dest: 'dist'
      },
      jquery: {
        expand: true,
        cwd: 'app',
        src: 'jquery-1.11.3.js',
        dest: 'build/develop/app/'
      }
    },

    protractor: {
      options: {
        configFile: 'test/protractor.conf.js'
      },
      tests: {}
    },

    shell: {
      webdriverUpdate: {
        command: 'node ./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update'
      },

      webdriverStart: {
        command: 'node ./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager start'
      }
    },

    ts: {
      options: {
        compiler: 'node_modules/typescript/bin/tsc',
        declaration: true,
        module: 'commonjs',
        removeComments: false,
        target: 'es5',
        sourceMap: true,
        noImplicitAny: true
      },

      build: {
        src: [ TS_FILES ],
        outDir: 'build/develop'
      },

      watch: {
        src: [ TS_FILES ],
        watch: '.',
        outDir: 'build/develop'
      }
    },

    tslint: {
      options: {
        configuration: grunt.file.readJSON('tslint.json')
      },

      all: {
        src: [ TS_FILES ]
      }
    }
  });

  grunt.registerTask('build', [
    'clean:build',
    'ts:build'
  ]);

  grunt.registerTask('develop', [
    'ts:watch',
    'copy:jquery'
  ]);

  grunt.registerTask('pre-commit', [
    'tslint:all',
    'build',
    'tests',
    'copy:jquery',
    'clean:dist',
    'copy:dist'
  ]);

  grunt.registerTask('tests', [
    'copy:jquery',
    'protractor:tests'
  ]);

  grunt.registerTask('update', [
    'shell:webdriverUpdate'
  ]);
};