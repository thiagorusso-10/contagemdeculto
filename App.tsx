import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { CampusDetails } from './pages/CampusDetails';
import { ReportForm } from './pages/ReportForm';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { History } from './pages/History';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <StoreProvider>
          <div className="font-sans antialiased text-black">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="/campus/:id" element={
                <ProtectedRoute>
                  <CampusDetails />
                </ProtectedRoute>
              } />
              <Route path="/report/new" element={
                <ProtectedRoute>
                  <ReportForm />
                </ProtectedRoute>
              } />
              <Route path="/report/edit/:id" element={
                <ProtectedRoute>
                  <ReportForm />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </StoreProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
