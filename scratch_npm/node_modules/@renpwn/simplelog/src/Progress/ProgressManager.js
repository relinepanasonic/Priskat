import { ProgressRenderer } from './ProgressRenderer.js'

export class ProgressManager {
  constructor(slots = [], theme = {}) {
    this.slots = slots
    this.state = new Map()
    this.renderer = new ProgressRenderer(theme)
    this.theme = theme?.style || null
  }

  update(name, cur, total, text = "") {
    this.state.set(name, {
      cur,
      total: total < cur ? cur : total,
      text,
      start: Date.now()
    })
  }

  remove(name) {
    this.state.delete(name)
  }

  clear() {
    this.state.clear()
  }

  snapshot() {
    const s = a => Array.isArray(a) ? a : []
    
    return this.slots.map(item => {
      const name = s(item)[0] || item
      const vStyle = s(item)[1] || { }
      
      const v = this.state.get(name) || { cur: 0, total: 0, text: '' }

      const percent = v.total
        ? Math.floor((v.cur / v.total) * 100)
        : 0

      const elapsed = v.start
        ? Math.floor((Date.now() - v.start) / 1000)
        : 0

      const eta =
        v.cur && v.total && elapsed
          ? Math.floor((elapsed / v.cur) * (v.total - v.cur))
          : null

      return {
        name,
        cur: v.cur,
        total: v.total,
        percent,
        elapsed,
        eta,
        //text: v.text,
        line: this.renderer.render(name, v.cur, v.total, v.text, vStyle)
      }
    })
  }
}