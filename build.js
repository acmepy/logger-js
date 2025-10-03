import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from './package.json' with { type: 'json' }

function limpiar(){
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    }
    fs.mkdirSync(distPath, { recursive: true });
}

const externalDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

async function build() {
	limpiar();

  // ESM output (.mjs)
  await esbuild.build({
    entryPoints: [pkg.source],
    outfile: pkg.module,
    bundle: true,
    platform: 'node',
    target: ['node14'],
    format: 'esm',
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    external: externalDeps
  });

  // CJS output (.cjs)
  await esbuild.build({
    entryPoints: [pkg.source],
    outfile: pkg.main,
    bundle: true,
    platform: 'node',
    target: ['node14'],
    format: 'cjs',
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    external: externalDeps
  });
/* da error en import fs from 'fs'
  // UMD / IIFE (para unpkg, jsdelivr, navegador)
  await esbuild.build({
    entryPoints: [pkg.source],
    outfile: pkg.unpkg,
    bundle: true,
    format: 'iife',
    globalName: 'logger',
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
  });
*/
  console.log('✅ Build completo: dist/index.mjs + dist/index.cjs');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});