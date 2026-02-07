import React, { useState, useEffect } from "react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Globe,
  CheckSquare,
  FileText,
  Clock,
  X,
} from "lucide-react";

type DeletedItem = {
  id: string;
  type: "project" | "task" | "note";
  name: string;
  description: string;
  deleted_at: string;
  expires_at: string;
};

export default function TrashPage() {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);

    const demoItems: DeletedItem[] = [
      {
        id: "1",
        type: "project",
        name: "Old Marketing Site",
        description: "marketing.example.com",
        deleted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 25).toISOString(),
      },
      {
        id: "2",
        type: "task",
        name: "Update homepage banner",
        description: "Main Website",
        deleted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 28).toISOString(),
      },
      {
        id: "3",
        type: "task",
        name: "Fix broken links",
        description: "E-Commerce Store",
        deleted_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 20).toISOString(),
      },
    ];

    setItems(demoItems);
    setLoading(false);
  }

  function restoreItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
    // In real app, would call API to restore
  }

  function permanentDelete(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirmDelete(null);
  }

  function emptyTrash() {
    if (!confirm("Permanently delete all items? This cannot be undone.")) return;
    setItems([]);
  }

  function getTypeIcon(type: string) {
    if (type === "project") return <Globe size={18} className="text-blue-600" />;
    if (type === "task") return <CheckSquare size={18} className="text-emerald-600" />;
    return <FileText size={18} className="text-purple-600" />;
  }

  function getDaysUntilExpiry(date: string) {
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Trash</h1>
          <p className="text-sm text-slate-400 mt-1">
            Deleted items are kept for 30 days before permanent deletion
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={emptyTrash}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-600 font-medium text-sm transition-colors"
          >
            <Trash2 size={16} />
            Empty Trash
          </button>
        )}
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-600">Auto-deletion enabled</h3>
            <p className="text-sm text-slate-400 mt-1">
              Items in trash will be permanently deleted after 30 days. Restore items to keep them.
            </p>
          </div>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">Trash is empty</p>
          <p className="text-sm text-slate-500">Deleted items will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const daysLeft = getDaysUntilExpiry(item.expires_at);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-slate-100">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="capitalize">{item.type}</span>
                      <span>•</span>
                      <span>{item.description}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      <Clock size={12} className="text-slate-500" />
                      <span className={daysLeft <= 7 ? "text-red-600" : "text-slate-500"}>
                        {daysLeft} days until permanent deletion
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restoreItem(item.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm transition-colors"
                    >
                      <RotateCcw size={14} />
                      Restore
                    </button>
                    <button
                      onClick={() => setConfirmDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {items.length} item{items.length !== 1 ? "s" : ""} in trash
            </span>
            <span className="text-slate-500">
              {items.filter(i => i.type === "project").length} projects,{" "}
              {items.filter(i => i.type === "task").length} tasks
            </span>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Permanently?</h2>
            <p className="text-sm text-slate-400 mb-6">
              This action cannot be undone. The item will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => permanentDelete(confirmDelete)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
