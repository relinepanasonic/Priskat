const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/camp/crew/page.tsx', 'utf8');

// Remove max-w-7xl mx-auto
content = content.replace(
  'className="p-5 md:p-8 space-y-6 max-w-7xl mx-auto w-full"',
  'className="p-5 md:p-8 space-y-6 w-full"'
);

// Move delete button
// First remove the old delete button block
content = content.replace(
  /\{\s*isSuperadmin && \(\s*<button[^>]*onClick=\{\(e\) => handleDeleteCamp\(e, camp\.id\)\}[^>]*>[\s\S]*?<Trash2[^>]*>[\s\S]*?<\/button>\s*\)\s*\}/,
  ''
);

// Then insert it next to ArrowRight
content = content.replace(
  '<ArrowRight className="w-5 h-5 text-[#555] group-hover:text-brand-gold transition-colors" />',
  \<div className="flex items-center gap-3">
                    {isSuperadmin && (
                      <button 
                        onClick={(e) => handleDeleteCamp(e, camp.id)}
                        className="p-1.5 text-white/50 hover:text-brand-gold transition-colors hover:bg-brand-gold/10 rounded-md"
                        title="Delete Camp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ArrowRight className="w-5 h-5 text-[#555] group-hover:text-brand-gold transition-colors" />
                  </div>\
);

fs.writeFileSync('src/app/(public)/camp/crew/page.tsx', content);
