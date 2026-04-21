import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type User = {
  name: string;
  email: string;
  role: string;
  pix: string;
  pixType?: string;
};

type UserContextValue = {
  user: User;
  setUser: (user: User) => void;
  updateUser: (patch: Partial<User>) => void;
};

const defaultUser: User = {
  name: 'Pierre',
  email: 'pierre@affiliates.com',
  role: 'Afiliado Ouro',
  pix: '',
  pixType: 'cpf',
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

  const updateUser = useCallback(
    (patch: Partial<User>) => setUser((u) => ({ ...u, ...patch })),
    [],
  );

  const value = useMemo(
    () => ({ user, setUser, updateUser }),
    [user, updateUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}

export function getInitials(name: string) {
  const clean = name.trim();
  if (!clean) return '';
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
