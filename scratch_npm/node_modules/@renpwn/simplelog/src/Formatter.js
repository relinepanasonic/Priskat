const EXT = {
  // --- grayscale (10)
  gray0:232, gray1:233, gray2:234, gray3:235, gray4:236,
  gray5:237, gray6:238, gray7:239, gray8:240, gray9:241,

  // --- soft colors (pastel-ish)
  softRed:203,
  softGreen:114,
  softYellow:221,
  softBlue:111,
  softMagenta:183,
  softCyan:159,

  // --- strong colors
  orange:208,
  pink:212,
  violet:177,
  teal:37,
  lime:154,
  amber:214,

  // --- extra useful
  gold:220,
  sky:117,
  mint:121,
  coral:209,
  indigo:63,
  brown:130,
  olive:100,
  navy:17,
  maroon:124,
  aqua:51,
  chartreuse:118,
  plum:176,
  salmon:210,
  steel:67,
  sand:215,
  forest:28,
  wine:88,
  slate:66,
  smoke:245
}

const COLORS = Object.assign({
  // --- basic (8)
  black:30, red:31, green:32, yellow:33,
  blue:34, magenta:35, cyan:36, white:37,

  // --- bright (8)
  brightBlack:90, brightRed:91, brightGreen:92, brightYellow:93,
  brightBlue:94, brightMagenta:95, brightCyan:96, brightWhite:97
}, EXT)

const BG = Object.assign({
  // --- basic
  black:40, red:41, green:42, yellow:43,
  blue:44, magenta:45, cyan:46, white:47,

  // --- bright
  brightBlack:100, brightRed:101, brightGreen:102, brightYellow:103,
  brightBlue:104, brightMagenta:105, brightCyan:106, brightWhite:107
}, EXT)

export function format(text, style, tty = true) {
  if (!tty || !style) return text
  COLORS = COLORS.concat(EXT)
  BG = BG.concat(EXT)

  const codes = []
  if (style.bold) codes.push(1)
  if (style.dim) codes.push(2)
  
  // foreground
  const c = COLORS[style.color]
  style.color in COLORS && codes.push(c <= 97 ? c : `38;5;${c}`)

  // background
  const b = BG[style.bg]
  style.bg in BG && codes.push(b <= 107 ? b : `48;5;${b}`)
  
  return codes.length
    ? `\x1b[${codes.join(';')}m${text}\x1b[0m`
    : text
}