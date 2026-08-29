const fs = require('fs');
let code = fs.readFileSync('src/app/(public)/camp/ongoing/[camp_id]/page.tsx', 'utf8');

// 1. Add state variables for Tasks and Meetings
const stateInsert = \  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingDateTime, setNewMeetingDateTime] = useState("");
  const [newMeetingMom, setNewMeetingMom] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);\;

code = code.replace(/const \[newCrewPosition, setNewCrewPosition\] = useState\(""\);/, \const [newCrewPosition, setNewCrewPosition] = useState("");
\\);

// 2. Add handleAddTask and handleAddMeeting functions
const funcInsert = \  const handleAddTask = async () => {
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
  };\;

code = code.replace(/const fetchTasks = async/, \\\n\n  const fetchTasks = async\);

// 3. Update the Tasks UI block
const tasksUiOld = \          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Tasks & Deadlines</h2>
              <button className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
            {tasks.length === 0 ? (\;

const tasksUiNew = \          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Tasks & Deadlines</h2>
              <button onClick={() => setIsAddingTask(!isAddingTask)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>

            {isAddingTask && (
              <div className="bg-[#111] border border-[#333] rounded-xl p-5 space-y-4 mb-6">
                <h3 className="text-md font-bold text-white mb-2">New Task</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Task Title</label>
                    <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} type="text" placeholder="Task Name" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                  </div>
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
                <div className="flex justify-end pt-2">
                  <button onClick={handleAddTask} disabled={!newTaskTitle} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                    Save Task
                  </button>
                </div>
              </div>
            )}

            {tasks.length === 0 ? (\;

code = code.replace(tasksUiOld, tasksUiNew);

// 4. Update Meetings UI block
const meetingsUiOld = \          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Meetings & MoM</h2>
              <button className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Schedule Meeting
              </button>
            </div>
            {meetings.length === 0 ? (\;

const meetingsUiNew = \          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Meetings & MoM</h2>
              <button onClick={() => setIsAddingMeeting(!isAddingMeeting)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Schedule Meeting
              </button>
            </div>

            {isAddingMeeting && (
              <div className="bg-[#111] border border-[#333] rounded-xl p-5 space-y-4 mb-6">
                <h3 className="text-md font-bold text-white mb-2">New Meeting</h3>
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
                <div className="flex justify-end pt-2">
                  <button onClick={handleAddMeeting} disabled={!newMeetingTitle} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                    Save Meeting
                  </button>
                </div>
              </div>
            )}

            {meetings.length === 0 ? (\;

code = code.replace(meetingsUiOld, meetingsUiNew);

fs.writeFileSync('src/app/(public)/camp/ongoing/[camp_id]/page.tsx', code);
console.log('Successfully updated file.');
