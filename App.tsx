
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { User, AuthState } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check local storage for existing session on load
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

  const handleLoginSuccess = (user: User) => {
    setAuthState({
      user,
      isAuthenticated: true
    });
    localStorage.setItem('cw_user', JSON.stringify(user));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
    localStorage.setItem('cw_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
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
