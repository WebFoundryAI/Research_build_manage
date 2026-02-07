import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import WebsitesPage from "./pages/WebsitesPage";
import ResearchPage from "./pages/ResearchPage";
import PlannerPage from "./pages/PlannerPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import BuildPage from "./pages/BuildPage";
import MultiToolsPage from "./pages/MultiToolsPage";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { err: any }> {
  state = { err: null };
  static getDerivedStateFromError(err: any) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>App crashed</h1>
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{String(this.state.err?.stack || this.state.err)}</pre>
      </div>
    );
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/websites" element={<WebsitesPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/build" element={<BuildPage />} />
              <Route path="/mcp-spark" element={<MultiToolsPage />} />
              <Route path="/multi-tools" element={<Navigate to="/mcp-spark" replace />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
