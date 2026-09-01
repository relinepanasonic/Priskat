const fs = require('fs');
let file = fs.readFileSync('src/app/(public)/camp/[slug]/layout.tsx', 'utf8');

if (!file.includes('Network')) {
  file = file.replace('Map, Calendar, LayoutDashboard, Tent, Users, ChevronLeft', 'Map, Calendar, LayoutDashboard, Tent, Users, ChevronLeft, Network');
}

if (!file.includes('/org-structure')) {
  const tabsTarget = `const tabs = [
    { name: "Coverage", href: \`/camp/\${slug}/coverage\`, icon: Map },`;
  
  const tabsReplacement = `const tabs = [
    { name: "Coverage", href: \`/camp/\${slug}/coverage\`, icon: Map },
    { name: "Org Structure", href: \`/camp/\${slug}/org-structure\`, icon: Network },`;

  file = file.replace(tabsTarget, tabsReplacement);
}

fs.writeFileSync('src/app/(public)/camp/[slug]/layout.tsx', file);
console.log('Updated layout with Org Structure tab');

