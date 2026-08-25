import fs from 'fs'
import path from 'path'

export class FileSink {
  constructor(opts = {}) {
    if (!opts.path) {
      this.enabled = false
      return
    }

    this.enabled = true
    this.format = opts.format || 'txt'   // txt | json (JSONL)
    this.backup = opts.backup !== false
    this.basePath = path.resolve(process.cwd(), opts.path)

    fs.mkdirSync(path.dirname(this.basePath), { recursive: true })
  }

  backupFile(file) {
    if (!this.backup || !fs.existsSync(file)) return
    fs.copyFileSync(file, file + '.bak')
  }

  restoreFile(file) {
    const bak = file + '.bak'
    if (fs.existsSync(bak)) fs.copyFileSync(bak, file)
  }

  write(level, message) {
    if (!this.enabled) return
    const time = new Date().toISOString()

    try {
      if (this.format === 'json') {
        this.backupFile(this.basePath)
        fs.appendFileSync(
          this.basePath,
          JSON.stringify({ time, level, message }) + '\n'
        )
        return
      }

      fs.appendFileSync(
        this.basePath,
        `[${time}] ${level.toUpperCase()} ${message}\n`
      )
    } catch {
      this.restoreFile(this.basePath)
    }
  }
}