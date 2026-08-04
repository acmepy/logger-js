export type LogLevelName = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF'

export type RotateMode = 'hourly' | 'daily' | 'weekly' | 'monthly'

export declare const LEVELS: {
  readonly TRACE: 1
  readonly DEBUG: 2
  readonly INFO: 3
  readonly WARN: 4
  readonly ERROR: 5
  readonly OFF: 99
}

export declare const ROTATE: {
  readonly HOURLY: 'hourly'
  readonly DAILY: 'daily'
  readonly WEEKLY: 'weekly'
  readonly MONTHLY: 'monthly'
}

export interface LoggerConfig {
  file?: string | false
  name?: string | false
  displayConsole?: boolean
  level?: typeof LEVELS[keyof typeof LEVELS]
  hideSecrets?: boolean
  rotate?: RotateMode | false
  breaks?: string[]
}

export type LogData = unknown

export declare class Logger {
  break: string[]
  level: number
  console: {
    display?: boolean
    log?: (...data: unknown[]) => void
    warn?: (...data: unknown[]) => void
    error?: (...data: unknown[]) => void
  }
  file: string | false
  name: string | false
  hideSecrets: boolean
  rotate?: RotateMode | false

  config(options: LoggerConfig): void
  addBreak(break_: string): void
  setName(name: string | false): void
  trace(path: string, ...data: LogData[]): void
  debug(path: string, ...data: LogData[]): void
  info(path: string, ...data: LogData[]): void
  warn(path: string, ...data: LogData[]): void
  error(path: string, ...data: LogData[]): void
  log(rest: LogData[]): void
  writeFile(fn: string, data: LogData[]): Promise<void>
  filterLogger(rest: LogData[]): LogData[]

  static readonly levels: typeof LEVELS
}

export declare function createLogger(options: LoggerConfig): void

export declare const logger: Logger
