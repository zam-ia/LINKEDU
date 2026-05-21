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

      const cleanEmail = email.toLowerCase().trim();
      let matchedUser = MOCK_USERS[cleanEmail];

      if (!matchedUser) {
        // Dynamic Auto-Provisioning Engine for Mobile
        const emailRegex = /^(director|docente|padre|alumno|superadmin)@([a-zA-Z0-9-]+)(?:\.[a-zA-Z0-9.]+)+$/i;
        const match = cleanEmail.match(emailRegex);
        if (match) {
          const role = match[1].toLowerCase() as 'superadmin' | 'director' | 'docente' | 'padre' | 'alumno';
          const domain = match[2];
          
          // Formatear nombre del colegio
          const schoolName = domain
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          const finalSchoolName = `Colegio ${schoolName}`;
          
          const roleNames: Record<string, { nombre: string, apellido: string }> = {
            superadmin: { nombre: 'Admin', apellido: 'Global' },
            director: { nombre: 'Roberto', apellido: 'Mendoza' },
            docente: { nombre: 'María', apellido: 'Gutiérrez' },
            padre: { nombre: 'Sofía', apellido: 'Castro' },
            alumno: { nombre: 'Mateo', apellido: 'Castro' }
          };
          const { nombre, apellido } = roleNames[role] || { nombre: 'Usuario', apellido: 'Demo' };

          matchedUser = {
            id: role === 'superadmin' ? 'f0000000-0000-0000-0000-000000000000' : 'd' + Math.floor(1111111 + Math.random() * 8888888).toString() + '-1111-1111-1111-111111111111',
            colegio_id: role === 'superadmin' ? null : 'c' + Math.floor(1111111 + Math.random() * 8888888).toString() + '-1111-1111-1111-111111111111',
            rol: role,
            nombre: `${nombre} (${schoolName})`,
            apellido: apellido,
            dni: Math.floor(10000000 + Math.random() * 90000000).toString(),
            foto_url: role === 'superadmin' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
              : role === 'director' ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80'
              : role === 'docente' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
              : role === 'padre' ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
              : 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80'
          };
          
          set({
            user: matchedUser,
            colegio: {
              id: matchedUser.colegio_id || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
              nombre: finalSchoolName,
              logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80'
            },
            loading: false
          });
          return true;
        }
      }

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
