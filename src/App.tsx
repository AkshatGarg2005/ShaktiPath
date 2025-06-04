import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/Toaster';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const CrimeFeedPage = lazy(() => import('./pages/CrimeFeedPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/map" 
                  element={
                    <ProtectedRoute>
                      <MapPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/crimes" 
                  element={
                    <ProtectedRoute>
                      <CrimeFeedPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/\" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;