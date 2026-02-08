import React from "react";
import { useAuth } from "../lib/auth";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.649 32.657 29.246 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.038 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.038 6.053 29.268 4 24 4 16.318 4 9.656 7.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.225 0-9.617-3.325-11.29-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.231-2.231 4.118-4.084 5.57h.001l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
    </svg>
  );
}

export default function AuthPage() {
  const { loading, user, error, signInWithGoogle, mode } = useAuth();

  const page: React.CSSProperties = {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    background: "#f8f9fb",
    color: "#0f172a",
  };

  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 440,
    borderRadius: 20,
    padding: 32,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  };

  const brand: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  };

  const dot: React.CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    boxShadow: "0 0 0 4px rgba(99,102,241,0.1)",
  };

  const title: React.CSSProperties = {
    fontSize: 28,
    margin: "2px 0 6px",
    letterSpacing: "-0.02em",
    fontWeight: 700,
    color: "#0f172a",
  };

  const sub: React.CSSProperties = {
    margin: 0,
    lineHeight: 1.5,
    fontSize: 14,
    color: "#64748b",
  };

  const btn: React.CSSProperties = {
    marginTop: 18,
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    padding: "12px 14px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
  };

  const fine: React.CSSProperties = {
    marginTop: 14,
    fontSize: 12,
    color: "#94a3b8",
  };

  const warn: React.CSSProperties = {
    marginTop: 14,
    borderRadius: 14,
    border: "1px solid rgba(245,158,11,0.3)",
    background: "#fffbeb",
    padding: 12,
    fontSize: 13,
    color: "#92400e",
    whiteSpace: "pre-wrap",
  };

  if (loading) {
    return (
      <div style={page} >
        <div style={card}>
          <div style={{ ...brand, marginBottom: 0 }}>
            <span style={dot} />
            <div style={{ fontWeight: 700 }}>Super SEO</div>
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: "#64748b" }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div style={page} >
        <div style={card}>
          <div style={brand}>
            <span style={dot} />
            <div style={{ fontWeight: 700 }}>Super SEO</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Signed in</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
            {user.email ?? user.id}
          </div>
          <div style={fine}>Use the sidebar to navigate.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={page} >
      <div style={card}>
        <div style={brand}>
          <span style={dot} />
          <div style={{ fontWeight: 700 }}>Super SEO</div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>
            {mode === "demo" ? "Demo" : "Production"}
          </div>
        </div>

        <h1 style={title}>Sign in</h1>
        <p style={sub}>
          {mode === "demo"
            ? "Supabase isn't configured, so the app is running in Demo Mode."
            : "Continue with Google to access the dashboard."}
        </p>

        {error ? <div style={warn}>{error}</div> : null}

        <button
          style={btn}
          onClick={() => signInWithGoogle()}
          onMouseEnter={(e) => ((e.currentTarget.style.transform = "translateY(-1px)"), (e.currentTarget.style.background = "#4338ca"))}
          onMouseLeave={(e) => ((e.currentTarget.style.transform = "translateY(0px)"), (e.currentTarget.style.background = "#4f46e5"))}
        >
          {mode === "demo" ? null : <GoogleIcon />}
          {mode === "demo" ? "Enter Demo" : "Continue with Google"}
        </button>

        <div style={fine}>
          {mode === "demo" ? "Demo Mode is intended for UI review only." : "Single sign-on via Supabase OAuth."}
        </div>
      </div>
    </div>
  );
}
