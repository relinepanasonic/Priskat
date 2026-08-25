const fs = require('fs');
const path = require('path');

const replacements = [
  // Cards
  { regex: /bg-brand-surface rounded-2xl border border-brand-border/g, replacement: 'card-3d' },
  { regex: /bg-brand-surface rounded-xl border border-brand-border/g, replacement: 'card-3d' },
  { regex: /bg-brand-surface rounded-lg border border-brand-border/g, replacement: 'card-3d' },
  // Inputs
  { regex: /w-full rounded-lg bg-brand-surface border border-brand-border px-4 py-2\.5 text-sm focus:border-brand-gold focus:outline-none text-white/g, replacement: 'w-full input-3d text-sm' },
  { regex: /w-full rounded-lg bg-brand-bg border border-brand-border px-4 py-2\.5 text-brand-light focus:border-brand-gold focus:outline-none/g, replacement: 'w-full input-3d text-sm' },
  { regex: /w-full rounded-lg bg-brand-surface border border-brand-border px-4 py-2\.5 text-sm focus:border-brand-gold focus:outline-none text-brand-light/g, replacement: 'w-full input-3d text-sm' },
  { regex: /w-full rounded-lg bg-brand-bg border border-brand-border px-3 py-2 text-brand-light/g, replacement: 'w-full input-3d text-sm' },
  // Nav
  { regex: /bg-brand-surface border-b border-brand-border/g, replacement: 'bg-brand-bg border-b border-brand-border shadow-3d-sm z-50 relative' }
];

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
  
  replacements.forEach(({regex, replacement}) => {
    newContent = newContent.replace(regex, replacement);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
  }
});

console.log(`Updated ${changedFiles} files with 3D UI classes.`);
