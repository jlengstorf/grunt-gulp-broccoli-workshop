'use strict';
module.exports = function(grunt) {

  // Dynamically loads all required grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Configures the tasks that can be run
  grunt.initConfig({

    // Compiles LESS files to CSS
    less: {
      dist: {
        options: {
          cleancss: true // Minifies CSS output
        },
        files: { 'app/css/main.css': 'app/less/{,*/}*.less' }
      }
    },

    // Adds vendor prefixes to CSS
    autoprefixer: {
      dist: {
        src: 'app/css/main.css'
      }
    },

    // Combines and minifies JS files
    uglify: {
      options: {
        mangle: false,
        compress: true,
        preserveComments: 'some'
      },
      scripts: {
        files: {
          'app/js/combined.min.js': [ 'app/js/{,*/}*.js', '!app/js/combined.min.js' ]
        }
      }
    },

    // Checks JS for syntax issues using JSHint
    jshint: {
        dev: {
          options: {
            '-W097': true, // Ignores "use strict" warning
            browser: true,
            devel: true,
            // laxcomma: true,
            validthis: true, // Avoids a warning using `this`
            globals: {
              angular: true,
              __dirname: true,
              require: true,
              module: true,
            }
          },
          src: [ '{,*/}*.js', 'app/js/{,*/}*.js', '!app/js/combined.min.js' ]
        }
    },

    // Looks for todo items and collects them in a file for reference
    todo: {
      options: {
        file: "todo.md"
      },
      src: [
        '**/*.js',
        'app/**/*.less',
        'app/**/*.ejs',
        'app/**/*.html',
        '!node_modules/**/*.*',
        '!app/lib/**/*.*'
      ],
    },

    // Watches front-end files for changes and reruns tasks as needed
    watch: {
      todo: {
        // NOTE Uses the todo file list to save time if the list changes
        files: [ '<%= todo.src %>' ],
        tasks: [ 'todo' ]
      },
      styles: {
        files: [ 'app/less/{,*/}*.less' ],
        tasks: [ 'less:dist', 'autoprefixer:dist' ],
        options: {
          livereload: true
        }
      },
      scripts: {
        files: [ 'app/js/{,*/}*.js', '!app/js/combined.min.js' ],
        tasks: [ 'jshint:dev', 'uglify:scripts' ]
      },
      server: {
        files: ['.rebooted'],
        options: {
          livereload: true
        }
      } 
    },

    // Watches back-end files for changes, restarts the server
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          env: {
            PORT: 9000
          },
          ext: 'js,ejs,html',
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              // Delay before server listens on port
              setTimeout(function() {
                require('open')('http://localhost:9000');
              }, 1000);
            });

            // refreshes browser when server reboots
            nodemon.on('restart', function () {
              // Delay before server listens on port
              setTimeout(function() {
                require('fs').writeFileSync('.rebooted', 'rebooted');
              }, 1000);
            });
          }
        }
      }
    },

    // Allows us to run watch and nodemon concurrently with logging
    concurrent: {
      dev: {
        tasks: [ 'nodemon:dev', 'watch' ],
        options: {
          logConcurrentOutput: true
        }
      }
    },

  });

  // Compiles LESS/JS and checks for todos
  grunt.registerTask('default', [
    'less:dist',
    'autoprefixer:dist',
    'jshint:dev',
    'uglify:scripts',
    'todo'
  ]);

  // Starts a server and runs nodemon and watch using concurrent
  grunt.registerTask('server', [ 'concurrent:dev' ]);

};
