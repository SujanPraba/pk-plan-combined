import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SessionContextType {
  username: string | null;
  setUsername: (username: string) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [username, setUsername] = useState<string | null>(null);

  const clearSession = () => {
    setUsername(null);
  };

  return (
    <SessionContext.Provider value={{
      username,
      setUsername,
      clearSession,
    }}>
      {children}
    </SessionContext.Provider>
  );
} 