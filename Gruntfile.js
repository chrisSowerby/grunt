module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      my_target: {
        options: {
          sourceMap: true,
          preserveComments: 'some'
          /*sourceMapName: 'path/to/sourcemap.map'*/
        },
        files: {
          'processAndBuild/js/build/dest-min.js': ['processAndBuild/js/src/*.js'] // dest // output 
          // we need to remove all 3rd party scripts from my chris_sowerby.js and place them in a file called 3rd_party.js
        }
      }
    },    
    sass: {
      dist: {                            // Target
        options: {                       // Target options
          style: 'compressed'
        },
        files: {                         // Dictionary of files
          'processAndBuild/stylesheets/style.css': 'processAndBuild/sass/style.scss'     // 'destination': 'source'          
        }
      }
    },
    ftpush: {
      build: {
        auth: {
          host: '',
          port: 21,
          authKey: 'key1'
        },
        src: './processAndBuild',
        dest: 'httpdocs/processAndBuild', 
        //exclusions: [],
        //keep: []
      }
    },
    notify: {
        done: {
            options: {
                title: 'Tasks Done',
                message: 'Go refresh'
            }
        }
    },
    newer: {
        options: {
            override: function(taskName, targetName, filePath, time, include) {
                if (taskName === 'scss') {
                  // call include with `true` if there are newer imports          
                  checkForNewerImports(filePath, time, include);
                } else {
                  include(false);
                }
            }
        }
    },
    jshint: {
      all: ['Gruntfile.js','processAndBuild/js/src/chris_sowerby.js'] //, 'processAndBuild/js/src/chris_sowerby.js' Gruntfile.js
    },
    watch:{
      files: ['processAndBuild/js/src/*.js','processAndBuild/sass/**/*.scss'],
      tasks:['jshint', 'newer:uglify', 'newer:sass', 'ftpush', 'notify:done'] //'ftpush'
    }
  });


var fs = require('fs');
var path = require('path');
 
function checkForNewerImports(scssFile, mTime, include) {
    fs.readFile(scssFile, "utf8", function(err, data) {
        var scssDir = path.dirname(scssFile),
            regex = /@import "(.+?)(\.scss)?";/g,
            shouldInclude = false,                
            match;
 
        while ((match = regex.exec(data)) !== null) {
            // All of my less files are in the same directory,
            // other paths may need to be traversed for different setups...
            var importFile = scssDir + '/' + match[1] + '.scss';
            if (fs.existsSync(importFile)) {
                var stat = fs.statSync(importFile);
                if (stat.mtime > mTime) {
                    shouldInclude = true;
                    break;
                }
            }
        }
        include(shouldInclude);
    });
}


  
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('default', ['watch']);  
  
};
