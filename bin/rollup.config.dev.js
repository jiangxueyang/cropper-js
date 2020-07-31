import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import {eslint} from 'rollup-plugin-eslint'
import alias from 'rollup-plugin-alias'
import commonjs from 'rollup-plugin-commonjs'
import aliasConfig from './alias'
import progress from 'rollup-plugin-progress'

export default {
    input: 'src/index.js',
    output: {
        file: 'example/lib/cutterjs.js',
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
        babel({
            exclude: 'node_modules/**'
        }),
        alias(aliasConfig)
    ]

}
