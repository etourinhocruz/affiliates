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
  selectedHouse: string;
  setSelectedHouse: (key: string) => void;
};

const defaultUser: User = {
  name: 'Pierre',
  email: 'pierre@affiliates.com',
  role: 'Afiliado Ouro',
  pix: '',
  pixType: 'cpf',
};

const HOUSE_STORAGE_KEY = 'mg-selected-house';

function getInitialHouse(): string {
  if (typeof window === 'undefined') return 'all';
  return window.localStorage.getItem(HOUSE_STORAGE_KEY) ?? 'all';
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [selectedHouse, setSelectedHouseState] = useState<string>(getInitialHouse);

  const updateUser = useCallback(
    (patch: Partial<User>) => setUser((u) => ({ ...u, ...patch })),
    [],
  );

  const setSelectedHouse = useCallback((key: string) => {
    setSelectedHouseState(key);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HOUSE_STORAGE_KEY, key);
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, updateUser, selectedHouse, setSelectedHouse }),
    [user, updateUser, selectedHouse, setSelectedHouse],
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
