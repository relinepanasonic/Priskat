import { Logger } from './Logger.js'

export function simpleLog(options) {
  return new Logger(options)
}