const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Remove InvitePanel import
content = content.replace(/import InvitePanel from "@\/components\/layout\/InvitePanel";\n/, '');

// Remove inviteOpen state
content = content.replace(/  const \[inviteOpen, setInviteOpen\] = useState\(false\);\n/, '');

// Remove InvitePanel rendering
content = content.replace(/      \{inviteOpen && <InvitePanel onClose=\{\(\) => setInviteOpen\(false\)\} \/>\}\n/, '');

// Remove mobile Invite button
const mobileBtnRegex = /        \{String\(profile\?\.role\)\.toLowerCase\(\) === "superadmin" && \(\s*<button onClick=\{\(\) => setInviteOpen\(true\)\} className="text-brand-gold hover:opacity-80 transition">\s*<UserPlus className="h-5 w-5" \/>\s*<\/button>\s*\)\}\n/;
content = content.replace(mobileBtnRegex, '');

// Remove desktop Invite button
const desktopBtnRegex = /            <button\s*onClick=\{\(\) => setInviteOpen\(true\)\}\s*className="flex items-center gap-3 w-full px-3 py-2\.5 rounded-lg text-xs font-semibold text-brand-gold border border-brand-gold\/30 hover:bg-brand-gold\/10 transition-all"\s*>\s*<UserPlus className="h-4 w-4" \/>\s*<span>Invite User<\/span>\s*<\/button>\n/;
content = content.replace(desktopBtnRegex, '');

fs.writeFileSync('src/components/layout/Navbar.tsx', content);

