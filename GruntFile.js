module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			dist: {
				files: {
					'jquery.timepicker.min.js': ['jquery.timepicker.js']
				}
			}
		},
		cssmin: {
			minify: {
				files: {
					'jquery.timepicker.min.css': ['jquery.timepicker.css'] 
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['uglify', 'cssmin']);

};
