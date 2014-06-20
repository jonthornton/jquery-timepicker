module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner : '/*!\n' +
			' * <%= pkg.title %> v<%= pkg.version %> - <%= pkg.description %>\n' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> - <%= pkg.homepage %>\n' +
			' * License: <%= pkg.license %>\n' +
			' */\n\n'
		},
		uglify: {
			options : {
				banner : '<%= meta.banner %>',
				report: 'gzip'
			},
			dist: {
				files: {
					'jquery.timepicker.min.js': ['jquery.timepicker.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['uglify']);

};
