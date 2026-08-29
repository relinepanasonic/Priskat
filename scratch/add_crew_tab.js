const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/camp/ongoing/[camp_id]/page.tsx', 'utf8');

// Add "crew" to activeTab state
content = content.replace(
  'const [activeTab, setActiveTab] = useState<"todo" | "meeting" | "chat">("todo");',
  'const [activeTab, setActiveTab] = useState<"todo" | "meeting" | "chat" | "crew">("crew");\n  const [crewMembers, setCrewMembers] = useState<any[]>([]);\n  const [allUsers, setAllUsers] = useState<any[]>([]);\n  const [newCrewName, setNewCrewName] = useState("");\n  const [newCrewPosition, setNewCrewPosition] = useState("");\n  const [newCrewUserId, setNewCrewUserId] = useState("");'
);

// Add users icon to imports
content = content.replace(
  'import { ArrowLeft, CheckSquare, Calendar, MessageSquare, Plus, Download, Send } from "lucide-react";',
  'import { ArrowLeft, CheckSquare, Calendar, MessageSquare, Plus, Download, Send, Users } from "lucide-react";'
);

// Add fetchCrew to useEffect
content = content.replace(
  'fetchChats(supabase);\n    }',
  'fetchChats(supabase);\n      fetchCrew(supabase);\n      fetchAllUsers(supabase);\n    }'
);

// Add fetch functions
const fetchFunctions = \
  const fetchCrew = async (supabase: any) => {
    const { data } = await supabase.from("camp_crew").select("*, profiles:user_id(full_name, username)").eq("cohort_id", camp_id).order("created_at", { ascending: true });
    if (data) setCrewMembers(data);
  };

  const fetchAllUsers = async (supabase: any) => {
    const { data } = await supabase.from("profiles").select("id, full_name, username").limit(500);
    if (data) setAllUsers(data);
  };

  const handleAddCrew = async () => {
    if (!newCrewName || !newCrewPosition) return;
    const supabase = createClient();
    
    // Automatically use linked user's name if they selected one and left name blank
    let finalName = newCrewName;
    if (newCrewUserId && !newCrewName) {
      const u = allUsers.find(x => x.id === newCrewUserId);
      if (u) finalName = u.full_name;
    }

    await supabase.from("camp_crew").insert({
      cohort_id: camp_id,
      branch: camp.branch,
      camp: camp.camp_name,
      angkatan: camp.angkatan,
      name: finalName,
      position: newCrewPosition,
      user_id: newCrewUserId || null
    });
    
    setNewCrewName("");
    setNewCrewPosition("");
    setNewCrewUserId("");
    fetchCrew(supabase);
  };
\;
content = content.replace('const fetchTasks = async (supabase: any) => {', fetchFunctions + '\n  const fetchTasks = async (supabase: any) => {');

// Add Crew tab button
content = content.replace(
  '<MessageSquare className="w-4 h-4" /> Chat\\n        </button>\\n      </div>',
  \<MessageSquare className="w-4 h-4" /> Chat
        </button>
        <button 
          onClick={() => setActiveTab("crew")}
          className={\\\lex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 \\\\}
        >
          <Users className="w-4 h-4" /> Crew
        </button>
      </div>\
);

// Add Crew tab content
const crewTabContent = \
        {activeTab === "crew" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Camp Crew Members</h2>
              <div className="bg-[#1a1d24] border border-[#333] rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs uppercase bg-[#111] text-gray-400 border-b border-[#333]">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Position</th>
                      <th className="px-4 py-3">Linked Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333]">
                    {crewMembers.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No crew members found.</td></tr>
                    ) : (
                      crewMembers.map(crew => (
                        <tr key={crew.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{crew.name}</td>
                          <td className="px-4 py-3 text-brand-gold">{crew.position}</td>
                          <td className="px-4 py-3">
                            {crew.profiles ? (
                              <span className="bg-[#222] px-2 py-1 rounded text-xs border border-[#444]">@{crew.profiles.username}</span>
                            ) : (
                              <span className="text-gray-500 italic text-xs">Unlinked</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#111] border border-[#333] rounded-xl p-5 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-brand-gold" /> Add New Crew Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name</label>
                  <input value={newCrewName} onChange={e => setNewCrewName(e.target.value)} type="text" placeholder="Crew Name" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Position</label>
                  <input value={newCrewPosition} onChange={e => setNewCrewPosition(e.target.value)} type="text" placeholder="e.g. Fasilitator" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Link Account (Optional)</label>
                  <select 
                    value={newCrewUserId} 
                    onChange={e => setNewCrewUserId(e.target.value)}
                    className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="">-- No Account Connected --</option>
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={handleAddCrew} disabled={!newCrewName && !newCrewUserId || !newCrewPosition} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  Add Crew Member
                </button>
              </div>
            </div>
          </div>
        )}
\;

content = content.replace(
  '{activeTab === "todo" && (',
  crewTabContent + '\n        {activeTab === "todo" && ('
);

fs.writeFileSync('src/app/(public)/camp/ongoing/[camp_id]/page.tsx', content);
