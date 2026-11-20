import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import Analytics from './pages/Analytics';
import DataInsights from './pages/DataInsights';
import AboutProject from './pages/AboutProject';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="data" element={<DataManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="insights" element={<DataInsights />} />
        <Route path="about" element={<AboutProject />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

