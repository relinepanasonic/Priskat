const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

content = content.replace(/\{String\(profile\?\.role\)\.toLowerCase\(\) === "superadmin" && \(\s*<button onClick=\{\(\) => setInviteOpen\(true\)\} className="text-brand-gold hover:opacity-80 transition">\s*<UserPlus className="h-5 w-5" \/>\s*<\/button>\s*\)\}/, '');
content = content.replace(/<button\s*onClick=\{\(\) => setInviteOpen\(true\)\}\s*className="flex items-center gap-3 w-full px-3 py-2\.5 rounded-lg text-xs font-semibold text-brand-gold border border-brand-gold\/30 hover:bg-brand-gold\/10 transition-all"\s*>\s*<UserPlus className="h-4 w-4" \/>\s*<span>Invite User<\/span>\s*<\/button>/, '');

fs.writeFileSync('src/components/layout/Navbar.tsx', content);

