import { create } from 'zustand';
import { UserProfile, getStoredColegios, saveStoredColegios, getStoredUsers, saveStoredUsers } from '../supabase/client';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  colegio: { id: string; nombre: string; logo: string; plan?: string; color_primario?: string; limite_alumnos?: number; limite_personalizado?: number } | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
  updateUserProfile: (nombre: string, apellido: string, fotoUrl: string) => void;
  updateColegioInfo: (nombre: string, logo: string, colorPrimario?: string) => void;
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
              logo: school.logo,
              plan: school.plan,
              color_primario: school.color_primario,
              limite_alumnos: school.limite_alumnos,
              limite_personalizado: school.limite_personalizado
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
      let matchedUser = users.find(u => u.email === cleanEmail);

      if (!matchedUser) {
        // Dynamic Auto-Provisioning Engine
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
          
          // Buscar o crear colegio
          const colegios = getStoredColegios();
          let school = colegios.find(c => c.nombre.toLowerCase().trim() === finalSchoolName.toLowerCase().trim());
          if (!school) {
            const newSchoolId = crypto.randomUUID();
            school = {
              id: newSchoolId,
              nombre: finalSchoolName,
              logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80',
              ruc: '20' + Math.floor(100000000 + Math.random() * 900000000),
              activo: true,
              plan: 'Premium SaaS',
              mensualidad: 1500,
              vencimiento: '2026-12-31',
              limite_alumnos: 99999,
              limite_personalizado: 0
            };
            colegios.push(school);
            saveStoredColegios(colegios);

            // Seed data for this new school automatically!
            const { seedDataForNewSchool } = require('../supabase/client');
            seedDataForNewSchool(newSchoolId, finalSchoolName);
          }

          // Crear usuario
          const newUserId = crypto.randomUUID();
          const roleNames: Record<string, { nombre: string, apellido: string }> = {
            superadmin: { nombre: 'Admin', apellido: 'Global' },
            director: { nombre: 'Roberto', apellido: 'Mendoza' },
            docente: { nombre: 'María', apellido: 'Gutiérrez' },
            padre: { nombre: 'Sofía', apellido: 'Castro' },
            alumno: { nombre: 'Mateo', apellido: 'Castro' }
          };
          const { nombre, apellido } = roleNames[role] || { nombre: 'Usuario', apellido: 'Demo' };
          
          matchedUser = {
            id: newUserId,
            colegio_id: role === 'superadmin' ? null : school.id,
            rol: role,
            nombre: `${nombre} (${schoolName})`,
            apellido: apellido,
            dni: Math.floor(10000000 + Math.random() * 90000000).toString(),
            foto_url: role === 'superadmin' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
              : role === 'director' ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80'
              : role === 'docente' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
              : role === 'padre' ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
              : 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80',
            email: cleanEmail,
            activo: true,
            password: password || 'admin123'
          };
          
          const freshUsers = getStoredUsers();
          freshUsers.push(matchedUser);
          saveStoredUsers(freshUsers);
        }
      }

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
              logo: school.logo,
              plan: school.plan,
              color_primario: school.color_primario,
              limite_alumnos: school.limite_alumnos,
              limite_personalizado: school.limite_personalizado
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
    },
    updateColegioInfo: (nombre: string, logo: string, colorPrimario?: string) => {
      const { colegio } = get();
      if (!colegio) return;
      const updatedColegio = { 
        ...colegio, 
        nombre, 
        logo, 
        color_primario: colorPrimario 
      };
      set({ colegio: updatedColegio });
    }
  };
});
