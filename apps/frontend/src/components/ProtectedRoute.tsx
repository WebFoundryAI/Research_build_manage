import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Loading…</div>
          <div style={{ opacity: 0.7, marginTop: 6 }}>Auth initialising</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
