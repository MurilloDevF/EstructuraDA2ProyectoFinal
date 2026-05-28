import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HospitalProvider } from './context/HospitalContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HospitalProvider>
          <AppRoutes />
        </HospitalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
