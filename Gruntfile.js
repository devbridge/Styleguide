module.exports = function (grunt) {
    grunt.initConfig({
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    nodeArgs: ['--debug'],
                    env: {
                        PORT: '8080'
                    }
                }
            }
        },
        develop: {
            server: {
                file: 'app.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.registerTask('default', ['develop']);
    grunt.registerTask('watch', ['nodemon']);

};