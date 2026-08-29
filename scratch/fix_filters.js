const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/database/page.tsx',
  'src/app/(public)/camp/alumni-data/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Add state variables
  content = content.replace(
    /const \[filterKota, setFilterKota\] = useState\(""\);/,
    `const [filterKota, setFilterKota] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterAgama, setFilterAgama] = useState("");
  const [filterParoki, setFilterParoki] = useState("");`
  );

  content = content.replace(
    /const \[kotaOptions, setKotaOptions\] = useState<string\[\]>\(\[\]\);/,
    `const [kotaOptions, setKotaOptions] = useState<string[]>([]);
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [agamaOptions, setAgamaOptions] = useState<string[]>([]);
  const [parokiOptions, setParokiOptions] = useState<string[]>([]);`
  );

  // Update fetchFilterOptions
  content = content.replace(
    /select\("group, camp, angkatan, city"\);/,
    `select("branch, cabang, Cabang, group, camp, angkatan, city, agama, parish");`
  );
  
  content = content.replace(
    /setKotaOptions\(Array\.from\(new Set\(data\.map\(d => d\.city\)\.filter\(Boolean\)\)\)\.sort\(\)\);/,
    `setKotaOptions(Array.from(new Set(data.map(d => d.city).filter(Boolean))).sort());
      setBranchOptions(Array.from(new Set(data.map(d => d.branch || d.cabang || d.Cabang || "Bandung").filter(Boolean))).sort());
      setAgamaOptions(Array.from(new Set(data.map(d => d.agama).filter(Boolean))).sort());
      setParokiOptions(Array.from(new Set(data.map(d => d.parish).filter(Boolean))).sort());`
  );

  // Update dependencies
  content = content.replace(
    /\[filterGroup, filterCamp, filterAngkatan, filterKota\]\);/,
    `[filterGroup, filterCamp, filterAngkatan, filterKota, filterBranch, filterAgama, filterParoki]);`
  );

  // Update fetchAlumni queries
  content = content.replace(
    /if \(filterKota\) query = query\.ilike\("city", `%\$\{filterKota\}%`\);/,
    `if (filterKota) query = query.ilike("city", \`%\${filterKota}%\`);
    if (filterAgama) query = query.ilike("agama", \`%\${filterAgama}%\`);
    if (filterParoki) query = query.ilike("parish", \`%\${filterParoki}%\`);
    if (filterBranch) {
      if (filterBranch === "Bandung") {
        query = query.or(\`branch.ilike.%\${filterBranch}%,cabang.ilike.%\${filterBranch}%,Cabang.ilike.%\${filterBranch}%,branch.is.null,cabang.is.null\`);
      } else {
        query = query.or(\`branch.ilike.%\${filterBranch}%,cabang.ilike.%\${filterBranch}%,Cabang.ilike.%\${filterBranch}%\`);
      }
    }`
  );

  // Update UI grid
  content = content.replace(
    /md:grid-cols-4/,
    `md:grid-cols-7`
  );

  // The original UI has 4 divs for filters. Let's replace the whole grid.
  const oldGridRegex = /<div className="grid grid-cols-1 md:grid-cols-7 gap-4">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="overflow-x-auto">/m;
  const newFiltersUI = `<div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Branch</label>
              <select 
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Branches</option>
                {branchOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Group</label>
              <select 
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Groups</option>
                {groupOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Camp</label>
              <select 
                value={filterCamp}
                onChange={(e) => setFilterCamp(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Camps</option>
                {campOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Angkatan</label>
              <select 
                value={filterAngkatan}
                onChange={(e) => setFilterAngkatan(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Angkatan</option>
                {angkatanOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Kota</label>
              <select 
                value={filterKota}
                onChange={(e) => setFilterKota(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Kota</option>
                {kotaOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Agama</label>
              <select 
                value={filterAgama}
                onChange={(e) => setFilterAgama(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Agama</option>
                {agamaOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Paroki</label>
              <select 
                value={filterParoki}
                onChange={(e) => setFilterParoki(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Paroki</option>
                {parokiOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">`;
  
  // Actually, replace by looking for the end of the 4th select block. 
  // It's safer to use regex targeting the entire block.
  content = content.replace(
    /<div className="grid grid-cols-1 md:grid-cols-7 gap-4">([\s\S]*?)<\/select>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="overflow-x-auto">/,
    newFiltersUI
  );

  // If the regex above failed because the original was md:grid-cols-4, let's just do it again cleanly
  let contentClean = fs.readFileSync(file, 'utf8');
  contentClean = contentClean.replace(
    /const \[filterKota, setFilterKota\] = useState\(""\);/,
    `const [filterKota, setFilterKota] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterAgama, setFilterAgama] = useState("");
  const [filterParoki, setFilterParoki] = useState("");`
  );
  contentClean = contentClean.replace(
    /const \[kotaOptions, setKotaOptions\] = useState<string\[\]>\(\[\]\);/,
    `const [kotaOptions, setKotaOptions] = useState<string[]>([]);
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [agamaOptions, setAgamaOptions] = useState<string[]>([]);
  const [parokiOptions, setParokiOptions] = useState<string[]>([]);`
  );
  contentClean = contentClean.replace(
    /select\("group, camp, angkatan, city"\);/,
    `select("branch, cabang, Cabang, group, camp, angkatan, city, agama, parish");`
  );
  contentClean = contentClean.replace(
    /setKotaOptions\(Array\.from\(new Set\(data\.map\(d => d\.city\)\.filter\(Boolean\)\)\)\.sort\(\)\);/,
    `setKotaOptions(Array.from(new Set(data.map(d => d.city).filter(Boolean))).sort());
      setBranchOptions(Array.from(new Set(data.map(d => d.branch || d.cabang || d.Cabang || "Bandung").filter(Boolean))).sort());
      setAgamaOptions(Array.from(new Set(data.map(d => d.agama).filter(Boolean))).sort());
      setParokiOptions(Array.from(new Set(data.map(d => d.parish).filter(Boolean))).sort());`
  );
  contentClean = contentClean.replace(
    /\[filterGroup, filterCamp, filterAngkatan, filterKota\]\);/,
    `[filterGroup, filterCamp, filterAngkatan, filterKota, filterBranch, filterAgama, filterParoki]);`
  );
  contentClean = contentClean.replace(
    /if \(filterKota\) query = query\.ilike\("city", `%\$\{filterKota\}%`\);/,
    `if (filterKota) query = query.ilike("city", \`%\${filterKota}%\`);
    if (filterAgama) query = query.ilike("agama", \`%\${filterAgama}%\`);
    if (filterParoki) query = query.ilike("parish", \`%\${filterParoki}%\`);
    if (filterBranch) {
      if (filterBranch === "Bandung") {
        query = query.or(\`branch.ilike.%\${filterBranch}%,cabang.ilike.%\${filterBranch}%,Cabang.ilike.%\${filterBranch}%,branch.is.null,cabang.is.null\`);
      } else {
        query = query.or(\`branch.ilike.%\${filterBranch}%,cabang.ilike.%\${filterBranch}%,Cabang.ilike.%\${filterBranch}%\`);
      }
    }`
  );
  
  contentClean = contentClean.replace(
    /<div className="grid grid-cols-1 md:grid-cols-4 gap-4">([\s\S]*?)<\/select>\s*<\/div>\s*<\/div>\s*<\/div>\s*(?:<div className="overflow-x-auto">|<DatabaseUploadDialog)/,
    newFiltersUI.replace('<div className="overflow-x-auto">', file.includes('alumni-data') ? '<div className="overflow-x-auto">' : '<DatabaseUploadDialog')
  );
  
  // Manual string replacement for the grid div since Regex with HTML is risky
  const lines = contentClean.split('\n');
  const startIndex = lines.findIndex(l => l.includes('<div className="grid grid-cols-1 md:grid-cols-4 gap-4">'));
  if (startIndex !== -1) {
     let endIndex = -1;
     let depth = 0;
     for (let i = startIndex; i < lines.length; i++) {
        if (lines[i].includes('<div')) depth += (lines[i].match(/<div/g) || []).length;
        if (lines[i].includes('</div')) depth -= (lines[i].match(/<\/div/g) || []).length;
        if (depth === 0) {
            endIndex = i;
            break;
        }
     }
     
     if (endIndex !== -1) {
         lines.splice(startIndex, endIndex - startIndex + 1, newFiltersUI.replace('<div className="overflow-x-auto">', ''));
     }
  }

  fs.writeFileSync(file, lines.join('\n'));
}

