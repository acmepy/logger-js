# Logger JS

Logger simple para Node.js con salida a consola, escritura opcional a archivo, niveles de severidad y rotacion de logs por fecha.

## Instalacion

```bash
npm install github:acmepy/logger-js
```

Tambien se puede declarar directo en `package.json`:

```json
{
  "dependencies": {
    "logger": "github:acmepy/logger-js"
  }
}
```

## Uso Basico

```js
import { createLogger, logger, LEVELS } from 'com.acmepy.logger-js'

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
| `file` | `undefined` | Ruta base del archivo de log. Si se define, el logger crea el directorio cuando hace falta. |
| `name` | `'my logger'` | Nombre que se imprime junto al nivel. Puede ser `false` si no se quiere mostrar. |
| `displayConsole` | `false` | Muestra logs en consola. Los errores siempre salen por consola. |
| `level` | `LEVELS.TRACE` | Nivel minimo que se registra cuando no hay `breaks`. |
| `rotate` | `'daily'` | Agrega fecha al nombre del archivo segun la rotacion. |
| `breaks` | `[]` | Lista de origenes que se registran aunque no cumplan el nivel minimo. |

## Niveles

```js
import { LEVELS } from 'com.acmepy.logger-js'

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
import { createLogger, logger, ROTATE } from 'com.acmepy.logger-js'

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
| `npm test` | Ejecuta Jest. |
| `npm run build` | Compila `src/index.js` en `dist/logger.cjs` y `dist/logger.esm.js`. |
| `npm run build-prod` | Compila con `NODE_ENV=production`. |
| `npm run release` | Incrementa version, pushea commits y tags. |

## Licencia

MIT
