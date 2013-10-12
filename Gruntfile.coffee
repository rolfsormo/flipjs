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
          include: 'Flip'
          paths:
            'almond': '../node_modules/almond/almond'
          insertRequire: ['Flip']
          generateSourceMaps: true
          optimize: 'none'

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