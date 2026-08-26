const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

content = content.replace('import InvitePanel from "@/components/layout/InvitePanel";\n', '');
content = content.replace('import InvitePanel from "@/components/layout/InvitePanel";\r\n', '');

content = content.replace('  const [inviteOpen, setInviteOpen] = useState(false);\n', '');
content = content.replace('  const [inviteOpen, setInviteOpen] = useState(false);\r\n', '');

content = content.replace('    {inviteOpen && <InvitePanel onClose={() => setInviteOpen(false)} />}\n', '');
content = content.replace('    {inviteOpen && <InvitePanel onClose={() => setInviteOpen(false)} />}\r\n', '');
content = content.replace('    {inviteOpen && <InvitePanel onClose={() => setInviteOpen(false)} />}', '');

// Using a very forgiving regex for the desktop button
content = content.replace(/<button\s*onClick=\{\(\) => setInviteOpen\(true\)\}[\s\S]*?<span>Invite User<\/span>\s*<\/button>/, '');

// For the mobile button
content = content.replace(/\{String\(profile\?\.role\)\.toLowerCase\(\) === "superadmin" && \(\s*<button onClick=\{\(\) => setInviteOpen\(true\)\}[\s\S]*?<\/button>\s*\)\}/, '');

fs.writeFileSync('src/components/layout/Navbar.tsx', content);

