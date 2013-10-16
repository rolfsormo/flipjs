path = require 'path'

module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    clean:
      development: ['build']

    requirejs:
      options:
        baseUrl: 'lib'
      
      full:
        options:
          name: 'almond'
          out: 'Flip-full.js'
          include: [
            'Flip'
            'adapters/LocalStorage'
            'adapters/MemStorage'
          ]
          paths:
            'almond': '../node_modules/almond/almond'
          insertRequire: ['Flip']

      full_debug:
        options:
          name: 'Flip'
          out: 'Flip-debug.js'
          include: [
            'Flip'
            'adapters/LocalStorage'
            'adapters/MemStorage'
          ]
          insertRequire: ['Flip']
          generateSourceMaps: true
          optimize: 'none'

    jshint:
      gruntfile: ['Gruntfile']
      code: ['lib/**/*.js', '!lib/vendor/**/*']
      tests: ['test/**/*.js', '!test/vendor/**/*']

    nodeunit:
      all: ['test/nodeunit/*_test.js']

    watch:
      scripts:
        files: ['lib/**/*.js', 'test/nodeunit/**/*.js']
        tasks: ['default']

    qunit:
      all: ['test/qunit/**/*_test.html']
  
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'

  grunt.loadNpmTasks 'grunt-contrib-requirejs'
  grunt.loadNpmTasks 'grunt-contrib-jshint'

  grunt.loadNpmTasks 'grunt-contrib-nodeunit'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-qunit'

  grunt.registerTask 'default', [
    'clean'
    'jshint'
    'requirejs:full'
    'nodeunit'
    'watch'
  ]
  grunt.registerTask 'test', [
    'clean'
    'jshint'
    'requirejs:development'
    'nodeunit'
    'qunit'
  ]
  grunt.registerTask 'build', [
    'clean'
    'jshint'
    'requirejs:full'
    'requirejs:full_debug'
  ]

