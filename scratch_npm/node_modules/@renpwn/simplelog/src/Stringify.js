export function createStringifier(opts = {}) {
  const enabled = opts.enabled !== false
  const max = Number.isInteger(opts.maxLength) ? opts.maxLength : 500

  function truncate(str) {
    if (!enabled) return str
    if (str.length > max) {
      return str.slice(0, max) +
        `... [TRUNCATED ${str.length - max} chars]`
    }
    return str
  }

  function toStr(v) {
    if (typeof v === 'object' && v !== null) {
      try {
        return truncate(JSON.stringify(v, null, 2))
      } catch {
        return truncate(String(v))
      }
    }
    return truncate(String(v))
  }

  return { toStr }
}