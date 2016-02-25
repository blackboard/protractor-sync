'use strict';
var ab = require('asyncblock');
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
      jquery: {
        expand: true,
        cwd: 'app',
        src: 'jquery-1.11.3.js',
        dest: 'build/develop/app/'
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
        src: [ 'app/**/*.ts', 'test/**/*.ts' ],
        outDir: 'build/develop'
      },

      watchApp: {
        src: [ 'app/**/*.ts', 'test/**/*.ts' ],
        watch: '.',
        outDir: 'build/develop'
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
    'ts:watchApp',
    'copy:jquery'
  ]);

  grunt.registerTask('pre-commit', [
    'tslint:all',
    'build',
    'tests',
    'copy:jquery',
    'clean:dist',
    'copy:dist',
    'copy:prepareModuleDefinition'
  ]);

  grunt.registerTask('tests', [
    'copy:jquery',
    'protractor:tests'
  ]);

  grunt.registerTask('update', [
    'shell:webdriverUpdate'
  ]);
};
