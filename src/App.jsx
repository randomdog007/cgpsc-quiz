import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import Sprite from "./components/layout/Sprite";
import Spinner from "./components/ui/Spinner";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const MainPage = lazy(() => import("./pages/MainPage"));
const SubjectPage = lazy(() => import("./pages/SubjectPage"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));
const RevisionPage = lazy(() => import("./pages/RevisionPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAppContext();
  if (authLoading) return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}><Spinner fallbackText="Loading..." /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { authLoading } = useAppContext();
  
  if (authLoading) {
    return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}><Spinner fallbackText="Loading..." /></div>;
  }

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}><Spinner fallbackText="Loading..." /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/subject/:id" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
        <Route path="/topic/:id" element={<ProtectedRoute><TopicPage /></ProtectedRoute>} />
        <Route path="/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/result/:id" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        <Route path="/revision" element={<ProtectedRoute><RevisionPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Sprite />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
