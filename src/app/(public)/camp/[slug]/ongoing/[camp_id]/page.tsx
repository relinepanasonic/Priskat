"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckSquare, Calendar, CalendarPlus, MessageSquare, Plus, Send, Users, Pencil, Trash2, Wallet, UserCheck, QrCode, Megaphone, Info } from "lucide-react";
import { usePathname } from "next/navigation";
import CampFinance from "@/components/camp/CampFinance";
import { isCampSeries } from "@/lib/campTypes";
import { CREW_ROLES, isKnownRole, roleOrder } from "@/lib/crewRoles";
import PesertaSection from "@/components/events/workspace/PesertaSection";
import QrSection from "@/components/events/workspace/QrSection";
import PromosiSection from "@/components/events/workspace/PromosiSection";
import AboutSection from "@/components/events/workspace/AboutSection";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function ProductivityDashboard({ params }: { params: Promise<{ slug: string; camp_id: string }> }) {
  const unwrappedParams = use(params);
  const camp_id = unwrappedParams.camp_id;
  const slug = unwrappedParams.slug;

  const [activeTab, setActiveTab] = useState<"peserta" | "tentang" | "qr" | "promosi" | "todo" | "meeting" | "chat" | "crew" | "keuangan">("peserta");
  const inAdmin = usePathname().startsWith("/admin");
  const [camp, setCamp] = useState<any>(null);
  const [linkedEventId, setLinkedEventId] = useState<string | null>(null);
  const [linkedEventTitle, setLinkedEventTitle] = useState("");
  const [othersMode, setOthersMode] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [crewMembers, setCrewMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [crewFocus, setCrewFocus] = useState(false);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewPosition, setNewCrewPosition] = useState("");
  const [newCrewUserId, setNewCrewUserId] = useState("");
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);
  
  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState("all");
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingDateTime, setNewMeetingDateTime] = useState("");
  const [newMeetingMom, setNewMeetingMom] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  // who may change Belum bayar / Lunas: Ketua, Wakil Ketua, Sekretaris, Bendahara of this event (and site admins); the database checks it too
  const canMarkPaid = ["founder", "superadmin", "admin"].includes(String(myProfile?.role ?? "").toLowerCase()) ||
    crewMembers.some((c) => c.user_id && c.user_id === user?.id && ["ketua", "wakil ketua", "sekretaris", "sekertaris", "bendahara"].includes(String(c.position ?? "").trim().toLowerCase()));

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("full_name, username, role").eq("id", user.id).single();
        if (profile) setMyProfile(profile);
      }

      // Fetch camp cohort
      const { data: cohort } = await supabase.from("camp_cohorts").select("*").eq("id", camp_id).single();
      if (cohort) setCamp(cohort);

      // an event opened from the Event page: its registration and attendance page
      const { data: ev } = await supabase.from("events").select("id, title").eq("cohort_id", camp_id).maybeSingle();
      setLinkedEventId(ev?.id ?? null);
      setLinkedEventTitle(ev?.title ?? "");
      // a camp without an event has no participants, QR or promotion: start on the committee
      if (!ev?.id) setActiveTab((t) => (t === "peserta" || t === "tentang" || t === "qr" || t === "promosi" ? "crew" : t));

      fetchTasks(supabase);
      fetchMeetings(supabase);
      fetchChats(supabase);
      fetchCrew(supabase);
      fetchAllUsers(supabase);
    }
    fetchData();
  }, [camp_id]);

  const fetchCrew = async (supabase: any) => {
    const { data, error } = await supabase
      .from("camp_crew")
      .select("*, profiles:profile_id(full_name, username)")
      .eq("cohort_id", camp_id)
      .order("created_at", { ascending: true });
    if (error) console.error("fetchCrew error:", error.message);
    if (data) setCrewMembers(data);
  };

  const fetchAllUsers = async (supabase: any) => {
    const { data } = await supabase.from("profiles").select("id, full_name, username").order("full_name").limit(5000);
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

    if (editingCrewId) {
      // Edit mode
      const { error } = await supabase.from("camp_crew").update({
        name: finalName,
        position: newCrewPosition,
        user_id: newCrewUserId || null,
        profile_id: newCrewUserId || null
      }).eq("id", editingCrewId);
      if (error) { alert("Error updating crew: " + error.message); return; }
      setEditingCrewId(null);
    } else {
      // Add mode
      const { error } = await supabase.from("camp_crew").insert({
        cohort_id: camp_id,
        branch: camp.branch,
        camp: camp.camp_name,
        angkatan: camp.angkatan,
        name: finalName,
        position: newCrewPosition,
        user_id: newCrewUserId || null,
        profile_id: newCrewUserId || null
      });
      if (error) { alert("Error adding crew: " + error.message); return; }
    }
    
    setNewCrewName("");
    setNewCrewPosition("");
    setOthersMode(false);
    setNewCrewUserId("");
    fetchCrew(supabase);
  };

  const handleDeleteCrew = async (crewId: string) => {
    if (!confirm("Delete this crew member?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("camp_crew").delete().eq("id", crewId);
    if (error) { alert("Error deleting crew: " + error.message); return; }
    fetchCrew(supabase);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle) return;
    const supabase = createClient();
    const { error } = await supabase.from("camp_tasks").insert({
      cohort_id: camp_id,
      title: newTaskTitle,
      due_date: newTaskDueDate || null,
      assigned_to: newTaskAssignedTo || null,
      status: "todo"
    });
    if (error) {
      alert("Error adding task: " + error.message);
      return;
    }
    setNewTaskTitle("");
    setNewTaskDueDate("");
    setNewTaskAssignedTo("");
    setIsAddingTask(false);
    fetchTasks(supabase);
  };

  const handleAddMeeting = async () => {
    if (!newMeetingTitle) return;
    const supabase = createClient();
    const { error } = await supabase.from("camp_meetings").insert({
      cohort_id: camp_id,
      title: newMeetingTitle,
      date_time: newMeetingDateTime || null,
      mom_text: newMeetingMom || null
    });
    if (error) {
      alert("Error adding meeting: " + error.message);
      return;
    }
    setNewMeetingTitle("");
    setNewMeetingDateTime("");
    setNewMeetingMom("");
    setIsAddingMeeting(false);
    fetchMeetings(supabase);
  };

  const fetchTasks = async (supabase: any) => {
    const { data, error } = await supabase
      .from("camp_tasks")
      .select("*")
      .eq("cohort_id", camp_id)
      .order("due_date", { ascending: true });
    if (error) console.error("fetchTasks error:", error.message);
    if (data) setTasks(data);
  };

  const fetchMeetings = async (supabase: any) => {
    const { data } = await supabase.from("camp_meetings").select("*").eq("cohort_id", camp_id).order("date_time", { ascending: true });
    if (data) setMeetings(data);
  };

  const fetchChats = async (supabase: any) => {
    const { data, error } = await supabase
      .from("camp_chats")
      .select("*")
      .eq("cohort_id", camp_id)
      .order("created_at", { ascending: true });
    if (error) console.error("fetchChats error:", error.message);
    if (data) setChats(data);
  };

  // meeting.date_time is saved as wall-clock time from a <datetime-local> input.
  // Parse the raw Y-M-D H:M digits directly so no timezone shift is ever applied —
  // what the user typed is what is displayed and what Google Calendar receives.
  const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const parseWall = (s: string | null) => {
    if (!s) return null;
    const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!m) return null;
    return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5] };
  };

  const formatMeetingDate = (s: string | null) => {
    const w = parseWall(s);
    if (!w) return "No date set";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(w.d)} ${MONTHS_ID[w.mo - 1]} ${w.y}, ${pad(w.h)}.${pad(w.mi)}`;
  };

  const addToCalendar = (meeting: any) => {
    const w = parseWall(meeting.date_time);
    if (!w) {
      alert("This meeting has no date & time set yet.");
      return;
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    const startLocal = `${w.y}${pad(w.mo)}${pad(w.d)}T${pad(w.h)}${pad(w.mi)}00`;
    const end = new Date(w.y, w.mo - 1, w.d, w.h + 1, w.mi);
    const endLocal = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", meeting.title || "Meeting");
    // No trailing "Z" / ctz => Google Calendar treats these as the user's local time.
    url.searchParams.set("dates", `${startLocal}/${endLocal}`);
    if (meeting.mom_text) url.searchParams.set("details", meeting.mom_text);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const sendChat = async () => {
    if (!chatMessage.trim() || !user) return;
    const supabase = createClient();
    const { error } = await supabase.from("camp_chats").insert({
      cohort_id: camp_id,
      user_id: user.id,
      sender_name: myProfile?.full_name || myProfile?.username || "Unknown",
      message: chatMessage,
      target_group: targetGroup
    });
    if (error) {
      alert("Error sending chat: " + error.message);
      return;
    }
    setChatMessage("");
    fetchChats(supabase);
  };

  if (!camp) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="flex flex-col h-full bg-[#111]">
      <div className="p-6 border-b border-[#333] bg-[#1a1d24]">
        <Link href={inAdmin ? `/admin/communities/${slug}/promotion` : `/camp/${slug}/ongoing`} className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-semibold mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {inAdmin ? "Kembali ke Event" : "Back to My Services"}
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">{isCampSeries(camp.camp_name) ? camp.camp_name : (camp.custom_name || camp.camp_name)} {isCampSeries(camp.camp_name) && <span className="text-brand-gold">Angkatan {camp.angkatan}</span>}</h1>
        <p className="text-gray-400 text-sm">Service Dashboard for {camp.branch}</p>
      </div>

      <div className="flex border-b border-[#333] bg-[#1a1d24] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          ...(linkedEventId ? [
            { id: "tentang", label: "Tentang", Icon: Info },
            { id: "peserta", label: "Peserta", Icon: UserCheck },
            { id: "qr", label: "QR & Absensi", Icon: QrCode },
            { id: "promosi", label: "Promosi", Icon: Megaphone },
          ] : []),
          { id: "crew", label: "Panitia", Icon: Users },
          { id: "meeting", label: "Meeting", Icon: Calendar },
          { id: "todo", label: "To Do", Icon: CheckSquare },
          { id: "chat", label: "Chat", Icon: MessageSquare },
          { id: "keuangan", label: "Keuangan", Icon: Wallet },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            aria-current={activeTab === id ? "page" : undefined}
            className={`flex items-center gap-1.5 px-4 py-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === id ? "border-brand-gold text-brand-gold" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" /> {label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 md:p-6 pb-28 md:pb-6 overflow-y-auto flex flex-col">
        {activeTab === "peserta" && linkedEventId && (
          <PesertaSection eventId={linkedEventId} eventTitle={linkedEventTitle} crew={crewMembers.map((c) => ({ id: c.id, name: c.name, position: c.position }))} canMarkPaid={canMarkPaid} />
        )}
        {activeTab === "tentang" && linkedEventId && <AboutSection eventId={linkedEventId} />}
        {activeTab === "qr" && linkedEventId && <QrSection eventId={linkedEventId} />}
        {activeTab === "promosi" && linkedEventId && <PromosiSection eventId={linkedEventId} />}

        {activeTab === "crew" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Panitia</h2>
              {crewMembers.length === 0 ? (
                <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-8 text-center text-gray-500">
                  No crew members yet. Add one below!
                </div>
              ) : (
                <div className="space-y-2">
                  {[...crewMembers].sort((x, y) => roleOrder(x.position) - roleOrder(y.position) || String(x.name).localeCompare(String(y.name))).map(crew => (
                    <div key={crew.id} className="bg-[#1a1d24] border border-[#333] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{crew.name}</p>
                        <p className="text-brand-gold text-xs font-medium mt-0.5">{crew.position}</p>
                      </div>
                      {crew.profiles ? (
                        <span className="bg-[#222] px-2 py-1 rounded text-xs border border-[#444] text-gray-300 whitespace-nowrap flex-shrink-0">@{crew.profiles.username}</span>
                      ) : (
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Shalom ${crew.name ?? ""}, kamu ditambahkan sebagai ${crew.position ?? "panitia"} di ${camp?.custom_name || camp?.camp_name || "acara ini"}. Unduh aplikasi Ruang Iman dan daftar dengan email ini supaya bisa ikut bertugas: https://apps.ruangiman.com`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-shrink-0 whitespace-nowrap rounded-lg border border-emerald-500/50 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/10"
                        >
                          Belum punya akun · Ajak
                        </a>
                      )}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setNewCrewName(crew.name);
                            setNewCrewPosition(crew.position);
                            setOthersMode(!isKnownRole(crew.position));
                            setNewCrewUserId(crew.user_id || "");
                            setEditingCrewId(crew.id);
                          }}
                          className="p-1.5 text-[#555] hover:text-brand-gold hover:bg-[#222] rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCrew(crew.id)}
                          className="p-1.5 text-[#555] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#111] border border-[#333] rounded-xl p-5 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-brand-gold" /> Tambah Panitia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name (or leave blank if linking)</label>
                  <div className="relative">
                    {newCrewUserId && (
                      <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                        <span className="truncate">Terhubung ke @{allUsers.find(u => u.id === newCrewUserId)?.username ?? "akun"}</span>
                        <button type="button" onClick={() => setNewCrewUserId("")} className="shrink-0 font-semibold text-emerald-200 hover:text-white">Lepas</button>
                      </div>
                    )}
                    <input
                      value={newCrewName}
                      onChange={e => { setNewCrewName(e.target.value); setNewCrewUserId(""); }}
                      onFocus={() => setCrewFocus(true)}
                      onBlur={() => setTimeout(() => setCrewFocus(false), 150)}
                      type="text"
                      placeholder="Ketik nama, lalu pilih akunnya"
                      autoComplete="off"
                      className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                    />
                    {crewFocus && !newCrewUserId && newCrewName.trim().length >= 2 && (() => {
                      const q = newCrewName.trim().toLowerCase();
                      const hits = allUsers.filter(u => String(u.full_name ?? "").toLowerCase().includes(q) || String(u.username ?? "").toLowerCase().includes(q)).slice(0, 6);
                      return hits.length > 0 ? (
                        <ul className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[#333] bg-[#14171c] p-1 shadow-xl">
                          {hits.map(u => (
                            <li key={u.id}>
                              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { setNewCrewUserId(u.id); setNewCrewName(u.full_name ?? ""); setCrewFocus(false); }}
                                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/5">
                                <span className="truncate">{u.full_name}</span>
                                <span className="shrink-0 text-xs text-brand-muted">@{u.username}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null;
                    })()}
                    <p className="mt-1.5 text-[11px] text-brand-muted">{newCrewUserId ? "Ketua, Wakil Ketua, Sekretaris, dan Bendahara yang terhubung bisa menandai lunas." : "Belum punya akun? Ketik namanya saja, lalu klik Ajak di daftar panitia."}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Position</label>
                  <select
                    value={othersMode || (newCrewPosition && !isKnownRole(newCrewPosition)) ? "Others" : newCrewPosition}
                    onChange={e => { if (e.target.value === "Others") { setOthersMode(true); setNewCrewPosition(""); } else { setOthersMode(false); setNewCrewPosition(e.target.value); } }}
                    className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="">-- Pilih jabatan --</option>
                    {CREW_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {(othersMode || (newCrewPosition && !isKnownRole(newCrewPosition))) && (
                    <input value={newCrewPosition} onChange={e => setNewCrewPosition(e.target.value)} type="text" placeholder="Tulis jabatan" className="mt-2 w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-2">
                {editingCrewId && (
                  <button onClick={() => { setEditingCrewId(null); setNewCrewName(""); setNewCrewPosition(""); setNewCrewUserId(""); }} className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-[#333] transition-colors">
                    Cancel Edit
                  </button>
                )}
                <button onClick={handleAddCrew} disabled={(!newCrewName && !newCrewUserId) || !newCrewPosition} className="ml-auto bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {editingCrewId ? "Save Changes" : "Add Crew Member"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "keuangan" && <CampFinance cohortId={camp_id} />}

        {activeTab === "todo" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Tasks & Deadlines</h2>
              <button onClick={() => setIsAddingTask(!isAddingTask)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>

            {isAddingTask && (
              <div className="bg-[#111] border border-[#333] rounded-xl p-5 space-y-4 mb-6">
                <h3 className="text-md font-bold text-white mb-2">New Task</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Task Title</label>
                    <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} type="text" placeholder="Task Name" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Due Date</label>
                      <input value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} type="datetime-local" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Assign To</label>
                      <select value={newTaskAssignedTo} onChange={e => setNewTaskAssignedTo(e.target.value)} className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold">
                        <option value="">-- Unassigned --</option>
                        {crewMembers.filter(c => c.user_id).map(c => (
                          <option key={c.user_id} value={c.user_id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={handleAddTask} disabled={!newTaskTitle} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                    Save Task
                  </button>
                </div>
              </div>
            )}

            {tasks.length === 0 ? (
              <p className="text-gray-500 italic">No tasks found.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="bg-[#1a1d24] border border-[#333] p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                  <div>
                    <h3 className="font-bold text-white text-base">{task.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">Due: {task.due_date ? formatDate(task.due_date) : "No deadline"} • Assigned to: {crewMembers.find(c => c.user_id === task.assigned_to)?.name || "Unassigned"}</p>
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
              <button onClick={() => setIsAddingMeeting(!isAddingMeeting)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Schedule Meeting
              </button>
            </div>

            {isAddingMeeting && (
              <div className="bg-[#111] border border-[#333] rounded-xl p-5 space-y-4 mb-6">
                <h3 className="text-md font-bold text-white mb-2">New Meeting</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Meeting Title</label>
                      <input value={newMeetingTitle} onChange={e => setNewMeetingTitle(e.target.value)} type="text" placeholder="e.g. Kickoff Meeting" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Date & Time</label>
                      <input value={newMeetingDateTime} onChange={e => setNewMeetingDateTime(e.target.value)} type="datetime-local" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Minutes of Meeting (Optional)</label>
                    <textarea value={newMeetingMom} onChange={e => setNewMeetingMom(e.target.value)} rows={3} placeholder="Notes and MoM..." className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"></textarea>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={handleAddMeeting} disabled={!newMeetingTitle} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                    Save Meeting
                  </button>
                </div>
              </div>
            )}

            {meetings.length === 0 ? (
              <p className="text-gray-500 italic">No meetings found.</p>
            ) : (
              meetings.map(meeting => (
                <div key={meeting.id} className="bg-[#1a1d24] border border-[#333] p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-lg">{meeting.title}</h3>
                      <p className="text-brand-gold font-semibold text-sm mt-1">{formatMeetingDate(meeting.date_time)}</p>
                    </div>
                    <button onClick={() => addToCalendar(meeting)} className="bg-brand-surface border border-brand-border hover:bg-brand-gold hover:text-brand-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                      <CalendarPlus className="w-3 h-3" /> Add to Calendar
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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Crew Chat</h2>
              <select value={targetGroup} onChange={e => setTargetGroup(e.target.value)} className="bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                <option value="all">All Crew</option>
                <option value="divisi">Same Divisi</option>
                <option value="pic">Camp PIC</option>
              </select>
            </div>
            
            <div className="flex-1 min-h-0 bg-brand-bg border border-brand-border rounded-xl mb-3 p-4 overflow-y-auto space-y-3">
              {chats.length === 0 ? (
                <p className="text-brand-muted italic text-center mt-10 bg-brand-surface max-w-xs mx-auto py-2 rounded-lg text-xs">No messages yet. Start the conversation!</p>
              ) : (
                chats.map(chat => {
                  const isMe = chat.user_id === user?.id;
                  return (
                    <div key={chat.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`relative flex flex-col max-w-[85%] md:max-w-[70%] rounded-2xl px-3 pt-2 pb-1.5 shadow-sm ${
                        isMe
                          ? 'bg-brand-gold text-brand-dark rounded-tr-none'
                          : 'bg-brand-surface text-brand-light rounded-tl-none border border-brand-border'
                      }`}>
                        {!isMe && (
                          <span className="text-[11px] font-bold text-brand-gold mb-0.5">
                            {chat.sender_name || "Unknown"}
                          </span>
                        )}
                        <span className="text-[14.5px] leading-snug">{chat.message}</span>
                        <span className={`text-[10px] text-right mt-1 opacity-70 ${isMe ? 'text-brand-dark/70' : 'text-brand-muted'}`}>
                          {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
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
