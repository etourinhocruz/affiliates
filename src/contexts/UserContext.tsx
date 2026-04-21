import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Role =
  | 'SUPER_ADMIN'
  | 'AGENCY'
  | 'MANAGER'
  | 'AFFILIATE'
  | 'SUB_AFFILIATE';

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
  role: Role;
  setRole: (role: Role) => void;
};

const defaultUser: User = {
  name: 'Pierre',
  email: 'pierre@affiliates.com',
  role: 'Afiliado Ouro',
  pix: '',
  pixType: 'cpf',
};

const HOUSE_STORAGE_KEY = 'mg-selected-house';
const ROLE_STORAGE_KEY = 'mg-active-role';

function getInitialHouse(): string {
  if (typeof window === 'undefined') return 'all';
  return window.localStorage.getItem(HOUSE_STORAGE_KEY) ?? 'all';
}

function getInitialRole(): Role {
  if (typeof window === 'undefined') return 'AFFILIATE';
  const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
  const valid: Role[] = ['SUPER_ADMIN', 'AGENCY', 'MANAGER', 'AFFILIATE', 'SUB_AFFILIATE'];
  return (valid as string[]).includes(stored ?? '') ? (stored as Role) : 'AFFILIATE';
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [selectedHouse, setSelectedHouseState] = useState<string>(getInitialHouse);
  const [role, setRoleState] = useState<Role>(getInitialRole);

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

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ROLE_STORAGE_KEY, r);
    }
  }, []);

  useEffect(() => {
    const roleDisplay: Record<Role, string> = {
      SUPER_ADMIN: 'Super Admin',
      AGENCY: 'Agência Parceira',
      MANAGER: 'Gerente',
      AFFILIATE: 'Afiliado Ouro',
      SUB_AFFILIATE: 'Sub-Afiliado',
    };
    setUser((u) => ({ ...u, role: roleDisplay[role] }));
  }, [role]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
      selectedHouse,
      setSelectedHouse,
      role,
      setRole,
    }),
    [user, updateUser, selectedHouse, setSelectedHouse, role, setRole],
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
