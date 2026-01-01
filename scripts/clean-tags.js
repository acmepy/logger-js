#!/usr/bin/env node
import { execSync } from 'node:child_process';

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  // 1️⃣ Obtener lista de tags
  const tags = execSync('git tag', { encoding: 'utf8' })
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean);

  if (tags.length === 0) {
    console.log('✔ No hay tags para eliminar');
    process.exit(0);
  }

  // 2️⃣ Eliminar tags remotos
  for (const tag of tags) {
    run(`git push origin --delete ${tag}`);
  }

  // 3️⃣ Eliminar tags locales
  for (const tag of tags) {
    run(`git tag -d ${tag}`);
  }

  console.log('✔ Todos los tags locales y remotos fueron eliminados');
} catch (err) {
  console.error('❌ Error limpiando tags');
  process.exit(1);
}