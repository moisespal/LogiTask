import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  role: string | null;
  setRole: (role: string | null) => void;
}

const UserContext = createContext<UserContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [role, setRole] = useState<string | null>(() => {
    return localStorage.getItem('role');
  });

  return (
    <UserContext.Provider value={{ role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};