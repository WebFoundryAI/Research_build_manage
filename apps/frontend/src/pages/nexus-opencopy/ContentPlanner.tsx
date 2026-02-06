import React, { useState } from "react";
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type PlannedContent = {
  id: string;
  title: string;
  keyword: string;
  project: string;
  date: string;
  status: "planned" | "in_progress" | "completed" | "overdue";
};

export default function NexusOpenCopyContentPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const plannedContent: PlannedContent[] = [
    {
      id: "1",
      title: "React 19 New Features",
      keyword: "react 19 features",
      project: "Tech Blog",
      date: formatDate(addDays(new Date(), 2)),
      status: "planned",
    },
    {
      id: "2",
      title: "Next.js vs Remix Comparison",
      keyword: "nextjs vs remix",
      project: "Tech Blog",
      date: formatDate(addDays(new Date(), 5)),
      status: "planned",
    },
    {
      id: "3",
      title: "Email Marketing Strategies",
      keyword: "email marketing tips",
      project: "Marketing Site",
      date: formatDate(addDays(new Date(), -1)),
      status: "overdue",
    },
    {
      id: "4",
      title: "Product Page Optimization",
      keyword: "ecommerce optimization",
      project: "E-Commerce Blog",
      date: formatDate(new Date()),
      status: "in_progress",
    },
    {
      id: "5",
      title: "API Best Practices",
      keyword: "api design",
      project: "Documentation",
      date: formatDate(addDays(new Date(), 7)),
      status: "planned",
    },
  ];

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];

    // Add days from previous month to start on Sunday
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(addDays(firstDay, -i - 1));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to complete the grid
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push(addDays(lastDay, i));
    }

    return days;
  }

  function getContentForDate(date: string): PlannedContent[] {
    return plannedContent.filter((c) => c.date === date);
  }

  function getStatusColor(status: string) {
    if (status === "completed") return "bg-emerald-500";
    if (status === "in_progress") return "bg-blue-500";
    if (status === "overdue") return "bg-red-500";
    return "bg-slate-500";
  }

  function navigateMonth(direction: number) {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  }

  const days = getDaysInMonth(currentDate);
  const today = formatDate(new Date());

  const overdueCount = plannedContent.filter((c) => c.status === "overdue").length;
  const plannedCount = plannedContent.filter((c) => c.status === "planned").length;
  const inProgressCount = plannedContent.filter((c) => c.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            <CalendarDays className="text-purple-600" />
            Content Planner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Plan and schedule your content calendar
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          Schedule Content
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {overdueCount > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle size={18} className="text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-red-600">{overdueCount}</div>
                <div className="text-xs text-slate-500">Overdue</div>
              </div>
            </div>
          </div>
        )}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Clock size={18} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">{inProgressCount}</div>
              <div className="text-xs text-slate-500">In Progress</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <CalendarDays size={18} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-purple-600">{plannedCount}</div>
              <div className="text-xs text-slate-500">Scheduled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              view === "week" ? "bg-purple-500/20 text-purple-600" : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              view === "month" ? "bg-purple-500/20 text-purple-600" : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/30">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="px-3 py-2 text-center text-sm font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((date, i) => {
            const dateStr = formatDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = dateStr === today;
            const content = getContentForDate(dateStr);

            return (
              <div
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[100px] p-2 border-b border-r border-slate-200 cursor-pointer transition-colors ${
                  isCurrentMonth ? "hover:bg-slate-100/30" : "bg-white/20"
                } ${selectedDate === dateStr ? "bg-purple-500/10" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? "w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center"
                      : isCurrentMonth
                      ? "text-white"
                      : "text-slate-600"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {content.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className={`text-xs px-1.5 py-0.5 rounded truncate ${getStatusColor(item.status)} bg-opacity-20`}
                    >
                      {item.title}
                    </div>
                  ))}
                  {content.length > 2 && (
                    <div className="text-xs text-slate-500">+{content.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Content List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold mb-4">Upcoming Content</h3>
        <div className="space-y-3">
          {plannedContent
            .filter((c) => c.status !== "completed")
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((content) => (
              <div
                key={content.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-100/30 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(content.status)}`} />
                  <div>
                    <div className="font-medium text-sm">{content.title}</div>
                    <div className="text-xs text-slate-500">
                      {content.project} • {content.keyword}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(content.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
