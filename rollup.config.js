import { terser } from "rollup-plugin-terser";
import copy from 'rollup-plugin-copy'


export default {
  input: 'src/jquery.timepicker.js',
  output: [
    {
      file: 'dist/jquery.timepicker.js',
      format: 'iife'
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