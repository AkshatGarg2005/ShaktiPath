import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MapPage from './components/MapPage';
import EditProfilePage from './components/EditProfilePage';
import { Shield, Loader, AlertTriangle, RefreshCw } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Shield className="h-12 w-12 text-purple-600 animate-pulse" />
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ShaktiPath
          </span>
        </div>
        
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Loader className="h-8 w-8 text-purple-600 animate-spin" />
          <span className="text-xl font-semibold text-gray-700">Restoring Your Session</span>
        </div>
        
        <p className="text-gray-600 mb-8">
          Checking your authentication status...
        </p>
        
        <div className="text-sm text-gray-500">
          This should only take a moment
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ error }: { error: string }) {
  const isSupabaseError = error.includes('Supabase not configured');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Shield className="h-12 w-12 text-red-600" />
          <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            ShaktiPath
          </span>
        </div>
        
        <div className="flex items-center justify-center space-x-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isSupabaseError ? 'Setup Required' : 'Connection Error'}
          </h1>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
          <p className="text-gray-600 mb-4">{error}</p>
          
          {isSupabaseError && (
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">To fix this:</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Click "Connect to Supabase" in the top right corner</li>
                <li>Follow the setup instructions</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
          
          {!isSupabaseError && (
            <button 
              onClick={() => window.location.href = '/'}
              className="border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isLoading, error } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
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
        path="/profile/edit" 
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;