import { create } from 'zustand';
import { UserProfile, MOCK_USERS } from '../supabase';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  colegio: { id: string; nombre: string; logo: string } | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    loading: false,
    colegio: null,
    login: async (email: string) => {
      set({ loading: true });
      await new Promise((resolve) => setTimeout(resolve, 600));

      const matchedUser = MOCK_USERS[email.toLowerCase().trim()];
      if (matchedUser) {
        set({
          user: matchedUser,
          colegio: {
            id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
            nombre: 'Colegio de Excelencia Linkedu',
            logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80'
          },
          loading: false
        });
        return true;
      }
      set({ loading: false });
      return false;
    },
    logout: () => {
      set({ user: null, colegio: null });
    },
    setUser: (user) => set({ user })
  };
});
