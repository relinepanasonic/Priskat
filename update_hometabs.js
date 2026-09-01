const fs = require('fs');

let file = fs.readFileSync('src/components/home/HomeTabsClient.tsx', 'utf8');

// Add Instagram icon import
file = file.replace(
  'import { Phone, MessageSquare, Tent, Heart, Pencil, Camera, X } from "lucide-react";',
  'import { Phone, MessageSquare, Tent, Heart, Pencil, Camera, X, Instagram } from "lucide-react";'
);

// Replace mobile and waLink with instagram
file = file.replace(
  'const mobile = profile.phone || "";\n  const waLink = `https://wa.me/${mobile.replace(/\\D/g, \'\')}`;',
  'const instagram = profile.instagram || "";'
);

// Replace the action buttons
const oldButtons = `<a href={\`tel:\${mobile}\`} className="h-12 w-12 bg-[#1a1d24]/80 backdrop-blur-md border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <Phone className="h-5 w-5 fill-current" />
          </a>
          <a href={waLink} target="_blank" rel="noreferrer" className="h-12 w-12 bg-[#1a1d24]/80 backdrop-blur-md border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <MessageSquare className="h-5 w-5 fill-current" />
          </a>`;

const newButtons = `
          {instagram && (
            <a href={\`https://instagram.com/\${instagram.replace(/^@/, '')}\`} target="_blank" rel="noreferrer" className="h-12 w-12 bg-[#1a1d24]/80 backdrop-blur-md border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          )}
          <button onClick={() => alert("Private message feature coming soon!")} className="h-12 w-12 bg-[#1a1d24]/80 backdrop-blur-md border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <MessageSquare className="h-5 w-5 fill-current" />
          </button>`;

file = file.replace(oldButtons, newButtons);

// Remove the "Handphone No" section if it exists here, but wait, let's check if it does.
// It seems the phone text section might be in profile/page.tsx

fs.writeFileSync('src/components/home/HomeTabsClient.tsx', file);
console.log('HomeTabsClient updated');

