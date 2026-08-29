const fs = require('fs');

// 1. src/app/(auth)/register/page.tsx
let registerCode = fs.readFileSync('src/app/(auth)/register/page.tsx', 'utf8');
registerCode = registerCode.replace(
  'const { data } = await supabase.from("branches").select("kota");',
  'const { data } = await supabase.from("branches").select("branch");'
);
registerCode = registerCode.replace(
  'if (data) setBranches(Array.from(new Set(data.map(d => d.kota).filter(Boolean))).sort());',
  'if (data) setBranches(Array.from(new Set(data.map(d => d.branch || d.kota).filter(Boolean))).sort());'
);
fs.writeFileSync('src/app/(auth)/register/page.tsx', registerCode);

// 2. src/components/profile/JourneyEditClient.tsx
let journeyCode = fs.readFileSync('src/components/profile/JourneyEditClient.tsx', 'utf8');
journeyCode = journeyCode.replace(
  'const { data } = await supabase.from("branches").select("kota");',
  'const { data } = await supabase.from("branches").select("branch, kota");'
);
journeyCode = journeyCode.replace(
  'setKotaOptions(Array.from(new Set(data.map(d => d.kota).filter(Boolean))).sort());',
  'setKotaOptions(Array.from(new Set(data.map(d => d.branch || d.kota).filter(Boolean))).sort());'
);
fs.writeFileSync('src/components/profile/JourneyEditClient.tsx', journeyCode);

// 3. src/components/profile/ServicesEditClient.tsx
let servicesCode = fs.readFileSync('src/components/profile/ServicesEditClient.tsx', 'utf8');
servicesCode = servicesCode.replace(
  'const { data } = await supabase.from("branches").select("kota");',
  'const { data } = await supabase.from("branches").select("branch, kota");'
);
servicesCode = servicesCode.replace(
  'setKotaOptions(Array.from(new Set(data.map(d => d.kota).filter(Boolean))).sort());',
  'setKotaOptions(Array.from(new Set(data.map(d => d.branch || d.kota).filter(Boolean))).sort());'
);
fs.writeFileSync('src/components/profile/ServicesEditClient.tsx', servicesCode);

// 4. src/app/admin/database/branch/page.tsx
let branchCode = fs.readFileSync('src/app/admin/database/branch/page.tsx', 'utf8');
branchCode = branchCode.replace(
  '<th className="px-4 py-3">Negara</th>\n                  <th className="px-4 py-3">Provinsi</th>\n                  <th className="px-4 py-3">Kota (Branch)</th>',
  '<th className="px-4 py-3">Branch</th>\n                  <th className="px-4 py-3">Kota</th>\n                  <th className="px-4 py-3">Provinsi</th>\n                  <th className="px-4 py-3">Negara</th>'
);
branchCode = branchCode.replace(
  '<td className="px-4 py-3">{row.negara}</td>\n                      <td className="px-4 py-3">{row.provinsi}</td>\n                      <td className="px-4 py-3 font-semibold text-brand-gold">{row.kota}</td>',
  '<td className="px-4 py-3 font-semibold text-brand-gold">{row.branch || "-"}</td>\n                      <td className="px-4 py-3">{row.kota}</td>\n                      <td className="px-4 py-3">{row.provinsi}</td>\n                      <td className="px-4 py-3">{row.negara}</td>'
);
fs.writeFileSync('src/app/admin/database/branch/page.tsx', branchCode);

console.log("Done");

