const fs = require('fs');
let content = fs.readFileSync('src/app/admin/members/page.tsx', 'utf8');

const importStatement = `import AdminMemberEditDialog from "@/components/admin/AdminMemberEditDialog";
import InviteUserButton from "@/components/admin/InviteUserButton";`;

content = content.replace('import AdminMemberEditDialog from "@/components/admin/AdminMemberEditDialog";', importStatement);

const headerReplacement = `<div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-sm text-brand-muted">{members?.length ?? 0} total members</p>
        </div>
        <InviteUserButton />
      </div>`;

content = content.replace(/<div className="mb-6">\s*<h1 className="text-2xl font-bold text-white">Members<\/h1>\s*<p className="text-sm text-brand-muted">\{members\?\.length \?\? 0\} total members<\/p>\s*<\/div>/m, headerReplacement);

fs.writeFileSync('src/app/admin/members/page.tsx', content);

