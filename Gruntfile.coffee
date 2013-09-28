module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    coffee:
      app:
        expand: true
        cwd: 'coffee'
        src: ['*.coffee']
        dest: 'js'
        ext: '.js'
    watch:
      app:
        files: '**/*.coffee'
        tasks: ['coffee']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', ['coffee']
