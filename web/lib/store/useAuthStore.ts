import { create } from 'zustand';
import { UserProfile, getStoredColegios, getStoredUsers, saveStoredUsers } from '../supabase/client';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  colegio: { id: string; nombre: string; logo: string } | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
  updateUserProfile: (nombre: string, apellido: string, fotoUrl: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Intentar cargar la sesión del localStorage si existe
  let initialUser: UserProfile | null = null;
  let initialColegio = null;
  
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('linkedu_session');
    if (saved) {
      try {
        initialUser = JSON.parse(saved);
        const currentUser = initialUser;
        if (currentUser && currentUser.colegio_id) {
          const colegios = getStoredColegios();
          const school = colegios.find(c => c.id === currentUser.colegio_id);
          if (school) {
            initialColegio = {
              id: school.id,
              nombre: school.nombre,
              logo: school.logo
            };
          }
        }
      } catch (e) {
        console.error("Error al parsear sesión guardada", e);
      }
    }
  }

  return {
    user: initialUser,
    loading: false,
    colegio: initialColegio,
    login: async (email: string, password?: string) => {
      set({ loading: true });
      // Simular retraso de red
      await new Promise((resolve) => setTimeout(resolve, 800));

      const cleanEmail = email.toLowerCase().trim();

      // Validar contraseña obligatoria para el Super Administrador
      if (cleanEmail === 'superadmin@linkedu.com') {
        if (!password || (password !== 'admin123' && password !== '••••••••')) {
          set({ loading: false });
          return false;
        }
      }

      const users = getStoredUsers();
      const matchedUser = users.find(u => u.email === cleanEmail);

      if (matchedUser) {
        // 1. Verificar si el usuario está inactivo
        if (matchedUser.activo === false) {
          set({ loading: false });
          alert("Tu cuenta ha sido desactivada. Comunícate con el administrador.");
          return false;
        }

        // 2. Verificar contraseña del usuario si tiene una asignada
        if (matchedUser.password && password !== undefined) {
          if (matchedUser.password !== password) {
            set({ loading: false });
            return false;
          }
        } else if (!matchedUser.password && cleanEmail !== 'superadmin@linkedu.com' && password !== undefined && password !== '') {
          // Para usuarios demo que no tienen contraseña guardada aún, permitimos interactivos con admin123 o 123456
          if (password !== 'admin123' && password !== '123456') {
            set({ loading: false });
            return false;
          }
        }

        // 2. Verificar si el colegio del usuario está inactivo (excluye Super Admin)
        if (matchedUser.rol !== 'superadmin' && matchedUser.colegio_id) {
          const colegios = getStoredColegios();
          const school = colegios.find(c => c.id === matchedUser.colegio_id);
          if (school && !school.activo) {
            set({ loading: false });
            alert("El servicio para tu colegio ha sido suspendido. Comunícate con Soporte.");
            return false;
          }
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('linkedu_session', JSON.stringify(matchedUser));
        }

        let matchedColegio = null;
        if (matchedUser.colegio_id) {
          const colegios = getStoredColegios();
          const school = colegios.find(c => c.id === matchedUser.colegio_id);
          if (school) {
            matchedColegio = {
              id: school.id,
              nombre: school.nombre,
              logo: school.logo
            };
          }
        }

        set({
          user: matchedUser,
          colegio: matchedColegio,
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
    setUser: (user) => set({ user }),
    updateUserProfile: (nombre: string, apellido: string, fotoUrl: string) => {
      const { user } = get();
      if (!user) return;
      const updated = { ...user, nombre, apellido, foto_url: fotoUrl };

      // Persistir en la lista de usuarios simulados
      const users = getStoredUsers();
      const updatedUsers = users.map(u => u.id === user.id ? { ...u, nombre, apellido, foto_url: fotoUrl } : u);
      saveStoredUsers(updatedUsers);

      // Persistir en la sesión activa del cliente
      if (typeof window !== 'undefined') {
        localStorage.setItem('linkedu_session', JSON.stringify(updated));
      }

      set({ user: updated });
    }
  };
});
