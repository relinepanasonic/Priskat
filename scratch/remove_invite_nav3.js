const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// 1. Remove imports and state
content = content.replace(/import InvitePanel from "@\/components\/layout\/InvitePanel";\r?\n/, '');
content = content.replace(/  const \[inviteOpen, setInviteOpen\] = useState\(false\);\r?\n/, '');
content = content.replace(/    \{inviteOpen && <InvitePanel onClose=\{\(\) => setInviteOpen\(false\)\} \/>\}\r?\n/, '');

// 2. Remove mobile button
const mobileBtn = `{String(profile?.role).toLowerCase() === "superadmin" && (
          <button onClick={() => setInviteOpen(true)} className="text-brand-gold hover:opacity-80 transition">
            <UserPlus className="h-5 w-5" />
          </button>
        )}`;
content = content.replace(mobileBtn, '');

// 3. Remove desktop button
const desktopBtn = `<button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite User</span>
            </button>`;
content = content.replace(desktopBtn, '');

fs.writeFileSync('src/components/layout/Navbar.tsx', content);

