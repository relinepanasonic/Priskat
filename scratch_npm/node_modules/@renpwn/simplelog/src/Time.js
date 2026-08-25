const LOCALES = {
  id: {
    days: ["MIN","SEN","SEL","RAB","KAM","JUM","SAB"],
    mons: ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AGS","SEP","OKT","NOV","DES"]
  },
  en: {
    days: ["SUN","MON","TUE","WED","THU","FRI","SAT"],
    mons: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
  }
}

export function formatTime(locale = 'id', date = new Date()) {
  const l = LOCALES[locale] || LOCALES.id
  const d = date

  return `${l.days[d.getDay()]}|${String(d.getDate()).padStart(2,'0')}.${l.mons[d.getMonth()]}|${d.toTimeString().split(' ')[0]}`
}