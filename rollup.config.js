const production = process.env.BUILD === 'production'

const banner = '/* logger-js */'

export default [
  {
    input: 'src/index.js',
    external: ['dayjs', 'node:fs', 'node:path'],
    output: {
      file: 'dist/logger.esm.js',
      format: 'esm',
      sourcemap: true,
      banner,
      inlineDynamicImports: true,
      generatedCode: 'es2015'
    },
    treeshake: production
  }
]



