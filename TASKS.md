# Tareas

## 2026-11-09 ? Rotacion semanal
- Objetivo: habilitar rotate weekly con semanas ISO y retencion existente.
- Alcance: fuente, pruebas, README y build distribuido. Sin publicar ni actualizar reparto-api.
- Criterios: agrupar lunes a domingo, separar semanas, respetar anio ISO y retener maxFiles.
- Estado: Hecho.
- Archivos: src/index.js, test/logger.test.js, rollup.config.js, README.md, dist/logger.esm.js, dist/logger.esm.js.map y TASKS.md.
- Validacion: npm test (3/3), npm run build-prod (sin advertencias), import del build correcto y git diff --check sin errores.
- Pendiente fuera del alcance: publicar la dependencia y actualizar su revision en reparto-api.
