'use strict';
var ab = require('asyncblock');
var config = require('./test/config.js');

if (ab.enableTransform(module)) {
  return;
}

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
      prepareModuleDefinition: {
        expand: true,
        cwd: 'dist',
        src: 'protractor_sync.d.ts',
        dest: 'dist',
        options: {
          process: function (content, srcpath) {
            //Convert to an ambient module, which will allow it to be "required"
            return content.replace(/export declare module protractor_sync/, 'declare module "protractor_sync"');
          }
        }
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
        command: 'node ./node_modules/webdriver-manager/bin/webdriver-manager update --versions.chrome '+config.chromedriverVersion
      },

      webdriverStart: {
        command: 'node ./node_modules/webdriver-manager/bin/webdriver-manager start --versions.chrome '+config.chromedriverVersion
      }
    },

    ts: {
      options: {
        compiler: 'node_modules/typescript/bin/tsc'
      },

      build: {
        tsconfig: 'tsconfig.json'
      },

      watchApp: {
        tsconfig: 'tsconfig.json',
        watch: '.'
      }
    },

    tslint: {
      options: {
        configuration: grunt.file.readJSON('tslint.json')
      },

      all: {
        src: [ 'app/**/*.ts', 'test/**/*.ts' ]
      }
    }
  });

  grunt.registerTask('build', [
    'clean:build',
    'ts:build'
  ]);

  grunt.registerTask('develop', [
    'ts:watchApp'
  ]);

  grunt.registerTask('test', [
    'shell:webdriverUpdate',
    'protractor:tests'
  ]);

  grunt.registerTask('verify', [
    'tslint:all'
  ]);

  grunt.registerTask('package', [
    'clean:dist',
    'copy:dist',
    'copy:prepareModuleDefinition'
  ]);
};
