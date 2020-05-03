import { terser } from "rollup-plugin-terser";
import copy from 'rollup-plugin-copy'
import { version } from './package.json';

const banner = `/*!
 * jquery-timepicker v${version} - A jQuery timepicker plugin inspired by Google Calendar. It supports both mouse and keyboard navigation.
 * Copyright (c) 2020 Jon Thornton - https://www.jonthornton.com/jquery-timepicker/
 * License: MIT
 */`;

export default {
  input: 'src/jquery.timepicker.js',
  output: [
    {
      file: 'dist/jquery.timepicker.js',
      format: 'iife',
      banner: banner
    },
    {
      file: 'dist/jquery.timepicker.min.js',
      format: 'iife',
      plugins: [terser()]
    }
  ],
  plugins: [
    copy({
      targets: [
        { src: 'src/static/jquery.timepicker.css', dest: 'dist/' },
      ]
    })
  ]
};