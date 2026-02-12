import { create } from "zustand";

type User = {
  id: string;
  fullName: string;
  email: string;
  roleCode: string;
};

type AuthState = {
  accessToken: string | null;
  user: User | null;
  setAuth: (payload: { accessToken: string; user: User }) => void;
  clearAuth: () => void;
};

const storageKey = "hfr-ppe-auth";

function readStorage(): Pick<AuthState, "accessToken" | "user"> {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return { accessToken: null, user: null };
  try {
    const parsed = JSON.parse(raw) as { accessToken: string; user: User };
    return {
      accessToken: parsed.accessToken,
      user: parsed.user,
    };
  } catch {
    return { accessToken: null, user: null };
  }
}

function persist(accessToken: string | null, user: User | null) {
  if (!accessToken || !user) {
    localStorage.removeItem(storageKey);
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify({ accessToken, user }));
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readStorage(),
  setAuth: ({ accessToken, user }) =>
    set(() => {
      persist(accessToken, user);
      return { accessToken, user };
    }),
  clearAuth: () =>
    set(() => {
      persist(null, null);
      return { accessToken: null, user: null };
    }),
}));
