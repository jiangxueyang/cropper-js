import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import {eslint} from 'rollup-plugin-eslint'
import alias from 'rollup-plugin-alias'
import commonjs from 'rollup-plugin-commonjs'
import aliasConfig from './alias'
import progress from 'rollup-plugin-progress'
import rollupInlineSource from 'rollup-plugin-inline-source'
import {uglify} from 'rollup-plugin-uglify'
import banner from 'rollup-plugin-banner'
const vesion = process.env.VERSION || require('../package.json').version
export default {
    input: 'src/index.js',
    output: {
        file: 'dist/cropper.min.js',
        format: 'umd',
        name: 'CropperJS',
        moduleName: 'CropperJS'
    },
    plugins: [
        resolve(),
        commonjs(),
        eslint(),
        progress({
            clearLine: false
        }),
        rollupInlineSource(),
        babel({
            exclude: 'node_modules/**'
        }),
        uglify(),
        alias(aliasConfig),
        banner(`CropperJS v${vesion} Copyright (c) ${new Date()}, JIANGXUEYANG All Rights Reserved,
    see: for Details
    @license MIT`)
    ]
}
