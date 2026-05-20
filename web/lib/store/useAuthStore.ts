import { create } from 'zustand';
import { UserProfile, MOCK_USERS } from '../supabase/client';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  colegio: { id: string; nombre: string; logo: string } | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Intentar cargar la sesión del localStorage si existe
  let initialUser: UserProfile | null = null;
  let initialColegio = null;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('linkedu_session');
    if (saved) {
      try {
        initialUser = JSON.parse(saved);
        initialColegio = {
          id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          nombre: 'Colegio de Excelencia Linkedu',
          logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80'
        };
      } catch (e) {
        console.error("Error al parsear sesión guardada", e);
      }
    }
  }

  return {
    user: initialUser,
    loading: false,
    colegio: initialColegio,
    login: async (email: string) => {
      set({ loading: true });
      // Simular retraso de red
      await new Promise((resolve) => setTimeout(resolve, 800));

      const matchedUser = MOCK_USERS[email.toLowerCase().trim()];
      if (matchedUser) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('linkedu_session', JSON.stringify(matchedUser));
        }
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('linkedu_session');
      }
      set({ user: null, colegio: null });
    },
    setUser: (user) => set({ user })
  };
});
