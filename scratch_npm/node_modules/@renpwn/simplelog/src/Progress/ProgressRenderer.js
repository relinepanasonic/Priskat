import { format } from '../Formatter.js'

export class ProgressRenderer {
  constructor({ size = 20, filled = '█', empty = '░', style = {}, left = '[', right = ']'} = {}) {
    this.size = size
    this.filled = filled
    this.empty = empty
    this.style = style
    this.left = left
    this.right = right
    this.tty = process.stdout.isTTY && !process.env.CI
  }
  
  styleResolve(style, current, percent){
    if(!style) return null
    
    //auto style
    if (style === 'auto')
      return percent >= 85
        ? { color: 'red', bold: true }
        : percent >= 45
          ? { color: 'yellow' }
          : { color: 'blue' }
    
    //format from style dual or single
    style = Array.isArray(style) ? (current > 0 && style.length > 1 ? style[1] : style[0]) : style
    return style && typeof style === 'object' && Object.keys(style).length ? style :  null
  }

  render(name, cur, total, text, style = {}) {
    if (!total) total = 1
    const percent = Math.floor((cur / total) * 100)
    const filled = Math.min(
      this.size,
      Math.max(0, Math.floor(percent / 100 * this.size))
    )
    
    style = this.styleResolve(style, cur, percent)
    this.style = this.styleResolve(this.style, cur)
    
    const left = format(`${name} ${this.left}`, this.style, this.tty)
    const right = format(`${this.right} ${percent}% ${text}`, this.style, this.tty)
    const bar = format(this.filled.repeat(filled) + this.empty.repeat(this.size - filled), style, this.tty)
    

    return left + bar + right
  }
}