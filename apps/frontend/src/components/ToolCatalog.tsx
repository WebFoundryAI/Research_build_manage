import { useMemo, useState } from "react";
import { callEdgeFunction } from "../lib/edgeFunctions";
import { DEFAULT_TOOL, MCP_SPARK_TOOLS, TOOL_SECTIONS, type ToolDefinition } from "../lib/mcpSparkTools";

type ToolRunState = {
  status: "idle" | "running" | "success" | "error";
  output: string;
};

type ToolCatalogProps = {
  title: string;
  subtitle: string;
};

export default function ToolCatalog({ title, subtitle }: ToolCatalogProps) {
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [runState, setRunState] = useState<ToolRunState>({ status: "idle", output: "" });

  const grouped = useMemo(() => {
    return TOOL_SECTIONS;
  }, []);

  const sections = useMemo(() => {
    const map = new Map<string, ToolDefinition[]>();
    MCP_SPARK_TOOLS.forEach((tool) => {
      if (!map.has(tool.section)) map.set(tool.section, []);
      map.get(tool.section)!.push(tool);
    });
    return map;
  }, []);

  async function runTool(tool: ToolDefinition) {
    setRunState({ status: "running", output: "" });
    const payload = {
      toolId: tool.id,
      inputs: tool.fields.reduce<Record<string, string>>((acc, field) => {
        acc[field.name] = inputs[field.name] ?? "";
        return acc;
      }, {}),
    };
    const result = await callEdgeFunction("mcp-spark-run", payload);
    if (!result.ok) {
      setRunState({ status: "error", output: result.bodyText });
      return;
    }
    setRunState({
      status: "success",
      output: JSON.stringify(result.json ?? {}, null, 2),
    });
  }

  const active = activeTool ?? DEFAULT_TOOL;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <active.icon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
          System OK
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          {Object.entries(grouped).map(([key, meta]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>{meta.label}</span>
              </div>
              <div className="space-y-1">
                {MCP_SPARK_TOOLS.filter((tool) => tool.category === key).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                      active.id === tool.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <tool.icon size={16} />
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="space-y-8">
          {[...sections.entries()].map(([section, tools]) => (
            <section key={section} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{section}</h2>
                <p className="text-sm text-slate-500">
                  {section === "Web Scraping & Crawling"
                    ? "Extract and analyze web content at scale"
                    : section === "Research Tools"
                    ? "AI-powered research and analysis"
                    : "Advanced keyword intelligence workflows"}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool)}
                    className="flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <tool.icon size={18} />
                    </div>
                    <div className="text-sm font-semibold">{tool.name}</div>
                    <div className="text-xs text-slate-500">{tool.description}</div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {activeTool && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">{activeTool.section}</div>
                <h3 className="text-xl font-semibold">{activeTool.name}</h3>
                <p className="text-sm text-slate-600">{activeTool.description}</p>
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {activeTool.fields.map((field) => (
                <label key={field.name} className="text-sm text-slate-600">
                  <div className="mb-1 font-medium text-slate-700">{field.label}</div>
                  {field.type === "textarea" ? (
                    <textarea
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      rows={4}
                      placeholder={field.placeholder}
                      value={inputs[field.name] ?? ""}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, [field.name]: event.target.value }))
                      }
                    />
                  ) : (
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder={field.placeholder}
                      value={inputs[field.name] ?? ""}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, [field.name]: event.target.value }))
                      }
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => runTool(activeTool)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                disabled={runState.status === "running"}
              >
                {runState.status === "running" ? "Running…" : "Run tool"}
              </button>
              {runState.status !== "idle" && (
                <div className="text-xs text-slate-500">
                  Status: {runState.status.toUpperCase()}
                </div>
              )}
            </div>

            {runState.output && (
              <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                {runState.output}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
