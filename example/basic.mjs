import { createLogger, logger, LEVELS } from 'com.acmepy.logger-js'

createLogger({
  name: '[basic-example]',
  displayConsole: true,
  level: LEVELS.TRACE
})

logger.trace('example/basic', 'mensaje trace')
logger.debug('example/basic', 'mensaje debug')
logger.info('example/basic', 'usuario creado', { id: 123, email: 'demo@example.com' })
logger.warn('example/basic', 'configuracion incompleta')
logger.error('example/basic', new Error('fallo de ejemplo'))
