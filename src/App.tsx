import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomerList } from './pages/Customers';
import { DocumentList } from './pages/DocumentList';
import { DocumentEditor } from './pages/DocumentEditor';
import { SettingsPage } from './pages/Settings';
import { storageService } from './services/storageService';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = storageService.isAuthenticated();
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

export default function App() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><DocumentList type="invoice" /></ProtectedRoute>} />
        <Route path="/invoices/new" element={<ProtectedRoute><DocumentEditor type="invoice" /></ProtectedRoute>} />
        <Route path="/invoices/edit/:id" element={<ProtectedRoute><DocumentEditor type="invoice" /></ProtectedRoute>} />
        <Route path="/quotes" element={<ProtectedRoute><DocumentList type="quote" /></ProtectedRoute>} />
        <Route path="/quotes/new" element={<ProtectedRoute><DocumentEditor type="quote" /></ProtectedRoute>} />
        <Route path="/quotes/edit/:id" element={<ProtectedRoute><DocumentEditor type="quote" /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
