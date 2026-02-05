import { useState, useEffect, useCallback } from 'react';
import { callEdgeFunction } from '../lib/edgeFunctions';
import type {
  WebsiteProject,
  PortfolioStats,
  ProjectTask,
  ProjectStatus,
  Priority,
  TaskStatus,
  PROJECT_TYPES,
  PROJECT_STATUSES,
  PRIORITIES,
  TASK_STATUSES,
  TASK_CATEGORIES,
} from '../lib/types';
import {
  Plus,
  RefreshCw,
  Briefcase,
  Star,
  Trash2,
  Edit,
  ExternalLink,
  X,
  DollarSign,
  Users,
  TrendingUp,
  CheckSquare,
  MoreVertical,
  Archive,
} from 'lucide-react';

// Constants
const PROJECT_TYPE_OPTIONS = [
  { value: 'Local Lead Gen', label: 'Local Lead Gen' },
  { value: 'Affiliate / Content', label: 'Affiliate / Content' },
  { value: 'SaaS / App', label: 'SaaS / App' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Internal Tool', label: 'Internal Tool' },
];

const PROJECT_STATUS_OPTIONS = [
  { value: 'Idea / Backlog', label: 'Idea / Backlog' },
  { value: 'Planning', label: 'Planning' },
  { value: 'In Build', label: 'In Build' },
  { value: 'Pre-Launch QA', label: 'Pre-Launch QA' },
  { value: 'Live – Needs Improving', label: 'Live – Needs Improving' },
  { value: 'Live – Stable', label: 'Live – Stable' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Archived', label: 'Archived' },
];

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const TASK_STATUS_OPTIONS = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
  { value: 'Blocked', label: 'Blocked' },
];

const TASK_CATEGORY_OPTIONS = [
  { value: 'Content', label: 'Content' },
  { value: 'SEO', label: 'SEO' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Design', label: 'Design' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Idea / Backlog': 'bg-slate-100 text-slate-700',
    'Planning': 'bg-blue-100 text-blue-700',
    'In Build': 'bg-purple-100 text-purple-700',
    'Pre-Launch QA': 'bg-amber-100 text-amber-700',
    'Live – Needs Improving': 'bg-orange-100 text-orange-700',
    'Live – Stable': 'bg-emerald-100 text-emerald-700',
    'On Hold': 'bg-gray-100 text-gray-700',
    'Archived': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    'Low': 'bg-slate-100 text-slate-600',
    'Medium': 'bg-amber-100 text-amber-700',
    'High': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[priority] || 'bg-slate-100'}`}>
      {priority}
    </span>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'To Do': 'bg-slate-100 text-slate-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Done': 'bg-emerald-100 text-emerald-700',
    'Blocked': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-slate-100'}`}>
      {status}
    </span>
  );
}

