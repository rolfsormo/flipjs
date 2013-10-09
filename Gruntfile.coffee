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
      
      development_almond:
        options:
          name: 'almond'
          out: 'flip-debug-almond.js'
          include: 'flip'
          paths:
            'almond': '../node_modules/almond/almond'
          insertRequire: ['flip']
          generateSourceMaps: true
          optimize: 'none'

      development:
        options:
          name: 'flip'
          out: 'flip-debug.js'
          include: ['flip', 'adapters/localStorage']
          insertRequire: ['flip']
          generateSourceMaps: true
          optimize: 'none'

      production:
        options:
          name: 'flip'
          out: 'flip.js'
          insertRequire: ['flip']

    nodeunit:
      all: ['test/nodeunit/*_test.js']
  
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-copy'

  grunt.loadNpmTasks 'grunt-contrib-requirejs'

  grunt.loadNpmTasks('grunt-contrib-nodeunit');


  grunt.registerTask 'default', [
    'requirejs:development'
    'nodeunit'
  ]