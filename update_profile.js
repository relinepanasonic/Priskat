const fs = require('fs');

let file = fs.readFileSync('src/app/(public)/profile/page.tsx', 'utf8');

// Add Instagram icon import
file = file.replace(
  'import { MessageCircle, Phone, Video, Calendar, MapPin, Award, Book, Newspaper, Users, Tent, Settings, LogOut, Heart } from "lucide-react";',
  'import { MessageCircle, Phone, Video, Calendar, MapPin, Award, Book, Newspaper, Users, Tent, Settings, LogOut, Heart, Instagram } from "lucide-react";'
);

// Replace mobile and waLink with instagram
file = file.replace(
  'const mobile = String(alumniData?.mobile || "+6281234567890");\n  const modules = profile.completed_modules?.length ? profile.completed_modules : ["Pria Sejati", "Patriot 19"];\n  const waLink = `https://wa.me/\${mobile.replace(/\\D/g, \'\')}`;',
  'const instagram = profile.instagram || "";\n  const modules = profile.completed_modules?.length ? profile.completed_modules : ["Pria Sejati", "Patriot 19"];'
);

// Replace the top action buttons
const oldTopButtons = `<div className="flex items-center gap-4 mt-6">
              <a href={waLink} target="_blank" rel="noreferrer" className="h-12 w-12 rounded-full bg-brand-surface border border-[#333] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors shadow-lg group">
                <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href={\`tel:\${mobile}\`} className="h-12 w-12 rounded-full bg-brand-surface border border-[#333] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors shadow-lg group">
                <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <button className="h-12 w-12 rounded-full bg-brand-surface border border-[#333] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors shadow-lg group">
                <Video className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>`;

const newTopButtons = `<div className="flex items-center gap-4 mt-6">
              <button onClick={() => alert("Private message feature coming soon!")} className="h-12 w-12 rounded-full bg-brand-surface border border-[#333] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors shadow-lg group">
                <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
              {instagram && (
                <a href={\`https://instagram.com/\${instagram.replace(/^@/, '')}\`} target="_blank" rel="noreferrer" className="h-12 w-12 rounded-full bg-brand-surface border border-[#333] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors shadow-lg group">
                  <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              )}
            </div>`;

file = file.replace(oldTopButtons, newTopButtons);

// Replace Handphone section
const oldPhoneSection = `<div>
              <h3 className="text-sm font-semibold text-brand-gold mb-2 uppercase tracking-wider">Handphone No</h3>
              <div className="bg-[#111] border border-[#333] rounded-xl p-4 flex items-center justify-between">
                <span className="text-white font-medium">{mobile}</span>
                <a href={waLink} target="_blank" rel="noreferrer" className="text-xs bg-[#25d366] text-white px-3 py-1.5 rounded-lg font-bold shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:scale-105 transition-transform">
                  Chat WA
                </a>
              </div>
            </div>`;

const newInstaSection = `{instagram && (
              <div>
                <h3 className="text-sm font-semibold text-brand-gold mb-2 uppercase tracking-wider">Instagram</h3>
                <div className="bg-[#111] border border-[#333] rounded-xl p-4 flex items-center justify-between">
                  <span className="text-white font-medium">{instagram}</span>
                  <a href={\`https://instagram.com/\${instagram.replace(/^@/, '')}\`} target="_blank" rel="noreferrer" className="text-xs bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-[0_0_15px_rgba(225,48,108,0.3)] hover:scale-105 transition-transform">
                    View Profile
                  </a>
                </div>
              </div>
            )}`;

file = file.replace(oldPhoneSection, newInstaSection);

fs.writeFileSync('src/app/(public)/profile/page.tsx', file);
console.log('Profile page updated');

