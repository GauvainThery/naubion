import React, { useState } from 'react';
import AdminLayout from '../components/templates/AdminLayout';
import LoginForm from '../components/molecules/LoginForm';
import AdminDashboard from '../components/organisms/AdminDashboard';
import { useAdminAuth, useAdminStats } from '../hooks/useAdmin';

const AdminPage: React.FC = () => {
  const { isAuthenticated, login, logout } = useAdminAuth();
  const { stats, refresh: refreshStats } = useAdminStats();
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (password: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      await login(password);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLoginError('');
  };

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <LoginForm onLogin={handleLogin} error={loginError} loading={loginLoading} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminDashboard stats={stats} onRefreshStats={refreshStats} onLogout={handleLogout} />
    </AdminLayout>
  );
};

export default AdminPage;
