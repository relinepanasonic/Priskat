const fs = require('fs');
let content = fs.readFileSync('src/app/admin/database/page.tsx', 'utf8');

// Add import
content = content.replace(
  'import { Database, Filter, Plus, ChevronUp, ChevronDown, ChevronsUpDown, Download } from "lucide-react";',
  'import { Database, Filter, Plus, ChevronUp, ChevronDown, ChevronsUpDown, Download } from "lucide-react";\nimport DatabaseUploadDialog from "@/components/admin/DatabaseUploadDialog";'
);

// Add state
content = content.replace(
  'const [isLoading, setIsLoading] = useState(true);',
  'const [isLoading, setIsLoading] = useState(true);\n  const [isUploadOpen, setIsUploadOpen] = useState(false);'
);

// Add button
content = content.replace(
  '<div>\n          <h2 className="text-xl font-bold text-white flex items-center gap-2">Alumni Directory</h2>\n          \n        </div>',
  `<div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">Alumni Directory</h2>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-brand-gold text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add New Database
        </button>`
);

// Add dialog
content = content.replace(
  '</div>\n  );\n}',
  `  <DatabaseUploadDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}`
);

fs.writeFileSync('src/app/admin/database/page.tsx', content);

