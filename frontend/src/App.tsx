import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Header, ExerciseList, SignIn } from './components';
import './App.css';

// Read client ID from environment variable or meta tag
function getGoogleClientId(): string {
  // Check for environment variable (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }
  // Check for meta tag (for server-side injection)
  const metaTag = document.querySelector('meta[name="google-client-id"]');
  if (metaTag) {
    return metaTag.getAttribute('content') || '';
  }
  // Fallback for development
  console.warn('Google Client ID not configured');
  return '';
}

function AppContent(): React.ReactElement {
  const { user, isLoading } = useAuth();
  const clientId = getGoogleClientId();

  if (isLoading) {
    return (
      <div className="app__loading">
        <div className="app__loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <SignIn clientId={clientId} />;
  }

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <ExerciseList />
      </main>
    </div>
  );
}

export function App(): React.ReactElement {
  const clientId = getGoogleClientId();

  return (
    <AuthProvider clientId={clientId}>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
