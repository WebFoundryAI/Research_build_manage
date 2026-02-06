import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CheckSquare,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  MoreVertical,
  X,
  Calendar,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string;
  project_id: string;
  project_name: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Critical" | "High" | "Medium" | "Low";
  due_date: string | null;
  created_at: string;
};

const priorityColors: Record<string, string> = {
  Critical: "text-red-600 bg-red-500/20 border-red-500/30",
  High: "text-amber-600 bg-amber-500/20 border-amber-500/30",
  Medium: "text-blue-600 bg-blue-500/20 border-blue-500/30",
  Low: "text-slate-400 bg-slate-500/20 border-slate-500/30",
};

const statusIcons: Record<string, React.ReactNode> = {
  "To Do": <Circle size={16} className="text-slate-400" />,
  "In Progress": <Clock size={16} className="text-blue-600" />,
  "Done": <CheckSquare size={16} className="text-emerald-600" />,
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: "1",
    priority: "Medium" as Task["priority"],
    due_date: "",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);

    const demoTasks: Task[] = [
      { id: "1", title: "Fix mobile navigation", description: "Navigation menu doesn't work on mobile devices", project_id: "2", project_name: "E-Commerce Store", status: "In Progress", priority: "High", due_date: new Date(Date.now() + 86400000).toISOString(), created_at: "2024-07-01" },
      { id: "2", title: "Update SSL certificate", description: "Certificate expires in 30 days", project_id: "1", project_name: "Main Website", status: "To Do", priority: "Critical", due_date: new Date(Date.now() + 172800000).toISOString(), created_at: "2024-07-02" },
      { id: "3", title: "Optimize images", description: "Compress and lazy load images", project_id: "3", project_name: "Blog Platform", status: "To Do", priority: "Medium", due_date: null, created_at: "2024-07-03" },
      { id: "4", title: "Add payment gateway", description: "Integrate Stripe payment processing", project_id: "4", project_name: "SaaS Dashboard", status: "In Progress", priority: "High", due_date: new Date(Date.now() + 604800000).toISOString(), created_at: "2024-07-04" },
      { id: "5", title: "Write documentation", description: "Create user guide and API docs", project_id: "4", project_name: "SaaS Dashboard", status: "To Do", priority: "Low", due_date: null, created_at: "2024-07-05" },
      { id: "6", title: "SEO audit", description: "Run full SEO audit and fix issues", project_id: "1", project_name: "Main Website", status: "Done", priority: "Medium", due_date: "2024-06-30", created_at: "2024-06-15" },
    ];

    setTasks(demoTasks);
    setLoading(false);
  }

  function toggleTaskStatus(id: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newStatus = t.status === "To Do" ? "In Progress" : t.status === "In Progress" ? "Done" : "To Do";
      return { ...t, status: newStatus };
    }));
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.project_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedTasks = {
    "To Do": filteredTasks.filter(t => t.status === "To Do"),
    "In Progress": filteredTasks.filter(t => t.status === "In Progress"),
    "Done": filteredTasks.filter(t => t.status === "Done"),
  };

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      project_id: formData.project_id,
      project_name: "Main Website",
      status: "To Do",
      priority: formData.priority,
      due_date: formData.due_date || null,
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setShowNewModal(false);
    setFormData({ title: "", description: "", project_id: "1", priority: "Medium", due_date: "" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage project tasks and track progress
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : (
        <div className="space-y-6">
          {(["To Do", "In Progress", "Done"] as const).map(status => {
            const statusTasks = groupedTasks[status];
            if (statusTasks.length === 0 && statusFilter !== "all" && statusFilter !== status) return null;

            return (
              <div key={status} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                  {statusIcons[status]}
                  <h2 className="font-medium">{status}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                    {statusTasks.length}
                  </span>
                </div>

                {statusTasks.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No tasks</div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {statusTasks.map(task => (
                      <div
                        key={task.id}
                        className="px-4 py-3 hover:bg-slate-100/30 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className="mt-0.5 p-1 rounded hover:bg-slate-100"
                          >
                            {statusIcons[task.status]}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${task.status === "Done" ? "line-through text-slate-500" : ""}`}>
                                {task.title}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{task.project_name}</div>
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <Calendar size={12} />
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <button className="p-1 rounded hover:bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <button onClick={() => setShowNewModal(false)} className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-100">
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-6">New Task</h2>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task description"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task["priority"] })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
