import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Auth } from '../pages/Auth/Index.jsx';
import { UserRoutes } from './UserRoutes.jsx';
import { AdminRoutes } from './AdminRoutes.jsx';
import { Menu } from '../components/Shared/Menu.jsx';

export const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'sans-serif',
        backgroundColor: '#f7fafc',
        color: '#2d3748'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem', color: '#2b6cb0' }}>MediQueue</h2>
          <p>Cargando portal de salud...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Menu />
      <Routes>
        {!currentUser ? (
          <>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <>
            <Route path="/auth" element={<Navigate to="/" replace />} />
            {currentUser.role === 'doctor' ? (
              <Route path="/*" element={<AdminRoutes />} />
            ) : (
              <Route path="/*" element={<UserRoutes />} />
            )}
          </>
        )}
      </Routes>
    </>
  );
};
