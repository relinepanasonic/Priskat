const fs = require('fs');
let content = fs.readFileSync('src/app/admin/database/branch/page.tsx', 'utf8');

content = content.replace(
  'import { Plus, Loader2 } from "lucide-react";',
  'import { Plus, Loader2 } from "lucide-react";\nimport AddBranchModal from "@/components/admin/AddBranchModal";'
);

content = content.replace(
  'const [isLoading, setIsLoading] = useState(true);',
  'const [isLoading, setIsLoading] = useState(true);\n  const [isAddOpen, setIsAddOpen] = useState(false);'
);

content = content.replace(
  '<button className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-400">\\n            <Plus className="h-4 w-4" /> Add Branch\\n          </button>',
  \<button onClick={() => setIsAddOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-400">
            <Plus className="h-4 w-4" /> Add Branch
          </button>\
);

// Fallback regex
if (!content.includes('setIsAddOpen(true)')) {
  content = content.replace(
    /<button className="bg-brand-gold.*?Add Branch.*?<\/button>/s,
    \<button onClick={() => setIsAddOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-400">
            <Plus className="h-4 w-4" /> Add Branch
          </button>\
  );
}

content = content.replace(
  '</div>\n  );\n}',
  \</div>
      <AddBranchModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={() => window.location.reload()} />
    </div>
  );
}\
);

fs.writeFileSync('src/app/admin/database/branch/page.tsx', content);
