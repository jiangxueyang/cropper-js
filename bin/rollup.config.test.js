import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import {eslint} from 'rollup-plugin-eslint'
import alias from 'rollup-plugin-alias'
import commonjs from 'rollup-plugin-commonjs'
import aliasConfig from './alias'
import progress from 'rollup-plugin-progress'
import rollupInlineSource from 'rollup-plugin-inline-source'

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/cutterjs.js',
        format: 'umd',
        name: 'Cutter',
        moduleName: 'Cutter'
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
        alias(aliasConfig)
    ]
}
