import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  GripVertical,
  Globe,
  Star,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";

type Project = {
  id: string;
  name: string;
  domain: string;
  status: string;
  is_favourite: boolean;
  health_score: number | null;
};

const columns = [
  { id: "backlog", title: "Backlog", color: "border-slate-500" },
  { id: "planning", title: "Planning", color: "border-purple-500" },
  { id: "in-build", title: "In Build", color: "border-blue-500" },
  { id: "qa", title: "QA", color: "border-amber-500" },
  { id: "live", title: "Live", color: "border-emerald-500" },
];

const statusToColumn: Record<string, string> = {
  "Idea / Backlog": "backlog",
  "Planning": "planning",
  "In Build": "in-build",
  "Pre-Launch QA": "qa",
  "Live – Needs Improving": "live",
  "Live – Stable": "live",
  "On Hold": "backlog",
  "Archived": "backlog",
};

export default function BoardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setProjects([]);
    setLoading(false);
  }

  function getProjectsByColumn(columnId: string) {
    return projects.filter(p => statusToColumn[p.status] === columnId);
  }

  function getHealthColor(score: number | null) {
    if (score === null) return "text-slate-500";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Board View</h1>
        <p className="text-sm text-slate-400 mt-1">
          Drag and drop projects across workflow stages
        </p>
      </div>

      {/* Board */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => {
            const columnProjects = getProjectsByColumn(column.id);
            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-72 rounded-xl border-t-2 ${column.color} bg-white border border-t-0 border-slate-200`}
              >
                <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{column.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                      {columnProjects.length}
                    </span>
                  </div>
                  <button className="p-1 rounded hover:bg-slate-100 text-slate-500">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="p-2 space-y-2 min-h-[400px]">
                  {columnProjects.map(project => (
                    <div
                      key={project.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 cursor-grab hover:border-slate-200 transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={14} className="text-slate-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {project.is_favourite && (
                              <Star size={12} className="text-amber-600 fill-amber-400" />
                            )}
                            <span className="font-medium text-sm truncate">{project.name}</span>
                          </div>
                          <div className="text-xs text-slate-500 truncate">{project.domain}</div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Globe size={12} />
                              <span className={getHealthColor(project.health_score)}>
                                {project.health_score ?? "-"}
                              </span>
                            </div>
                            <button className="p-1 rounded hover:bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnProjects.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-sm">
                      No projects
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-medium mb-3">Workflow Stages</h3>
        <div className="flex flex-wrap gap-4">
          {columns.map(column => (
            <div key={column.id} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded border-2 ${column.color}`} />
              <span className="text-slate-400">{column.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
