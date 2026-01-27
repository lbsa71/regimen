import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function Header(): React.ReactElement {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <h1 className="header__title">regimen</h1>
      {user && (
        <div className="header__user">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="header__user-avatar"
            />
          )}
          <span className="header__user-name">{user.name}</span>
          <button onClick={signOut} className="header__sign-out-btn">
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
