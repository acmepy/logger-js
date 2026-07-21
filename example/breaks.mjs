import { createLogger, logger, LEVELS } from 'com.acmepy.logger-js'

createLogger({
  name: '[breaks-example]',
  displayConsole: true,
  level: LEVELS.ERROR,
  breaks: ['example/visible']
})

logger.info('example/hidden', 'este mensaje queda filtrado por nivel')
logger.info('example/visible', 'este mensaje aparece porque el origen esta en breaks')

logger.addBreak('example/runtime')
logger.debug('example/runtime', 'este origen fue agregado en runtime')
