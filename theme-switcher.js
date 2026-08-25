const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-white': 'bg-brand-surface',
  'text-stone-900': 'text-white',
  'text-stone-800': 'text-white',
  'text-stone-700': 'text-brand-light',
  'text-stone-600': 'text-brand-light',
  'text-stone-500': 'text-brand-muted',
  'text-stone-400': 'text-brand-muted',
  'border-stone-100': 'border-brand-border',
  'border-stone-200': 'border-brand-border',
  'bg-stone-50': 'bg-brand-surface-hover',
  'bg-stone-100': 'bg-brand-surface-hover',
  'bg-brand-blue-50': 'bg-brand-bg',
  'bg-brand-blue-100': 'bg-brand-bg',
  'text-brand-blue': 'text-brand-gold',
  'bg-brand-blue': 'bg-brand-gold text-brand-dark',
  'hover:bg-brand-blue-800': 'hover:bg-brand-gold-hover',
  'text-stone-300': 'text-brand-muted',
  'bg-stone-200': 'bg-brand-border',
  'text-stone-200': 'text-brand-muted',
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'src'));

let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    newContent = newContent.replace(regex, value);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
  }
});

console.log(`Updated ${changedFiles} files.`);
