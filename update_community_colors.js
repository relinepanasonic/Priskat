const fs = require('fs');

const replaceColors = (content) => {
  return content
    .replace(/bg-\[\#1a1d24\]/g, 'bg-brand-bg')
    .replace(/bg-\[\#111\]/g, 'bg-brand-bg')
    .replace(/bg-\[\#0a0d1a\]/g, 'bg-brand-dark')
    .replace(/bg-\[\#2a2d35\]/g, 'bg-brand-surface')
    .replace(/bg-\[\#222\]/g, 'bg-brand-surface')
    .replace(/border-\[\#333\]/g, 'border-brand-border')
    .replace(/border-\[\#2a2d35\]/g, 'border-brand-border')
    .replace(/border-\[\#222\]/g, 'border-brand-border');
};

const files = [
  'src/app/(public)/community/layout.tsx',
  'src/app/(public)/community/friends/FriendsClient.tsx',
  'src/app/(public)/community/thought/ThoughtClient.tsx',
  'src/app/(public)/community/group/GroupClient.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const newContent = replaceColors(content);
    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log(`Updated colors in ${file}`);
    }
  }
});

