export const LEVELS = {
  log: 0,
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 99
}

export const LEVEL_STYLE = {
  log: { },
  debug: { color: 'cyan', dim: true },
  info:  { color: 'green' },
  warn:  { color: 'yellow', bold: true },
  error: { color: 'white', bg: 'red', bold: true }
}

export function normalizeLevel(level = 'log') {
  return LEVELS[level] !== undefined ? level : 'log'
}