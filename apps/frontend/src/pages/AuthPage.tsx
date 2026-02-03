import React from "react";
import { useAuth } from "../lib/auth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.649 32.657 29.246 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.038 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.038 6.053 29.268 4 24 4 16.318 4 9.656 7.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.225 0-9.617-3.325-11.29-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.231-2.231 4.118-4.084 5.57h.001l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
    </svg>
  );
}

export default function AuthPage() {
  const { mode, loading, user, error, signInWithGoogle } = useAuth();

  const page: React.CSSProperties = {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "radial-gradient(1200px 500px at 20% 0%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(900px 450px at 80% 10%, rgba(56,189,248,0.14), transparent 55%), #0b1220",
  };

  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 440,
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid rgba(15, 23, 42, 0.12)",
    boxShadow: "0 18px 50px rgba(2, 6, 23, 0.22)",
    padding: 28,
  };

  const title: React.CSSProperties = {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: "#0f172a",
  };

  const sub: React.CSSProperties = {
    marginTop: 10,
    marginBottom: 0,
    fontSize: 14,
    color: "#475569",
  };

  const btn: React.CSSProperties = {
    marginTop: 18,
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    border: "1px solid rgba(15, 23, 42, 0.22)",
    background: "#fff",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 650,
    color: "#0f172a",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(2, 6, 23, 0.08)",
  };

  if (loading) return <div style={page}><div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>Loading…</div></div>;

  if (user) {
    return (
      <div style={page}>
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 650, color: "#0f172a" }}>Already signed in</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>{user.email ?? user.id}</div>
          <div style={{ marginTop: 14, fontSize: 12, color: "#94a3b8" }}>Use the sidebar to navigate.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>Sign in</h1>
        <p style={sub}>
          {mode === "demo"
            ? "Supabase isn’t configured, so the app is running in Demo Mode."
            : "Continue with Google to access the dashboard."}
        </p>

        {error ? (
          <div style={{ marginTop: 16, borderRadius: 12, border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.10)", padding: 12, fontSize: 13, color: "#92400e" }}>
            {error}
          </div>
        ) : null}

        <button style={btn} onClick={() => signInWithGoogle()}>
          {mode === "demo" ? null : <GoogleIcon />}
          {mode === "demo" ? "Enter Demo" : "Continue with Google"}
        </button>

        <div style={{ marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
          {mode === "demo" ? "Demo Mode is intended for UI review only." : "Single sign-on via Supabase OAuth."}
        </div>

