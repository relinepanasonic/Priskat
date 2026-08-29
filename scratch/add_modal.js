const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/camp/crew/page.tsx', 'utf8');

content = content.replace(
  'import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";',
  'import { ChevronUp, ChevronDown, ChevronsUpDown, Plus } from "lucide-react";\nimport AddCampModal from "@/components/camp/AddCampModal";'
);

content = content.replace(
  'const [isLoading, setIsLoading] = useState(true);',
  'const [isLoading, setIsLoading] = useState(true);\n  const [isAddModalOpen, setIsAddModalOpen] = useState(false);\n  const [isSuperadmin, setIsSuperadmin] = useState(false);'
);

content = content.replace(
  'const { data: crewData, error } = await supabase',
  \const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile && (profile.role === "superadmin" || profile.role === "admin")) setIsSuperadmin(true);
      }
      const { data: crewData, error } = await supabase\
);

content = content.replace(
  '<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 pt-4">\\n        <div>\\n          <h2 className="text-xl font-bold text-white">Camp Crew</h2>\\n          <p className="text-sm text-brand-muted mt-1">Directory of all camp crew members.</p>\\n        </div>\\n      </div>',
  \<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 pt-4">
        <div>
          <h2 className="text-xl font-bold text-white">Camp Crew</h2>
          <p className="text-sm text-brand-muted mt-1">Directory of all camp crew members.</p>
        </div>
        {isSuperadmin && (
          <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add New Camp
          </button>
        )}
      </div>\
);

// Fallback for the regex replacement above if whitespace is slightly different
if (!content.includes('Add New Camp')) {
  content = content.replace(
    /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 pt-4">[\s\S]*?<\/div>\s*<\/div>/,
    \<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 pt-4">
        <div>
          <h2 className="text-xl font-bold text-white">Camp Crew</h2>
          <p className="text-sm text-brand-muted mt-1">Directory of all camp crew members.</p>
        </div>
        {isSuperadmin && (
          <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add New Camp
          </button>
        )}
      </div>\
  );
}

content = content.replace(
  '</div>\n  );\n}',
  \</div>
      <AddCampModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => window.location.reload()} />
    </div>
  );
}\
);

fs.writeFileSync('src/app/(public)/camp/crew/page.tsx', content);
