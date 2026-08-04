import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const production = process.env.BUILD === 'production'

const banner = '/* logger-js */'

export default [
  {
    input: 'src/index.js',
    external: ['dayjs', 'node:fs'],
    output: [
      {
        file: 'dist/logger.esm.js',
        format: 'esm',
        sourcemap: true,
        banner,
        inlineDynamicImports: true,
        generatedCode: 'es2015'
      },
      {
        file: 'dist/logger.cjs',
        format: 'cjs',
        sourcemap: true,
        banner,
        inlineDynamicImports: true,
        exports: 'named',
        generatedCode: 'es2015'
      }
    ],
    treeshake: production
  },
  {
    input: 'src/index.js',
    external: ['node:fs'],
    output: {
      file: 'dist/logger.umd.js',
      format: 'iife',
      name: 'logger',
      sourcemap: true,
      banner,
      inlineDynamicImports: true,
      generatedCode: 'es2015'
    },
    plugins: [
      nodeResolve({ browser: true }),
      commonjs()
    ],
    treeshake: production
  }
]



