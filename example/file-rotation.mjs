import { createLogger, logger, LEVELS, ROTATE } from 'com.acmepy.logger-js'

createLogger({
  file: 'logs/example.log',
  name: '[file-example]',
  displayConsole: true,
  level: LEVELS.INFO,
  rotate: ROTATE.DAILY
})

logger.info('example/file', 'este mensaje se escribe en consola y archivo')
logger.debug('example/file', 'este mensaje no se registra porque el nivel minimo es INFO')
logger.warn('example/file', 'el archivo se crea dentro de logs/')
