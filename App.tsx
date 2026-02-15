
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { User, AuthState } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('cw_user');
    if (savedUser) {
      return {
        user: JSON.parse(savedUser),
        isAuthenticated: true
      };
    }
    return {
      user: null,
      isAuthenticated: false
    };
  });

  useEffect(() => {
    // Listen for changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cw_user') {
        if (e.newValue) {
          setAuthState({ user: JSON.parse(e.newValue), isAuthenticated: true });
        } else {
          setAuthState({ user: null, isAuthenticated: false });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
    localStorage.setItem('cw_user', JSON.stringify(user));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAuthState(prev => ({ ...prev, user: updatedUser }));
    localStorage.setItem('cw_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem('cw_user');
  };

  return (
    <Layout>
      {authState.isAuthenticated && authState.user ? (
        <Dashboard 
          user={authState.user} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser} 
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </Layout>
  );
};

export default App;
