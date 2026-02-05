import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Main Pages
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import WebsitesPage from "./pages/WebsitesPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import SeoResearchPage from "./pages/SeoResearchPage";
import ResearchPage from "./pages/ResearchPage";
import PlannerPage from "./pages/PlannerPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

// MCP Spark Pages
import McpSparkLayout from "./pages/mcp-spark/McpSparkLayout";
import McpSparkIndex from "./pages/mcp-spark/Index";
import Scrape from "./pages/mcp-spark/Scrape";
import Crawl from "./pages/mcp-spark/Crawl";
import MapTool from "./pages/mcp-spark/Map";
import SearchTool from "./pages/mcp-spark/Search";
import Extract from "./pages/mcp-spark/Extract";
import Clone from "./pages/mcp-spark/Clone";
import DeepResearch from "./pages/mcp-spark/DeepResearch";
import ProductResearch from "./pages/mcp-spark/ProductResearch";
import ContentAnalysis from "./pages/mcp-spark/ContentAnalysis";
import QuestionFinder from "./pages/mcp-spark/QuestionFinder";
import KeywordDashboard from "./pages/mcp-spark/KeywordDashboard";
import SearchVolume from "./pages/mcp-spark/SearchVolume";
import KeywordIdeas from "./pages/mcp-spark/KeywordIdeas";
import DifficultyAnalysis from "./pages/mcp-spark/DifficultyAnalysis";
import KeywordClustering from "./pages/mcp-spark/KeywordClustering";
import KeywordTrends from "./pages/mcp-spark/KeywordTrends";
import CompetitorKeywords from "./pages/mcp-spark/CompetitorKeywords";
import SerpCompetitors from "./pages/mcp-spark/SerpCompetitors";
import SerpFeatures from "./pages/mcp-spark/SerpFeatures";
import DomainAnalytics from "./pages/mcp-spark/DomainAnalytics";
import Backlinks from "./pages/mcp-spark/Backlinks";
import LinkOpportunities from "./pages/mcp-spark/LinkOpportunities";
import LocalSeo from "./pages/mcp-spark/LocalSeo";
import ResearchHistory from "./pages/mcp-spark/ResearchHistory";
import ScheduledReports from "./pages/mcp-spark/ScheduledReports";
import Monitoring from "./pages/mcp-spark/Monitoring";
import McpSettings from "./pages/mcp-spark/McpSettings";

// Daily Checks Pages
import DailyChecksLayout from "./pages/daily-checks/DailyChecksLayout";
import DailyChecksIndex from "./pages/daily-checks/Index";
import DailyWebsites from "./pages/daily-checks/Websites";
import DailySeoHealth from "./pages/daily-checks/SeoHealth";
import DailyKeywords from "./pages/daily-checks/Keywords";
import DailyRankings from "./pages/daily-checks/Rankings";
import DailyContentChanges from "./pages/daily-checks/ContentChanges";
import DailySettings from "./pages/daily-checks/DailySettings";

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
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/seo-research" element={<SeoResearchPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* MCP Spark Tools Section */}
              <Route path="/mcp-spark" element={<McpSparkLayout />}>
                <Route index element={<McpSparkIndex />} />
                {/* Web Tools */}
                <Route path="scrape" element={<Scrape />} />
                <Route path="crawl" element={<Crawl />} />
                <Route path="map" element={<MapTool />} />
                <Route path="search" element={<SearchTool />} />
                <Route path="extract" element={<Extract />} />
                <Route path="clone" element={<Clone />} />
                {/* Research Tools */}
                <Route path="deep-research" element={<DeepResearch />} />
                <Route path="products" element={<ProductResearch />} />
                <Route path="content-analysis" element={<ContentAnalysis />} />
                <Route path="questions" element={<QuestionFinder />} />
                {/* Keyword Tools */}
                <Route path="dashboard" element={<KeywordDashboard />} />
                <Route path="search-volume" element={<SearchVolume />} />
                <Route path="ideas" element={<KeywordIdeas />} />
                <Route path="difficulty" element={<DifficultyAnalysis />} />
                <Route path="clustering" element={<KeywordClustering />} />
                <Route path="trends" element={<KeywordTrends />} />
                {/* Competitor Analysis */}
                <Route path="competitor-keywords" element={<CompetitorKeywords />} />
                <Route path="serp-competitors" element={<SerpCompetitors />} />
                <Route path="serp-features" element={<SerpFeatures />} />
                <Route path="domain-analytics" element={<DomainAnalytics />} />
                {/* Link Analysis */}
                <Route path="backlinks" element={<Backlinks />} />
                <Route path="link-opportunities" element={<LinkOpportunities />} />
                {/* Local SEO */}
                <Route path="local-seo" element={<LocalSeo />} />
                {/* Configuration */}
                <Route path="history" element={<ResearchHistory />} />
                <Route path="scheduled-reports" element={<ScheduledReports />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="settings" element={<McpSettings />} />
              </Route>

              {/* Daily Checks Section */}
              <Route path="/daily-checks" element={<DailyChecksLayout />}>
                <Route index element={<DailyChecksIndex />} />
                <Route path="websites" element={<DailyWebsites />} />
                <Route path="seo-health" element={<DailySeoHealth />} />
                <Route path="keywords" element={<DailyKeywords />} />
                <Route path="rankings" element={<DailyRankings />} />
                <Route path="content-changes" element={<DailyContentChanges />} />
                <Route path="settings" element={<DailySettings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
