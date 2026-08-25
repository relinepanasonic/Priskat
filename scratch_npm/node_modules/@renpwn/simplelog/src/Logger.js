import { LEVELS, LEVEL_STYLE, normalizeLevel } from './Levels.js'
import { createStringifier } from './Stringify.js'
import { formatTime } from './Time.js'
import { format } from './Formatter.js'
import { FileSink } from './FileSink.js'
import { ProgressManager } from './Progress/ProgressManager.js'

export class Logger {
  constructor(opts = {}) {
    this.level = normalizeLevel(opts.level)
    this.color = !!opts.color
    this.tty = process.stdout.isTTY && !process.env.CI

    this.time = !!opts.time
    this.timeLocale = opts.time?.locale || 'id'
    this.timePos = opts.time?.position || 'prefix'

    this.stringify = createStringifier(
      opts.truncate || { maxLength: opts.maxLength }
    )

    this.file = new FileSink(opts.file || {})

    this.progress = opts.progress
      ? new ProgressManager(opts.progress.slots || [], opts.progress.theme)
      : null

    this.lastProgressLines = 0
  }

  allow(type) {
    return LEVELS[type] >= LEVELS[this.level]
  }

  style(type, user) {
    if (!this.color) return user
    return { ...LEVEL_STYLE[type], ...user }
  }

  /* ================= PROGRESS API ================= */

  updateProgress(name, cur, total, text) {
    if (!this.progress) return
    this.progress.update(name, cur, total, text)
    this.renderProgress()
  }

  removeProgress(name) {
    if (!this.progress) return
    this.progress.remove(name)
    this.renderProgress()
  }

  /* ================= RENDER CONTROL ================= */

  clearProgress() {
    if (!this.progress || !this.tty || this.lastProgressLines === 0) return

    process.stdout.write(`\x1b[${this.lastProgressLines}A`)
    for (let i = 0; i < this.lastProgressLines; i++) {
      process.stdout.write('\x1b[2K')
      process.stdout.write('\x1b[1B')
    }
    process.stdout.write(`\x1b[${this.lastProgressLines}A`)
    this.lastProgressLines = 0
  }

  renderProgress() {
    if (!this.progress || !this.tty) return

    const snapshot = this.progress.snapshot()
    if (!snapshot.length) return

    this.clearProgress()

    process.stdout.write('\n')
    for (const p of snapshot) {
      process.stdout.write(`${p.line}\n`)
    }

    this.lastProgressLines = snapshot.length + 1
  }

  /* ================= CORE WRITE ================= */

  write(type, args, style) {
    if (!this.allow(type)) return

    const msg = args.map(this.stringify.toStr).join(' ')
    const t = this.time ? formatTime(this.timeLocale) : null

    const out =
      t && this.timePos === 'suffix'
        ? `${msg} | ${t}`
        : t
        ? `${t} ${msg}`
        : msg

    if (this.progress) {
      this.clearProgress()
      process.stdout.write(
        format(out, this.style(type, style), this.tty) + '\n'
      )
      this.renderProgress()
    } else {
      console.log(format(out, this.style(type, style), this.tty))
    }

    this.file.write(type, out)
  }

  log(...a) { this.write('log', a) }
  debug(...a) { this.write('debug', a) }
  info(...a)  { this.write('info', a) }
  warn(...a)  { this.write('warn', a) }
  error(...a) { this.write('error', a) }
}