module.exports = function(grunt) {
    grunt.initConfig({
        lint: {
            files: ['grunt.js', 'jquery.timepicker.js']
        },
        jshint: {
            options: {
                browser: true,
                eqeqeq: false
            }
        },

        min: {
            "jquery.timepicker.min.js": ["jquery.timepicker.js"]
        }
    });

    grunt.registerTask('default', 'lint min');
};
