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
  const { mode, loading, user, error, signInWithGoogle } = useAuth();

  const page: React.CSSProperties = {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,.18), transparent 60%)," +
      "radial-gradient(900px 500px at 80% 20%, rgba(16,185,129,.12), transparent 55%)," +
      "linear-gradient(180deg, #0b1020 0%, #070a13 100%)",
    color: "#e5e7eb",
  };

  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 440,
    borderRadius: 20,
    padding: 22,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
    backdropFilter: "blur(10px)",
  };

  const brand: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    opacity: 0.95,
  };

  const dot: React.CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "linear-gradient(135deg, #60a5fa, #34d399)",
    boxShadow: "0 0 0 4px rgba(255,255,255,0.06)",
  };

  const title: React.CSSProperties = {
    fontSize: 28,
    margin: "2px 0 6px",
    letterSpacing: "-0.02em",
    fontWeight: 700,
  };

  const sub: React.CSSProperties = {
    margin: 0,
    lineHeight: 1.5,
    fontSize: 14,
    color: "rgba(229,231,235,0.78)",
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
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.92)",
    color: "#0b1020",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  };

  const fine: React.CSSProperties = {
    marginTop: 14,
    fontSize: 12,
    color: "rgba(148,163,184,0.9)",
  };

  const warn: React.CSSProperties = {
    marginTop: 14,
    borderRadius: 14,
    border: "1px solid rgba(245,158,11,0.45)",
    background: "rgba(245,158,11,0.12)",
    padding: 12,
    fontSize: 13,
    color: "#fde68a",
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
          <div style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}>Loading…</div>
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
          <div style={{ marginTop: 6, fontSize: 12, color: "rgba(229,231,235,0.78)" }}>
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
          <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(148,163,184,0.9)" }}>
            {mode === "demo" ? "Demo" : "Production"}
          </div>
        </div>

        <h1 style={title}>Sign in</h1>
        <p style={sub}>
          {mode === "demo"
            ? "Supabase isn’t configured, so the app is running in Demo Mode."
            : "Continue with Google to access the dashboard."}
        </p>

        {error ? <div style={warn}>{error}</div> : null}

        <button
          style={btn}
          onClick={() => signInWithGoogle()}
          onMouseEnter={(e) => ((e.currentTarget.style.transform = "translateY(-1px)"), (e.currentTarget.style.background = "white"))}
          onMouseLeave={(e) => ((e.currentTarget.style.transform = "translateY(0px)"), (e.currentTarget.style.background = "rgba(255,255,255,0.92)"))}
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
