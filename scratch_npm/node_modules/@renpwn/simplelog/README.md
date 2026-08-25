# simpleLog

> Lightweight, opinionated, **TTY-aware logger** for Node.js with progress bars, file output, safe stringify, and zero dependencies.

[![NPM](https://img.shields.io/npm/v/@renpwn/simplelog)](https://www.npmjs.com/package/@renpwn/simplelog)
[![Downloads](https://img.shields.io/npm/dm/@renpwn/simplelog)](https://www.npmjs.com/package/@renpwn/simplelog)
[![License](https://img.shields.io/npm/l/@renpwn/simplelog)](LICENSE)

---

## ✨ Features

- 🎨 Colored log levels (log, debug, info, warn, error)
- 🧠 Safe stringify (object → JSON, anti-crash, truncate)
- 🕒 Timestamp with locale support (`id`, `en`)
- 📁 File logging (TXT / JSONL with auto-backup)
- 📊 Multi progress bar (TTY-aware, auto redraw)
- 🧹 CI & non-TTY safe
- ⚡ Zero dependencies
- 🧩 Modular & audit-friendly

---

## 📦 Installation

### NPM
```bash
npm install @renpwn/simplelog
```

### Yarn
```bash
yarn add @renpwn/simplelog
```

### Git Clone
```bash
git clone https://github.com/renpwn/simpleLog.git
cd simpleLog
npm install
```

---

## 🚀 Quick Start (Minimal)

```js
import { simpleLog } from '@renpwn/simplelog'

const log = simpleLog()

log.log('hello')
log.info('info message')
log.warn('warning')
log.error('error')
```

---

## 🧠 Full Usage Examples

### 1️⃣ Logger with Level, Color & Time

```js
import { simpleLog } from '@renpwn/simplelog'

const log = simpleLog({
  level: 'debug',   // log | debug | info | warn | error | silent
  color: true,      // enable ANSI color (TTY only)
  time: {
    locale: 'en',   // en | id
    position: 'prefix' // prefix | suffix
  }
})

log.debug('Debug message')
log.info('Server started')
log.warn('Memory usage high')
log.error({ code: 500, msg: 'Fatal error' })
```

**Notes**
- `level` → minimum log level to display
- `color` → auto-disabled in non-TTY / CI
- `time` → compact and consistent timestamp

---

### 2️⃣ Safe Stringify & Truncate

```js
const log = simpleLog({
  truncate: {
    maxLength: 200
  }
})

log.info({
  veryLongData: 'x'.repeat(1000)
})
```

Objects are safely stringified and automatically truncated.

---

### 3️⃣ File Logging (TXT & JSONL)

#### TXT (default)
```js
const log = simpleLog({
  file: {
    path: 'logs/app.log'
  }
})

log.info('App started')
```

Output:
```
[2026-01-20T07:21:10.120Z] INFO App started
```

#### JSONL
```js
const log = simpleLog({
  file: {
    path: 'logs/app.json',
    format: 'json'
  }
})
```

Output:
```json
{"time":"2026-01-20T07:21:10.120Z","level":"info","message":"App started"}
```

File writes are atomic with automatic `.bak` backup.

---

### 4️⃣ Progress Bar (Multi Slot, Styled & Unstyled)

```js
const log = simpleLog({
  progress: {
    slots: [
      ['Scraping', { color: 'cyan' }],
      ['DB Queue', 'auto'],
      'WEB Queue'
    ]
  }
})

let i = 0
const timer = setInterval(() => {
  i++
  log.updateProgress('Scraping', i, 10, 'fetching...')
  log.updateProgress('DB Queue', i * 2, 20)

  if (i >= 10) {
    clearInterval(timer)
    log.info('All jobs finished')
  }
}, 300)
```

**Notes**
- Progress bars are shown only in TTY
- Normal logs temporarily clear progress and redraw it

---

### 5️⃣ Custom Progress Theme

```js
const log = simpleLog({
  progress: {
    slots: ['Download'],
    theme: {
      size: 30,
      filled: '█',
      empty: '░',
      left: '[',
      right: ']',
      style: { color: 'green' }
    }
  }
})
```

---

## 🎨 Styles Object

The `style` object controls **text color, background color, and emphasis**
for **Logger output** and **ProgressBar rendering**.

It supports:
- single style
- dual style (0% vs >0%)
- auto style (threshold-based)
- global style
- per-slot style

---

### 🧩 Basic Style Object

```js
{
  color: 'green',
  bg: 'black',
  bold: true,
  dim: false
}
```

#### Properties

| Property | Type | Description |
|---------|------|-------------|
| `color` | `string` | Foreground color name |
| `bg` | `string` | Background color name |
| `bold` | `boolean` | Bold text |
| `dim` | `boolean` | Dim / faded text |

---

### 🎨 Supported Color Names

#### Basic & Bright
```
black, red, green, yellow, blue, magenta, cyan, white
brightBlack, brightRed, brightGreen, brightYellow,
brightBlue, brightMagenta, brightCyan, brightWhite
```

#### Extended (examples)
```
/*Grayscale*/
gray0 gray1 gray2 gray3 gray4 gray5 gray6 gray7 gray8 gray9

/*Soft / Pastel*/
softRed softGreen softYellow softBlue softMagenta softCyan

/*Strong / Vivid*/
orange pink violet teal lime amber

/*Extra / Utility*/
gold sky mint coral indigo brown olive navy maroon aqua chartreuse plum salmon steel sand forest wine slate smoke
```

> All colors work for both `color` and `bg`.

---

### 🟢 Single Style (Always Applied)

```js
style: { color: 'cyan', bold: true }
```

Use case: static label color, consistent emphasis.

---

### 🔵 Dual Style (0% vs >0%)

```js
style: [
  { dim: true },                  // 0%
  { color: 'blue', bold: true }   // >0%
]
```

---

### ⚪ Partial Dual Style (`null` allowed)

```js
style: [
  null,                           // 0%
  { color: 'green', bold: true }  // >0%
]
```

---

### 🤖 Auto Style (Threshold-Based)

```js
style: 'auto'
```

| Percent | Color |
|---------|-------|
| < 50%   | Blue |
| 50–79% | Yellow |
| ≥ 80%  | Red (bold) |

---

### 🌍 Global ProgressBar Style

```js
const log = simpleLog({
  progress: {
    slots: ['🌐 Scraping', '📊 DB Queue'],
    theme: {
      style: { color: 'magenta', bold: true }
    }
  }
})
```

---

### 🎯 Per-Slot Progress Style

```js
const log = simpleLog({
  progress: {
    slots: [
      ['Scraping', { color: 'cyan' }],
      ['DB Queue', 'auto']
      'WEB Queue',
    ]
  }
})
```

---

### 🎨 Combined Example (Global + Slot)

```js
const log = simpleLog({
  progress: {
    slots: [
      ['Scraping', { color: 'cyan' }],
      ['DB Queue', 'auto']
      'WEB Queue',
    ],
    theme: {
      style: { color: 'magenta', bold: true }
    }
  }
})
```

Visual concept:
```
MAGENTA 🌐 Scraping [BLUE ████░░░░░░░░░░░░░░] 30% page 3 MAGENTA
```

---

### ⚠️ Notes

- Styles only affect console output, never file logs
- Colors apply only when `process.stdout.isTTY === true`
- Logger styles and ProgressBar styles are independent by design

---

### ✅ Summary

| Feature | Supported |
|--------|-----------|
| Single style | ✅ |
| Dual style | ✅ |
| Partial dual (`null`) | ✅ |
| Auto style | ✅ |
| Global ProgressBar style | ✅ |
| Per-slot override | ✅ |
| 256-color palette | ✅ |


## 🧩 API Summary

```js
log.log(...args)
log.debug(...args)
log.info(...args)
log.warn(...args)
log.error(...args)

log.updateProgress(name, cur, total, text?)
log.removeProgress(name)
```

---

## 🧠 Architecture

### console.log
```
console.log()
   ↓
 stdout
```

❌ No level  
❌ No file  
❌ No progress  
❌ No safety  

---

### simpleLog
```
simpleLog()
   │
   ├─ Levels (filter)
   ├─ Time formatter
   ├─ Safe stringify
   ├─ ANSI formatter
   ├─ FileSink (txt / jsonl)
   │
   └─ ProgressManager
        └─ ProgressRenderer
             ↓
           stdout (TTY aware)
```

---

## 📂 Project Structure

```
simplelog/
├─ package.json
└─ src/
   ├─ index.js
   ├─ Logger.js
   ├─ Levels.js
   ├─ Formatter.js
   ├─ Stringify.js
   ├─ Time.js
   ├─ FileSink.js
   └─ Progress/
      ├─ ProgressManager.js
      └─ ProgressRenderer.js
```

---

## 🧠 Design Philosophy

- Small core
- Zero dependencies
- Predictable output
- Audit-friendly
- Library-first design

Perfect for:
- CLI tools
- WhatsApp / Telegram bots
- Scrapers
- Workers / queues
- Base libraries (`simpleStore`, `simpleFetch`, etc.)

---

## 🔗 Links

- GitHub  
  https://github.com/renpwn/simpleLog

- NPM  
  https://www.npmjs.com/package/@renpwn/simplelog

---

## 📄 License

MIT © RenPwn
