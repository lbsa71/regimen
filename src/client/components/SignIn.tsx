import React, { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SignInProps {
  clientId: string;
}

export function SignIn({ clientId }: SignInProps): React.ReactElement {
  const { isLoading } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;

    const renderButton = () => {
      if (window.google && buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
        });
      }
    };

    // Try to render immediately if Google is already loaded
    if (window.google) {
      // Reinitialize with the client ID
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: () => {
          // This callback is handled by AuthProvider
        },
      });
      renderButton();
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: () => {
              // This callback is handled by AuthProvider
            },
          });
          renderButton();
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, [clientId, isLoading]);

  if (isLoading) {
    return <div className="sign-in__loading">Loading...</div>;
  }

  return (
    <div className="sign-in">
      <h1 className="sign-in__title">regimen</h1>
      <p className="sign-in__subtitle">
        Simple training tracker - do stuff, do it evenly, and not too often
      </p>
      <div ref={buttonRef} className="sign-in__button" />
    </div>
  );
}
