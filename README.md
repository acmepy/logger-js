# Logger JS

Logger simple para JavaScript con salida a consola, escritura opcional a archivo en Node.js, niveles de severidad y rotacion de logs por fecha.

Funciona en Node.js 22 y en navegador. En navegador se puede usar la salida a consola; la escritura a archivo solo esta disponible en Node.js.

## Instalacion

```bash
npm install github:acmepy/logger-js
```

Tambien se puede declarar directo en `package.json`:

```json
{
  "dependencies": {
    "logger-js": "github:acmepy/logger-js"
  }
}
```

## Uso Basico

```js
import { createLogger, logger, LEVELS } from 'logger-js'

createLogger({
  name: '[api]',
  displayConsole: true,
  level: LEVELS.INFO
})

logger.info('server/bootstrap', 'servidor iniciado', { port: 3000 })
logger.warn('server/config', 'variable opcional no definida')
logger.error('server/db', new Error('no se pudo conectar'))
```

Cada llamada recibe primero el origen del mensaje y despues cualquier dato adicional:

```js
logger.info('modulo/accion', 'mensaje', { extra: true })
```

La salida incluye hora, nivel, nombre del logger y origen:

```txt
[10:30:15] [INFO] [api] [server/bootstrap] servidor iniciado {"port":3000}
```

## Configuracion

`createLogger` configura el singleton exportado como `logger`.

```js
import { createLogger, LEVELS, ROTATE } from 'logger-js'

createLogger({
  file: 'logs/app.log',
  name: '[worker]',
  displayConsole: true,
  level: LEVELS.DEBUG,
  rotate: ROTATE.DAILY,
  breaks: []
})
```

Opciones disponibles:

| Opcion | Default | Descripcion |
| --- | --- | --- |
| `file` | `undefined` | Ruta base del archivo de log. Solo funciona en Node.js. Si se define, el logger crea el directorio cuando hace falta. |
| `name` | `'my logger'` | Nombre que se imprime junto al nivel. Puede ser `false` si no se quiere mostrar. |
| `displayConsole` | `false` | Muestra logs en consola. Los errores siempre salen por consola. |
| `level` | `LEVELS.TRACE` | Nivel minimo que se registra cuando no hay `breaks`. |
| `hideSecrets` | `true` | Controla el filtrado de algunos campos sensibles. |
| `rotate` | `'daily'` | Agrega fecha al nombre del archivo segun la rotacion. Puede ser `false` para desactivar rotacion. |
| `breaks` | `[]` | Lista de origenes que se registran aunque no cumplan el nivel minimo. |

## Niveles

```js
import { LEVELS } from 'logger-js'

LEVELS.TRACE
LEVELS.DEBUG
LEVELS.INFO
LEVELS.WARN
LEVELS.ERROR
LEVELS.OFF
```

Metodos disponibles:

```js
logger.trace(path, ...data)
logger.debug(path, ...data)
logger.info(path, ...data)
logger.warn(path, ...data)
logger.error(path, ...data)
```

`ERROR` siempre se muestra en consola y se registra aunque el nivel configurado sea mas alto.

## Rotacion de Archivos

```js
import { createLogger, logger, ROTATE } from 'logger-js'

createLogger({
  file: 'logs/app.log',
  rotate: ROTATE.MONTHLY
})

logger.info('billing/invoice', 'factura generada')
```

Si `file` es `logs/app.log`, la rotacion genera nombres como:

| Rotacion | Archivo generado |
| --- | --- |
| `ROTATE.HOURLY` | `logs/app-2026-07-21 15.log` |
| `ROTATE.DAILY` | `logs/app-2026-07-21.log` |
| `ROTATE.MONTHLY` | `logs/app-2026-07.log` |

`ROTATE.WEEKLY` esta exportado, pero la rotacion semanal no esta implementada en el codigo actual.

## Breaks

Los `breaks` permiten registrar origenes especificos aunque el nivel global filtre otros mensajes.

```js
createLogger({
  displayConsole: true,
  level: LEVELS.ERROR,
  breaks: ['payments/webhook']
})

logger.info('payments/webhook', 'evento recibido') // se registra
logger.info('server/health', 'ok')                 // se ignora
```

Tambien se pueden agregar en runtime:

```js
logger.addBreak('jobs/sync')
```

## Datos Sensibles

Antes de imprimir, el logger normaliza algunos valores:

- Si recibe un `Error`, registra su mensaje y stack.
- Si recibe un objeto con `logger`, elimina esa propiedad.
- Si recibe un objeto con `cert`, muestra solo el inicio y el final del certificado.
- Si recibe un objeto con `password`, reemplaza el valor por `*`.

## Browser

El build para navegador esta disponible en `dist/logger.umd.js` y expone `logger` en `globalThis`:

```html
<script src="dist/logger.umd.js"></script>
<script>
  logger.createLogger({ displayConsole: true })
  logger.logger.info('browser/app', 'listo')
</script>
```

La opcion `file` no escribe archivos en navegador; si se configura, el logger muestra un aviso por consola y continua.

## TypeScript

El paquete incluye declaraciones en `src/index.d.ts` y las expone mediante `types` y `exports.types`.

```ts
import { createLogger, logger, type LoggerConfig } from 'logger-js'

const config: LoggerConfig = {
  displayConsole: true
}

createLogger(config)
logger.info('app/start', 'ok')
```

## Build

Rollup genera un archivo por formato:

| Formato | Archivo |
| --- | --- |
| ESM | `dist/logger.esm.js` |
| CommonJS | `dist/logger.cjs` |
| Browser UMD/IIFE | `dist/logger.umd.js` |

`dayjs` queda externo en ESM/CJS por ser `peerDependency`, y empaquetado dentro del build de navegador para que sea un solo archivo usable en browser.

## Ejemplos

Hay ejemplos ejecutables en `example/`:

```bash
node example/basic.mjs
node example/file-rotation.mjs
node example/breaks.mjs
```

## Desarrollo

```bash
npm install
npm test
npm run build
```

Scripts principales:

| Script | Descripcion |
| --- | --- |
| `npm test` | Ejecuta el test runner nativo de Node.js. |
| `npm run build` | Compila con Rollup en ESM, CommonJS y UMD para navegador. |
| `npm run build-prod` | Compila con Rollup en modo production. |
| `npm run release` | Incrementa version, pushea commits y tags. |

## Licencia

MIT
