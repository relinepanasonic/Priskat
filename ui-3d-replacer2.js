const fs = require('fs');
const path = require('path');

const replacements = [
  // Cards generic
  { regex: /rounded-2xl overflow-hidden border border-brand-border bg-brand-surface/g, replacement: 'card-3d overflow-hidden' },
  { regex: /rounded-2xl border border-brand-border bg-brand-surface/g, replacement: 'card-3d' },
  { regex: /rounded-xl border border-brand-border bg-brand-surface/g, replacement: 'card-3d' },
  { regex: /bg-brand-surface rounded-xl border border-brand-border/g, replacement: 'card-3d' },
  { regex: /bg-brand-surface rounded-2xl border border-brand-border/g, replacement: 'card-3d' },
  { regex: /bg-brand-surface shadow-sm/g, replacement: 'card-3d' },
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

console.log(`Updated ${changedFiles} files with 3D UI classes (Round 2).`);

