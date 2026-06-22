import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase, type UserProfile } from '../supabase';

type ColegioState = { id: string; nombre: string; logo: string };

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  colegio: ColegioState | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

let initialized = false;

async function getProfile(authUser: User): Promise<{ user: UserProfile; colegio: ColegioState | null } | null> {
  const { data: profile, error } = await supabase.from('usuarios').select('id, colegio_id, rol, nombre, apellido, dni, foto_url, activo').eq('id', authUser.id).single();
  if (error || !profile || profile.activo === false) return null;

  let colegio: ColegioState | null = null;
  if (profile.colegio_id) {
    const { data: tenant } = await supabase.from('colegios').select('id, nombre, logo_url').eq('id', profile.colegio_id).single();
    if (tenant) colegio = { id: tenant.id, nombre: tenant.nombre, logo: tenant.logo_url || '' };
  }

  return {
    user: { ...profile, rol: profile.rol as UserProfile['rol'], foto_url: profile.foto_url || '', email: authUser.email },
    colegio,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  colegio: null,
  initialize: async () => {
    if (initialized) return;
    initialized = true;
    const { data } = await supabase.auth.getSession();
    const profile = data.session?.user ? await getProfile(data.session.user) : null;
    set(profile ? { ...profile, loading: false } : { user: null, colegio: null, loading: false });
    supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async () => {
        const current = session?.user ? await getProfile(session.user) : null;
        set(current ? { ...current, loading: false } : { user: null, colegio: null, loading: false });
      }, 0);
    });
  },
  login: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.user) {
      set({ loading: false });
      return false;
    }
    const profile = await getProfile(data.user);
    set(profile ? { ...profile, loading: false } : { user: null, colegio: null, loading: false });
    return Boolean(profile);
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, colegio: null, loading: false });
  },
  setUser: (user) => {
    const previous = get().user;
    set({ user });
    if (user && previous) void supabase.from('usuarios').update({ nombre: user.nombre, apellido: user.apellido, foto_url: user.foto_url }).eq('id', user.id);
  },
}));
