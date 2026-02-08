import React from "react";
import { useSettings, type ModuleSettings } from "../lib/settings";
import EmptyState from "./EmptyState";

type ModuleGateProps = {
  moduleKey: keyof ModuleSettings;
  children: React.ReactNode;
};

export default function ModuleGate({ moduleKey, children }: ModuleGateProps) {
  const { settings, status } = useSettings();

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
        Loading module settings…
      </div>
    );
  }

  if (status === "error") {
    return <>{children}</>;
  }

  if (!settings.modules[moduleKey]) {
    return <EmptyState title="Module disabled" />;
  }

  return <>{children}</>;
}
