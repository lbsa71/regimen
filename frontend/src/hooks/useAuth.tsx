import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContextValue, GoogleUser } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: { theme: string; size: string }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function parseJwt(token: string): GoogleUser {
  const base64Url = token.split('.')[1];
  if (!base64Url) {
    throw new Error('Invalid JWT token');
  }
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  const payload = JSON.parse(jsonPayload);
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

interface AuthProviderProps {
  children: ReactNode;
  clientId: string;
}

export function AuthProvider({ children, clientId }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleCredentialResponse = useCallback((response: { credential: string }) => {
    const credential = response.credential;
    const userData = parseJwt(credential);
    setUser(userData);
    setToken(credential);
    localStorage.setItem('auth_token', credential);
  }, []);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      try {
        const userData = parseJwt(storedToken);
        // Check if token is still valid (not expired)
        const tokenPart = storedToken.split('.')[1];
        if (!tokenPart) {
          throw new Error('Invalid token format');
        }
        const payload = JSON.parse(atob(tokenPart));
        if (payload.exp * 1000 > Date.now()) {
          setUser(userData);
          setToken(storedToken);
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch {
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [clientId, handleCredentialResponse]);

  const signIn = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
