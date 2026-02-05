import { useState, useEffect, useCallback } from 'react';
import { callEdgeFunction } from '../lib/edgeFunctions';
import type { ProjectTask, TaskStatus, TaskCategory } from '../lib/types';
import { CheckSquare, Plus, Filter, Calendar, Trash2, ExternalLink } from 'lucide-react';

const TASK_STATUS_OPTIONS = [
  { value: 'To Do', label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'Done', label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'Blocked', label: 'Blocked', color: 'bg-red-100 text-red-700' },
];

const TASK_CATEGORY_OPTIONS = [
  { value: 'Content', label: 'Content' },
  { value: 'SEO', label: 'SEO' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Design', label: 'Design' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' },
];

function TaskStatusBadge({ status }: { status: string }) {
  const option = TASK_STATUS_OPTIONS.find(o => o.value === status);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${option?.color || 'bg-slate-100'}`}>
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    'Content': 'bg-purple-100 text-purple-700',
    'SEO': 'bg-green-100 text-green-700',
    'Tech': 'bg-blue-100 text-blue-700',
    'Design': 'bg-pink-100 text-pink-700',
    'Operations': 'bg-amber-100 text-amber-700',
    'Other': 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${colors[category] || 'bg-slate-100'}`}>
      {category}
    </span>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [summary, setSummary] = useState({ total: 0, todo: 0, inProgress: 0, done: 0, blocked: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    if (filterCategory) params.category = filterCategory;

    const result = await callEdgeFunction('project-tasks', params);
    if (result.ok && result.json) {
      const data = result.json as { tasks: ProjectTask[]; summary: typeof summary };
      setTasks(data.tasks || []);
      setSummary(data.summary || summary);
    }
    setLoading(false);
  }, [filterStatus, filterCategory]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    await callEdgeFunction('project-tasks', { id: taskId, status: newStatus });
    loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    await callEdgeFunction('project-tasks', { id: taskId });
    loadTasks();
  };

  const isOverdue = (task: ProjectTask) => {
    if (!task.due_date || task.status === 'Done') return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Group tasks by status for kanban-like view
  const tasksByStatus = {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Blocked': tasks.filter(t => t.status === 'Blocked'),
    'Done': tasks.filter(t => t.status === 'Done'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-sm text-slate-600 mt-1">Manage tasks across all your projects.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Total</div>
          <div className="text-2xl font-bold">{summary.total}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">To Do</div>
          <div className="text-2xl font-bold text-slate-600">{summary.todo}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{summary.inProgress}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Done</div>
          <div className="text-2xl font-bold text-emerald-600">{summary.done}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Blocked</div>
          <div className="text-2xl font-bold text-red-600">{summary.blocked}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Overdue</div>
          <div className="text-2xl font-bold text-amber-600">{summary.overdue}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border text-sm"
        >
          <option value="">All Statuses</option>
          {TASK_STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border text-sm"
        >
          <option value="">All Categories</option>
          {TASK_CATEGORY_OPTIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <CheckSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p>No tasks found.</p>
          <p className="text-sm">Create tasks from the Portfolio page.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{status}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {statusTasks.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-xl border bg-white p-3 shadow-soft ${isOverdue(task) ? 'border-amber-300 bg-amber-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{task.title}</div>
                        {task.website_projects && (
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {task.website_projects.project_name}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <CategoryBadge category={task.category} />
                      {task.due_date && (
                        <span className={`text-xs flex items-center gap-1 ${isOverdue(task) ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                          <Calendar size={12} />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border bg-white"
                      >
                        {TASK_STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {statusTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs border-2 border-dashed rounded-xl">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
