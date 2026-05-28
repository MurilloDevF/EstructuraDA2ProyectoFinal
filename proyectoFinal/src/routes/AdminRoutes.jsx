import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '../pages/Admin/Index.jsx';
import { Chat } from '../pages/Chat/Index.jsx';
import { MapPage } from '../pages/Map/Index.jsx';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
