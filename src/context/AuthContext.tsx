import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PermissionKey,
  StaffAccount,
  StaffRole,
} from '../types/hospital';
import {
  computePasswordDigest,
  INITIAL_STAFF_ACCOUNTS,
  ROLE_DEFAULT_PERMISSIONS,
} from '../services/hospitalDemoData';

const STAFF_STORAGE_KEY = 'luxe_medical_staff_accounts_v1';
const SESSION_STORAGE_KEY = 'luxe_medical_active_session_v1';

interface AuthSessionToken {
  staffId: string;
  email: string;
  role: StaffRole;
  issuedAt: number;
  expiresAt: number;
}

interface AuthContextType {
  currentUser: StaffAccount | null;
  staffAccounts: StaffAccount[];
  isAuthenticated: boolean;
  sessionExpired: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithDemoRole: (role: StaffRole) => void;
  logout: () => void;
  requestPasswordReset: (
    email: string,
    newPassword: string
  ) => { success: boolean; message: string };
  hasPermission: (permission: PermissionKey) => boolean;
  // Admin Staff Management
  inviteStaff: (input: {
    name: string;
    email: string;
    role: StaffRole;
    department: string;
    title: string;
    tempPassword: string;
  }) => { success: boolean; error?: string };
  updateStaffRole: (staffId: string, newRole: StaffRole) => void;
  toggleStaffActive: (staffId: string) => void;
  toggleStaffPermission: (staffId: string, permission: PermissionKey) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadStaffAccounts(): StaffAccount[] {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse staff accounts, seeding defaults.', e);
  }
  return INITIAL_STAFF_ACCOUNTS;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(loadStaffAccounts);
  const [currentUser, setCurrentUser] = useState<StaffAccount | null>(() => {
    try {
      const rawToken =
        localStorage.getItem(SESSION_STORAGE_KEY) ||
        sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (rawToken) {
        const token: AuthSessionToken = JSON.parse(rawToken);
        if (token && token.expiresAt > Date.now()) {
          const allStaff = loadStaffAccounts();
          const matched = allStaff.find(
            (s) => s.id === token.staffId && s.active
          );
          if (matched) return matched;
        }
      }
    } catch (e) {
      console.warn('Invalid session token', e);
    }
    return null;
  });
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffAccounts));
      if (currentUser) {
        const updatedSelf = staffAccounts.find((s) => s.id === currentUser.id);
        if (updatedSelf && updatedSelf.active) {
          setCurrentUser(updatedSelf);
        } else if (updatedSelf && !updatedSelf.active) {
          setCurrentUser(null);
        }
      }
    } catch (e) {
      console.warn('Unable to save staff accounts', e);
    }
  }, [staffAccounts, currentUser]);

  const persistSession = (account: StaffAccount, rememberMe: boolean) => {
    const token: AuthSessionToken = {
      staffId: account.id,
      email: account.email,
      role: account.role,
      issuedAt: Date.now(),
      expiresAt: Date.now() + (rememberMe ? 7 * 24 : 8) * 60 * 60 * 1000,
    };
    const serialized = JSON.stringify(token);
    if (rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, serialized);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
      localStorage.setItem(SESSION_STORAGE_KEY, serialized);
    }
  };

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = true
    ): Promise<{ success: boolean; error?: string }> => {
      const cleanEmail = email.trim().toLowerCase();
      const account = staffAccounts.find(
        (s) => s.email.toLowerCase() === cleanEmail
      );

      if (!account) {
        return {
          success: false,
          error: 'No hospital staff account found for this email address.',
        };
      }

      if (!account.active) {
        return {
          success: false,
          error:
            'This staff account has been deactivated by an Administrator. Contact Hospital IT.',
        };
      }

      const expectedDigest = computePasswordDigest(password, account.email);
      if (account.passwordDigest !== expectedDigest) {
        return {
          success: false,
          error: 'Invalid credentials. Please verify your password or use the Demo Account selector.',
        };
      }

      const updatedAccount: StaffAccount = {
        ...account,
        lastLogin: new Date().toISOString(),
      };

      setStaffAccounts((prev) =>
        prev.map((s) => (s.id === account.id ? updatedAccount : s))
      );
      setCurrentUser(updatedAccount);
      setSessionExpired(false);
      persistSession(updatedAccount, rememberMe);

      return { success: true };
    },
    [staffAccounts]
  );

  const loginWithDemoRole = useCallback(
    (role: StaffRole) => {
      const demoAccount =
        staffAccounts.find((s) => s.role === role && s.active) ||
        INITIAL_STAFF_ACCOUNTS.find((s) => s.role === role)!;

      const updated: StaffAccount = {
        ...demoAccount,
        active: true,
        lastLogin: new Date().toISOString(),
      };

      setStaffAccounts((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setCurrentUser(updated);
      setSessionExpired(false);
      persistSession(updated, true);
    },
    [staffAccounts]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const requestPasswordReset = useCallback(
    (
      email: string,
      newPassword: string
    ): { success: boolean; message: string } => {
      const cleanEmail = email.trim().toLowerCase();
      const target = staffAccounts.find(
        (s) => s.email.toLowerCase() === cleanEmail
      );
      if (!target) {
        return {
          success: false,
          message: 'No registered staff member matches that hospital email.',
        };
      }
      if (newPassword.trim().length < 6) {
        return {
          success: false,
          message: 'New password must be at least 6 characters long.',
        };
      }

      const newDigest = computePasswordDigest(newPassword.trim(), target.email);
      setStaffAccounts((prev) =>
        prev.map((s) =>
          s.id === target.id ? { ...s, passwordDigest: newDigest } : s
        )
      );

      return {
        success: true,
        message: `Password reset verified for ${target.name} (${target.email}). You may now sign in with your updated password.`,
      };
    },
    [staffAccounts]
  );

  const hasPermission = useCallback(
    (permission: PermissionKey): boolean => {
      if (!currentUser || !currentUser.active) return false;
      if (currentUser.role === 'Administrator') return true;
      return currentUser.permissions.includes(permission);
    },
    [currentUser]
  );

  const inviteStaff = useCallback(
    (input: {
      name: string;
      email: string;
      role: StaffRole;
      department: string;
      title: string;
      tempPassword: string;
    }): { success: boolean; error?: string } => {
      const cleanEmail = input.email.trim().toLowerCase();
      if (staffAccounts.some((s) => s.email.toLowerCase() === cleanEmail)) {
        return {
          success: false,
          error: 'A staff account with this email already exists.',
        };
      }

      const newStaff: StaffAccount = {
        id: `STF-${Math.floor(200 + Math.random() * 799)}`,
        name: input.name.trim(),
        email: cleanEmail,
        role: input.role,
        department: input.department.trim() || 'Inpatient Operations',
        title: input.title.trim() || input.role,
        active: true,
        isDemoAccount: false,
        passwordDigest: computePasswordDigest(
          input.tempPassword || 'Hospital@2026',
          cleanEmail
        ),
        permissions: [...ROLE_DEFAULT_PERMISSIONS[input.role]],
        lastLogin: 'Never (Invited)',
      };

      setStaffAccounts((prev) => [newStaff, ...prev]);
      return { success: true };
    },
    [staffAccounts]
  );

  const updateStaffRole = useCallback((staffId: string, newRole: StaffRole) => {
    setStaffAccounts((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? {
              ...s,
              role: newRole,
              permissions: [...ROLE_DEFAULT_PERMISSIONS[newRole]],
            }
          : s
      )
    );
  }, []);

  const toggleStaffActive = useCallback((staffId: string) => {
    setStaffAccounts((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, active: !s.active } : s))
    );
  }, []);

  const toggleStaffPermission = useCallback(
    (staffId: string, permission: PermissionKey) => {
      setStaffAccounts((prev) =>
        prev.map((s) => {
          if (s.id !== staffId) return s;
          const exists = s.permissions.includes(permission);
          const nextPerms = exists
            ? s.permissions.filter((p) => p !== permission)
            : [...s.permissions, permission];
          return { ...s, permissions: nextPerms };
        })
      );
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        staffAccounts,
        isAuthenticated: !!currentUser,
        sessionExpired,
        login,
        loginWithDemoRole,
        logout,
        requestPasswordReset,
        hasPermission,
        inviteStaff,
        updateStaffRole,
        toggleStaffActive,
        toggleStaffPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
