const fs = require('fs');
let content = fs.readFileSync('src/app/admin/database/page.tsx', 'utf8');

// We need to add state for the unique filter options
const optionsState = `  const [filterGroup, setFilterGroup] = useState("");
  const [filterCamp, setFilterCamp] = useState("");
  const [filterAngkatan, setFilterAngkatan] = useState("");
  const [filterKota, setFilterKota] = useState("");

  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [campOptions, setCampOptions] = useState<string[]>([]);
  const [angkatanOptions, setAngkatanOptions] = useState<string[]>([]);
  const [kotaOptions, setKotaOptions] = useState<string[]>([]);

  const fetchFilterOptions = async () => {
    const supabase = await import("@/lib/supabase/client").then(m => m.createClient());
    const { data } = await supabase.from("alumni_database").select("group, camp, angkatan, city");
    if (data) {
      setGroupOptions(Array.from(new Set(data.map(d => d.group).filter(Boolean))).sort());
      setCampOptions(Array.from(new Set(data.map(d => d.camp).filter(Boolean))).sort());
      setAngkatanOptions(Array.from(new Set(data.map(d => String(d.angkatan)).filter(Boolean))).sort((a, b) => Number(a) - Number(b)));
      setKotaOptions(Array.from(new Set(data.map(d => d.city).filter(Boolean))).sort());
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);
`;

content = content.replace(
  /  const \[filterGroup, setFilterGroup\] = useState\(""\);\n  const \[filterCamp, setFilterCamp\] = useState\(""\);\n  const \[filterAngkatan, setFilterAngkatan\] = useState\(""\);\n  const \[filterKota, setFilterKota\] = useState\(""\);\n/m,
  optionsState
);

// We need to replace the input fields with selects
const filterInputsRegex = /<div className="grid grid-cols-1 md:grid-cols-4 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<div className="bg-\[#1a1d24\]/m;

const filterSelects = `<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Group</label>
            <select 
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
            >
              <option value="">All Groups</option>
              {groupOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
              {campOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
              {angkatanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
              {kotaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1d24]`;

content = content.replace(filterInputsRegex, filterSelects);

// Because I used ilike with %, if we match an exact dropdown value, we can use exact match or keep ilike. 
// Keeping ilike is fine for exact match from dropdown too since the strings will match perfectly (assuming no wildcard chars in the strings).
// Wait, ilike works perfectly fine for exact matches. So we don't need to change the fetch logic.

fs.writeFileSync('src/app/admin/database/page.tsx', content);

