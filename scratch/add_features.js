const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/database/page.tsx',
  'src/app/(public)/camp/alumni-data/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Strict Angkatan filter
  content = content.replace(
    /if \(filterAngkatan\) query = query\.ilike\("angkatan", `%\$\{filterAngkatan\}%`\);/,
    `if (filterAngkatan) query = query.eq("angkatan", filterAngkatan);`
  );

  // 2. Add Sort Config state & Export function & icons
  if (!content.includes('ChevronUp')) {
    content = content.replace(
      /import { Database, Filter, Plus } from "lucide-react";/,
      `import { Database, Filter, Plus, ChevronUp, ChevronDown, ChevronsUpDown, Download } from "lucide-react";`
    );
  }

  if (!content.includes('sortConfig')) {
    content = content.replace(
      /const \[data, setData\] = useState<any\[\]>\(\[\]\);/,
      `const [data, setData] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);`
    );
  }

  if (!content.includes('handleSort')) {
    const sortCode = `
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Special case for branch fallback
        if (sortConfig.key === 'branch') {
           valA = a.branch || a.cabang || a.Cabang || "Bandung";
           valB = b.branch || b.cabang || b.Cabang || "Bandung";
        }

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';
        
        // Number comparison for angkatan if possible
        if (sortConfig.key === 'angkatan') {
           const numA = Number(valA);
           const numB = Number(valB);
           if (!isNaN(numA) && !isNaN(numB)) {
              return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
           }
        }
        
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  };

  const sortedData = getSortedData();

  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    
    const headers = ["Branch", "Group", "Camp", "Angkatan", "Nama", "City / Kota", "No Handphone", "Paroki", "Agama"];
    const csvRows = [headers.join(",")];
    
    for (const row of sortedData) {
      const branch = row.branch || row.cabang || row.Cabang || "Bandung";
      const values = [
        \`"\${branch}"\`,
        \`"\${row.group || ''}"\`,
        \`"\${row.camp || ''}"\`,
        \`"\${row.angkatan || ''}"\`,
        \`"\${row.name || ''}"\`,
        \`"\${row.city || ''}"\`,
        \`"\${row.mobile || row.phone || ''}"\`,
        \`"\${row.parish || ''}"\`,
        \`"\${row.agama || ''}"\`
      ];
      csvRows.push(values.join(","));
    }
    
    const csvData = new Blob([csvRows.join("\\n")], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.download = \`alumni_data_\${new Date().toISOString().split('T')[0]}.csv\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;
    // Insert after fetchAlumni / useEffect block
    content = content.replace(
      /return \(\s*<div className="space-y-6/,
      `${sortCode}\n  return (\n    <div className="space-y-6`
    );
  }

  // 3. Update Table Headers
  const buildTh = (label, key) => {
    return `<th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('${key}')}
                >
                  <div className="flex items-center gap-1">
                    ${label}
                    {sortConfig?.key === '${key}' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>`;
  };

  content = content.replace(
    /<tr>\s*<th className="px-4 py-3 whitespace-nowrap">Branch<\/th>[\s\S]*?<th className="px-4 py-3 whitespace-nowrap">Paroki<\/th>\s*<\/tr>/,
    `<tr>
                ${buildTh('Branch', 'branch')}
                ${buildTh('Group', 'group')}
                ${buildTh('Camp', 'camp')}
                ${buildTh('Angkatan', 'angkatan')}
                ${buildTh('Nama', 'name')}
                ${buildTh('City / Kota', 'city')}
                ${buildTh('No Handphone', 'mobile')}
                ${buildTh('Paroki', 'parish')}
              </tr>`
  );

  // 4. Use sortedData in the map
  content = content.replace(
    /data\.map\(\(row\)/,
    `sortedData.map((row)`
  );

  // 5. Add Export CSV Button to header
  // Find where "Records Found: {data.length}" is or where it makes sense to add the button.
  // There is a div: <div className="px-5 py-4 border-b border-[#333] bg-[#111] flex justify-between items-center">
  if (!content.includes('handleExportCSV')) {
    // Already added the function above, now add the button
  }
  content = content.replace(
    /<h2 className="text-sm font-bold text-white">Records Found: \{data\.length\}<\/h2>\s*<\/div>/,
    `<h2 className="text-sm font-bold text-white">Records Found: {data.length}</h2>
          </div>
          <button 
            onClick={handleExportCSV}
            className="mr-5 my-2 bg-[#222] text-white border border-[#444] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#333] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>`
  );
  // Wait, the flex container needs to handle the button properly.
  content = content.replace(
    /<div className="px-5 py-4 border-b border-\[#333\] bg-\[#111\] flex justify-between items-center">\s*<div>\s*<h2 className="text-sm font-bold text-white">Records Found: \{data\.length\}<\/h2>\s*<\/div>\s*<\/div>/,
    `<div className="px-5 py-4 border-b border-[#333] bg-[#111] flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white">Records Found: {data.length}</h2>
          </div>
          <button 
            onClick={handleExportCSV}
            className="bg-[#222] text-white border border-[#444] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#333] transition-colors flex items-center gap-2"
          >
            <Download className="w-3 h-3" /> Export CSV
          </button>
        </div>`
  );

  // Fallback for button replacement in case the regex doesn't match perfectly
  if (!content.includes('Export CSV')) {
     content = content.replace(
       /<div>\s*<h2 className="text-sm font-bold text-white">Records Found: \{data\.length\}<\/h2>\s*<\/div>/,
       `<div>
            <h2 className="text-sm font-bold text-white">Records Found: {data.length}</h2>
          </div>
          <button 
            onClick={handleExportCSV}
            className="bg-[#222] text-white border border-[#444] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#333] transition-colors flex items-center gap-2"
          >
            <Download className="w-3 h-3" /> Export CSV
          </button>`
     );
  }

  fs.writeFileSync(file, content);
}