function Modal({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!isOpen) return null;
  const sizeClass = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-md' : 'max-w-2xl';
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-10 z-50 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${sizeClass} mx-4 mb-8`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB').format(value);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalProjects: 0, activeProjects: 0, totalMonthlyVisitors: 0,
    totalMonthlyLeads: 0, totalMonthlyRevenue: 0, totalEstimatedValue: 0, openTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<WebsiteProject | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    project_name: '',
    primary_domain: '',
    project_type: 'Local Lead Gen',
    status: 'Idea / Backlog',
    priority: 'Medium',
    niche: '',
    notes: '',
  });

  // Task form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'To Do',
    category: 'Other',
    due_date: '',
  });
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const result = await callEdgeFunction('projects', {});
    if (result.ok && result.json) {
      const data = result.json as { projects: WebsiteProject[]; stats: PortfolioStats };
      setProjects(data.projects || []);
      setStats(data.stats || stats);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSaveProject = async () => {
    if (!formData.project_name.trim() || !formData.primary_domain.trim()) return;

    if (editingId) {
      await callEdgeFunction('projects', { id: editingId, ...formData });
    } else {
      await callEdgeFunction('projects', formData);
    }

    setShowAddModal(false);
    resetForm();
    loadProjects();
  };

  const handleDelete = async (id: string, hard = false) => {
    const message = hard ? 'Permanently delete this project?' : 'Archive this project?';
    if (!confirm(message)) return;
    await callEdgeFunction('projects', { id, hard_delete: hard });
    loadProjects();
    if (selectedProject?.id === id) {
      setShowDetailModal(false);
      setSelectedProject(null);
    }
  };

  const handleToggleFavourite = async (project: WebsiteProject) => {
    await callEdgeFunction('projects', { id: project.id, is_favourite: !project.is_favourite });
    loadProjects();
  };

  const openDetail = async (project: WebsiteProject) => {
    setSelectedProject(project);
    setShowDetailModal(true);
    // Load tasks for this project
    const tasksResult = await callEdgeFunction('project-tasks', { project_id: project.id });
    if (tasksResult.ok && tasksResult.json) {
      setProjectTasks((tasksResult.json as { tasks: ProjectTask[] }).tasks || []);
    }
  };

  const openEdit = (project: WebsiteProject) => {
    setEditingId(project.id);
    setFormData({
      project_name: project.project_name,
      primary_domain: project.primary_domain,
      project_type: project.project_type,
      status: project.status,
      priority: project.priority,
      niche: project.niche || '',
      notes: project.notes || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      project_name: '',
      primary_domain: '',
      project_type: 'Local Lead Gen',
      status: 'Idea / Backlog',
      priority: 'Medium',
      niche: '',
      notes: '',
    });
    setEditingId(null);
  };

  const handleAddTask = async () => {
    if (!selectedProject || !taskForm.title.trim()) return;
    await callEdgeFunction('project-tasks', {
      project_id: selectedProject.id,
      ...taskForm,
    });
    // Reload tasks
    const tasksResult = await callEdgeFunction('project-tasks', { project_id: selectedProject.id });
    if (tasksResult.ok && tasksResult.json) {
      setProjectTasks((tasksResult.json as { tasks: ProjectTask[] }).tasks || []);
    }
    setTaskForm({ title: '', description: '', status: 'To Do', category: 'Other', due_date: '' });
    setShowTaskModal(false);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    await callEdgeFunction('project-tasks', { id: taskId, status: newStatus });
    if (selectedProject) {
      const tasksResult = await callEdgeFunction('project-tasks', { project_id: selectedProject.id });
      if (tasksResult.ok && tasksResult.json) {
        setProjectTasks((tasksResult.json as { tasks: ProjectTask[] }).tasks || []);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await callEdgeFunction('project-tasks', { id: taskId });
    setProjectTasks(projectTasks.filter(t => t.id !== taskId));
  };

  const filteredProjects = filterStatus
    ? projects.filter(p => p.status === filterStatus)
    : projects;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-slate-600 mt-1">Manage your web assets, track performance, and plan growth.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Projects</div>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Active</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.activeProjects}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Visitors/mo</div>
          <div className="text-2xl font-bold">{formatNumber(stats.totalMonthlyVisitors)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Leads/mo</div>
          <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.totalMonthlyLeads)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Revenue/mo</div>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalMonthlyRevenue)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Portfolio Value</div>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalEstimatedValue)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-soft">
          <div className="text-xs text-slate-500">Open Tasks</div>
          <div className="text-2xl font-bold text-amber-600">{stats.openTasks}</div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm"
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={loadProjects}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="rounded-2xl border bg-white shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {filterStatus ? 'No projects match this filter.' : 'No projects yet. Create your first project to get started.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredProjects.map((project) => {
              const openTasks = project.project_tasks?.filter(t => t.status !== 'Done').length || 0;
              const latestHealth = project.project_health_snapshots?.[0];
              return (
                <div
                  key={project.id}
                  className="rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => openDetail(project)}
                >
                  {/* Favourite star */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavourite(project); }}
                    className={`absolute top-3 right-3 p-1 rounded ${project.is_favourite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'}`}
                  >
                    <Star size={18} fill={project.is_favourite ? 'currentColor' : 'none'} />
                  </button>

                  <div className="pr-8">
                    <h3 className="font-semibold truncate">{project.project_name}</h3>
                    <p className="text-xs text-slate-500 truncate">{project.primary_domain}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <StatusBadge status={project.status} />
                    <PriorityBadge priority={project.priority} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{formatNumber(project.current_month_visitors)}</div>
                      <div className="text-xs text-slate-500">Visitors</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{project.current_month_leads}</div>
                      <div className="text-xs text-slate-500">Leads</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-emerald-600">{formatCurrency(project.current_month_revenue)}</div>
                      <div className="text-xs text-slate-500">Revenue</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-slate-500">
                    <span>{project.niche || project.project_type}</span>
                    {openTasks > 0 && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <CheckSquare size={12} /> {openTasks} tasks
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Project Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title={editingId ? 'Edit Project' : 'New Project'}
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="My Website Project"
                className="w-full px-3 py-2 rounded-xl border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Domain *</label>
              <input
                type="text"
                value={formData.primary_domain}
                onChange={(e) => setFormData({ ...formData, primary_domain: e.target.value })}
                placeholder="example.com"
                className="w-full px-3 py-2 rounded-xl border"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              >
                {PROJECT_TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              >
                {PROJECT_STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Niche</label>
            <input
              type="text"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              placeholder="e.g., Plumbing, Legal, Health"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => { setShowAddModal(false); resetForm(); }} className="px-4 py-2 rounded-xl border hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleSaveProject} className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
              {editingId ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Project Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedProject(null); }}
        title={selectedProject?.project_name || 'Project Details'}
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div>
                <a
                  href={`https://${selectedProject.primary_domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {selectedProject.primary_domain} <ExternalLink size={14} />
                </a>
                <div className="flex flex-wrap gap-2 mt-2">
                  <StatusBadge status={selectedProject.status} />
                  <PriorityBadge priority={selectedProject.priority} />
                  <span className="text-xs text-slate-500">{selectedProject.project_type}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(selectedProject)} className="p-2 rounded-lg hover:bg-slate-100">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(selectedProject.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                  <Archive size={18} />
                </button>
              </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-2xl font-bold">{formatNumber(selectedProject.current_month_visitors)}</div>
                <div className="text-xs text-slate-500">Visitors/mo</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-2xl font-bold">{selectedProject.current_month_leads}</div>
                <div className="text-xs text-slate-500">Leads/mo</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedProject.current_month_revenue)}</div>
                <div className="text-xs text-slate-500">Revenue/mo</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(selectedProject.estimated_asset_value)}</div>
                <div className="text-xs text-slate-500">Est. Value</div>
              </div>
            </div>

            {/* Notes */}
            {selectedProject.notes && (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm font-medium mb-1">Notes</div>
                <div className="text-sm text-slate-600">{selectedProject.notes}</div>
              </div>
            )}

            {/* Tasks Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Tasks</h3>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm"
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
              {projectTasks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">No tasks yet.</div>
              ) : (
                <div className="space-y-2">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <TaskStatusBadge status={task.status} />
                          <span className="text-xs text-slate-500">{task.category}</span>
                          {task.due_date && (
                            <span className="text-xs text-slate-500">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border"
                        >
                          {TASK_STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add Task"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Task title"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={taskForm.category}
                onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              >
                {TASK_CATEGORY_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 rounded-xl border hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleAddTask} className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
              Add Task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
