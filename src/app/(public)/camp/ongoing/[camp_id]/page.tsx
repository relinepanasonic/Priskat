"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckSquare, Calendar, MessageSquare, Plus, Download, Send, Users } from "lucide-react";
import Link from "next/link";

export default function ProductivityDashboard({ params }: { params: Promise<{ camp_id: string }> }) {
  const unwrappedParams = use(params);
  const camp_id = unwrappedParams.camp_id;

  const [activeTab, setActiveTab] = useState<"todo" | "meeting" | "chat" | "crew">("crew");
  const [camp, setCamp] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [crewMembers, setCrewMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewPosition, setNewCrewPosition] = useState("");
  const [newCrewUserId, setNewCrewUserId] = useState("");
  
  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState("all");
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch camp cohort
      const { data: cohort } = await supabase.from("camp_cohorts").select("*").eq("id", camp_id).single();
      if (cohort) setCamp(cohort);

      fetchTasks(supabase);
      fetchMeetings(supabase);
      fetchChats(supabase);
      fetchCrew(supabase);
      fetchAllUsers(supabase);
    }
    fetchData();
  }, [camp_id]);

  const fetchCrew = async (supabase: any) => {
    const { data } = await supabase.from("camp_crew").select("*, profiles:user_id(full_name, username)").eq("cohort_id", camp_id).order("created_at", { ascending: true });
    if (data) setCrewMembers(data);
  };

  const fetchAllUsers = async (supabase: any) => {
    const { data } = await supabase.from("profiles").select("id, full_name, username").limit(500);
    if (data) setAllUsers(data);
  };

  const handleAddCrew = async () => {
    if ((!newCrewName && !newCrewUserId) || !newCrewPosition) return;
    const supabase = createClient();
    
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

  const fetchTasks = async (supabase: any) => {
    const { data } = await supabase.from("camp_tasks").select("*, profiles:assigned_to(full_name)").eq("cohort_id", camp_id).order("due_date", { ascending: true });
    if (data) setTasks(data);
  };

  const fetchMeetings = async (supabase: any) => {
    const { data } = await supabase.from("camp_meetings").select("*").eq("cohort_id", camp_id).order("date_time", { ascending: true });
    if (data) setMeetings(data);
  };

  const fetchChats = async (supabase: any) => {
    const { data } = await supabase.from("camp_chats").select("*, profiles:user_id(full_name)").eq("cohort_id", camp_id).order("created_at", { ascending: true });
    if (data) setChats(data);
  };

  const generateICS = (meeting: any) => {
    const dtStart = new Date(meeting.date_time).toISOString().replace(/-|:|\.\\d+/g, "");
    const dtEnd = new Date(new Date(meeting.date_time).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\\d+/g, "");
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${meeting.title}
DTSTART:${dtStart}
DTEND:${dtEnd}
DESCRIPTION:${meeting.mom_text || ""}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `meeting_${meeting.id}.ics`;
    link.click();
  };

  const sendChat = async () => {
    if (!chatMessage.trim() || !user) return;
    const supabase = createClient();
    await supabase.from("camp_chats").insert({
      cohort_id: camp_id,
      user_id: user.id,
      message: chatMessage,
      target_group: targetGroup
    });
    setChatMessage("");
    fetchChats(supabase);
  };

  if (!camp) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="flex flex-col h-full bg-[#111]">
      <div className="p-6 border-b border-[#333] bg-[#1a1d24]">
        <Link href="/camp/ongoing" className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-semibold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Camps
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">{camp.camp_name === "Other Event" ? camp.custom_name : camp.camp_name} {camp.camp_name !== "Other Event" && <span className="text-brand-gold">Angkatan {camp.angkatan}</span>}</h1>
        <p className="text-gray-400 text-sm">Productivity Dashboard for {camp.branch}</p>
      </div>

      <div className="flex border-b border-[#333] bg-[#1a1d24]">
        <button 
          onClick={() => setActiveTab("todo")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "todo" ? "border-brand-gold text-brand-gold" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          <CheckSquare className="w-4 h-4" /> To Do
        </button>
        <button 
          onClick={() => setActiveTab("meeting")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "meeting" ? "border-brand-gold text-brand-gold" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          <Calendar className="w-4 h-4" /> Meetings
        </button>
        <button 
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "chat" ? "border-brand-gold text-brand-gold" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          <MessageSquare className="w-4 h-4" /> Chat
        </button>
        <button 
          onClick={() => setActiveTab("crew")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "crew" ? "border-brand-gold text-brand-gold" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          <Users className="w-4 h-4" /> Crew
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
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
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name (or leave blank if linking)</label>
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
                <button onClick={handleAddCrew} disabled={(!newCrewName && !newCrewUserId) || !newCrewPosition} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  Add Crew Member
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "todo" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Tasks & Deadlines</h2>
              <button className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-gray-500 italic">No tasks found.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="bg-[#1a1d24] border border-[#333] p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-base">{task.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"} • Assigned to: {task.profiles?.full_name || "Unassigned"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.status === 'done' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#222] text-gray-300 border border-[#444]'}`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "meeting" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Meetings & MoM</h2>
              <button className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Schedule Meeting
              </button>
            </div>
            {meetings.length === 0 ? (
              <p className="text-gray-500 italic">No meetings found.</p>
            ) : (
              meetings.map(meeting => (
                <div key={meeting.id} className="bg-[#1a1d24] border border-[#333] p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-lg">{meeting.title}</h3>
                      <p className="text-brand-gold font-semibold text-sm mt-1">{new Date(meeting.date_time).toLocaleString()}</p>
                    </div>
                    <button onClick={() => generateICS(meeting)} className="bg-[#222] border border-[#444] hover:bg-[#333] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                      <Download className="w-3 h-3" /> Add to Calendar
                    </button>
                  </div>
                  {meeting.mom_text && (
                    <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Minutes of Meeting</h4>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{meeting.mom_text}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Crew Chat</h2>
              <select value={targetGroup} onChange={e => setTargetGroup(e.target.value)} className="bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                <option value="all">All Crew</option>
                <option value="divisi">Same Divisi</option>
                <option value="pic">Camp PIC</option>
              </select>
            </div>
            
            <div className="flex-1 bg-[#1a1d24] border border-[#333] rounded-xl mb-4 p-4 overflow-y-auto space-y-4">
              {chats.length === 0 ? (
                <p className="text-gray-500 italic text-center mt-10">No messages yet. Start the conversation!</p>
              ) : (
                chats.map(chat => (
                  <div key={chat.id} className={`flex flex-col ${chat.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400">{chat.profiles?.full_name || "Unknown"}</span>
                      <span className="text-[10px] text-gray-600">{new Date(chat.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${chat.user_id === user?.id ? 'bg-brand-gold text-brand-dark rounded-br-none font-medium' : 'bg-[#222] text-white border border-[#333] rounded-bl-none'}`}>
                      {chat.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type your message..." 
                className="flex-1 bg-[#1a1d24] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold"
              />
              <button onClick={sendChat} className="bg-brand-gold text-brand-dark px-4 py-3 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition-opacity">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
