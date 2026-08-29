const fs = require('fs');

const files = [
  'src/app/admin/database/page.tsx',
  'src/app/(public)/camp/alumni-data/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. 3-click sorting UX
  const oldSortCode = `  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };`;

  const newSortCode = `  const handleSort = (key: string) => {
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' });
      } else {
        setSortConfig(null);
      }
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };`;

  if (content.includes(oldSortCode)) {
    content = content.replace(oldSortCode, newSortCode);
  }

  // Add nickname, parish_Cabang to SELECT
  content = content.replace(
    /select\("\*"\)/g,
    `select("*")` // already selecting * in fetchAlumni
  );
  // Actually wait, for exportCSV we should add Nama Panggilan.
  content = content.replace(
    /const headers = \["Branch", "Group", "Camp", "Angkatan", "Nama", "City \/ Kota", "No Handphone", "Paroki", "Agama"\];/,
    `const headers = ["Branch", "Group", "Camp", "Angkatan", "Nama", "Nama Panggilan", "City / Kota", "No Handphone", "Paroki", "Agama"];`
  );
  content = content.replace(
    /const values = \[\s*\`"\$\{branch\}"\`,\s*\`"\$\{row\.group \|\| ''\}"\`,\s*\`"\$\{row\.camp \|\| ''\}"\`,\s*\`"\$\{row\.angkatan \|\| ''\}"\`,\s*\`"\$\{row\.name \|\| ''\}"\`,\s*\`"\$\{row\.city \|\| ''\}"\`,\s*\`"\$\{row\.mobile \|\| row\.phone \|\| ''\}"\`,\s*\`"\$\{row\.parish \|\| ''\}"\`,\s*\`"\$\{row\.agama \|\| ''\}"\`\s*\];/s,
    `const values = [
        \`"\${branch}"\`,
        \`"\${row.group || ''}"\`,
        \`"\${row.camp || ''}"\`,
        \`"\${row.angkatan || ''}"\`,
        \`"\${row.name || ''}"\`,
        \`"\${row.nickname || ''}"\`,
        \`"\${row.city || ''}"\`,
        \`"\${row.mobile || row.phone || ''}"\`,
        \`"\${row.parish_grouping || row.parish_Cabang || row.parish || ''}"\`,
        \`"\${row.agama || ''}"\`
      ];`
  );


  // Add Nama Panggilan to table header (after Nama)
  // Re-build headers string
  const newHeaders = `<tr>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('branch')}
                >
                  <div className="flex items-center gap-1">
                    Branch
                    {sortConfig?.key === 'branch' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('group')}
                >
                  <div className="flex items-center gap-1">
                    Group
                    {sortConfig?.key === 'group' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('camp')}
                >
                  <div className="flex items-center gap-1">
                    Camp
                    {sortConfig?.key === 'camp' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('angkatan')}
                >
                  <div className="flex items-center gap-1">
                    Angkatan
                    {sortConfig?.key === 'angkatan' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nama
                    {sortConfig?.key === 'name' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('nickname')}
                >
                  <div className="flex items-center gap-1">
                    Nama Panggilan
                    {sortConfig?.key === 'nickname' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center gap-1">
                    City / Kota
                    {sortConfig?.key === 'city' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('mobile')}
                >
                  <div className="flex items-center gap-1">
                    No Handphone
                    {sortConfig?.key === 'mobile' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('parish')}
                >
                  <div className="flex items-center gap-1">
                    Paroki
                    {sortConfig?.key === 'parish' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
              </tr>`;

  // Find the exact table header and replace it safely
  const headStart = content.indexOf('<tr>');
  const headEnd = content.indexOf('</tr>', headStart) + 5;
  content = content.slice(0, headStart) + newHeaders + content.slice(headEnd);

  // Update table row mapping (add Nama Panggilan, update Paroki)
  content = content.replace(
    /<td className="px-4 py-2.5 whitespace-nowrap font-semibold text-white">\{row\.name\}<\/td>/,
    `<td className="px-4 py-2.5 whitespace-nowrap font-semibold text-white">{row.name}</td>\n                    <td className="px-4 py-2.5 whitespace-nowrap">{row.nickname}</td>`
  );

  content = content.replace(
    /<td className="px-4 py-2\.5 whitespace-nowrap">\{row\.parish\}<\/td>/,
    `<td className="px-4 py-2.5 whitespace-nowrap">{row.parish_grouping || row.parish_Cabang || row.parish}</td>`
  );

  content = content.replace(
    /colSpan=\{8\}/g,
    `colSpan={9}`
  );

  fs.writeFileSync(file, content);
}

