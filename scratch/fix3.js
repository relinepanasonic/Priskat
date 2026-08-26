const fs = require('fs');
let content = fs.readFileSync('src/app/admin/database/page.tsx', 'utf8');

content = content.replace(
  /<div className="px-5 py-4 border-b border-\[#333\] bg-\[#111\] flex justify-between items-center">\s*<h2 className="text-sm font-bold text-white">Preview Data \(\{rows\.length\} rows\)<\/h2>\s*<\/div>/,
  `<div className="px-5 py-4 border-b border-[#333] bg-[#111] flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Preview Data ({rows.length} rows)</h2>
            <button 
                className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2"
                onClick={handleSaveToDatabase}
                disabled={isSaving}
             >
                {isSaving ? "Saving..." : "Save to Database"}
             </button>
          </div>`
);

content = content.replace(
  /          <div className="p-5 bg-\[#111\] border-t border-\[#333\] flex justify-end">\s*<button[\s\S]*?<\/button>\s*<\/div>\s*/m,
  ''
);

// Add a button to navigate to the viewer
content = content.replace(
  /<p className="mt-1 text-sm text-brand-muted">\s*Filter and upload CSV data to the database\.\s*<\/p>/,
  `<p className="mt-1 text-sm text-brand-muted">
          Filter and upload CSV data to the database.
        </p>
      </div>
      <div className="flex justify-end">
        <a href="/admin/database/view" className="bg-[#111] text-white border border-[#333] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1a1d24] transition-colors">
          View Database Records
        </a>`
);

fs.writeFileSync('src/app/admin/database/page.tsx', content);

