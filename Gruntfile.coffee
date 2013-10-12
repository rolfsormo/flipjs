path = require 'path'

module.exports = (grunt) ->

  grunt.initConfig
    clean:
      development: ['build']

    requirejs:
      options:
        # dir: 'build/development/javascripts'
        baseUrl: 'lib'
        wrap: false
      
      # development_almond:
      #   options:
      #     name: 'almond'
      #     out: 'flip-debug-almond.js'
      #     include: 'Flip'
      #     paths:
      #       'almond': '../node_modules/almond/almond'
      #     insertRequire: ['Flip']
      #     generateSourceMaps: true
      #     optimize: 'none'

      development:
        options:
          name: 'Flip'
          out: 'flip-debug.js'
          include: ['Flip', 'adapters/MemStorage', 'adapters/LocalStorage']
          insertRequire: ['Flip']
          generateSourceMaps: true
          optimize: 'none'

      production:
        options:
          name: 'Flip'
          out: 'Flip.js'
          insertRequire: ['Flip']

    jshint:
      gruntfile: ['Gruntfile']
      code: ['lib/**/*.js', '!lib/vendor/**']
      tests: ['test/**/*.js']

    nodeunit:
      all: ['test/nodeunit/*_test.js']

    watch:
      scripts:
        files: ['lib/**/*.js']
        tasks: ['default']
  
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'

  grunt.loadNpmTasks 'grunt-contrib-requirejs'
  grunt.loadNpmTasks 'grunt-contrib-jshint'

  grunt.loadNpmTasks 'grunt-contrib-nodeunit'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', [
    'clean'
    'jshint'
    'requirejs:development'
    'nodeunit'
    'watch'
  ]

