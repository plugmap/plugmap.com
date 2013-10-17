'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jsvalidate: {
      files: ['*.js','routes/*.js', 'routes/**/*.js', 'www/*.js']
    }
  });

  // Load modules
  grunt.loadNpmTasks('grunt-jsvalidate');

  // Register tasks
  grunt.registerTask('test', ['jsvalidate']);
  grunt.registerTask('default', ['test']);
};
