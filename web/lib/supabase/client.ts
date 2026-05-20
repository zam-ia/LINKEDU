import { createClient } from '@supabase/supabase-js';

// URL y Anon Key desde las variables de entorno de Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hhauwkcnpfithuqnyhss.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cwLDk2w3g6WocWhHbL2RaA_IiIoy5tn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================================
// SIMULACIÓN PREMIUM DE BD DE RESPALDO (Fallback para el Demo Interactivo)
// En caso de que el cliente de Supabase en la nube no tenga las tablas 
// creadas o las credenciales no estén completamente autorizadas.
// =====================================================================

export interface UserProfile {
  id: string;
  colegio_id: string | null;
  rol: 'superadmin' | 'director' | 'docente' | 'padre' | 'alumno';
  nombre: string;
  apellido: string;
  dni: string;
  foto_url: string;
  email?: string;
  activo?: boolean;
}

export interface ColegioInfo {
  id: string;
  nombre: string;
  logo: string;
  ruc: string;
  activo: boolean;
}

export const INITIAL_COLEGIOS: ColegioInfo[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    nombre: 'Colegio de Excelencia Linkedu',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80',
    ruc: '20123456789',
    activo: true
  }
];

export const MOCK_USERS: Record<string, UserProfile> = {
  'superadmin@linkedu.com': {
    id: 'f0000000-0000-0000-0000-000000000000',
    colegio_id: null,
    rol: 'superadmin',
    nombre: 'Administrador',
    apellido: 'Global',
    dni: '00000000',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'superadmin@linkedu.com'
  },
  'director@linkedu.com': {
    id: 'd1111111-1111-1111-1111-111111111111',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    rol: 'director',
    nombre: 'Roberto',
    apellido: 'Mendoza',
    dni: '44556677',
    foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'director@linkedu.com'
  },
  'docente@linkedu.com': {
    id: 'd2222222-2222-2222-2222-222222222222',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    rol: 'docente',
    nombre: 'María',
    apellido: 'Gutiérrez',
    dni: '11223344',
    foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'docente@linkedu.com'
  },
  'padre@linkedu.com': {
    id: 'f2222222-2222-2222-2222-222222222222',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    rol: 'padre',
    nombre: 'Sofía',
    apellido: 'Castro',
    dni: '99887766',
    foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'padre@linkedu.com'
  },
  'alumno@linkedu.com': {
    id: 'a2222222-2222-2222-2222-222222222222',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    rol: 'alumno',
    nombre: 'Mateo',
    apellido: 'Castro',
    dni: '66554433',
    foto_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'alumno@linkedu.com'
  }
};

// =====================================================================
// FUNCIONES AUXILIARES DE GESTIÓN MOCK PERSISTENTE EN LOCALSTORAGE
// =====================================================================

export const getStoredColegios = (): ColegioInfo[] => {
  if (typeof window === 'undefined') return INITIAL_COLEGIOS;
  const saved = localStorage.getItem('linkedu_colegios');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('linkedu_colegios', JSON.stringify(INITIAL_COLEGIOS));
  return INITIAL_COLEGIOS;
};

export const saveStoredColegios = (colegios: ColegioInfo[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_colegios', JSON.stringify(colegios));
  }
};

export const getStoredUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return Object.values(MOCK_USERS);
  const saved = localStorage.getItem('linkedu_users');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  const defaultUsers = Object.values(MOCK_USERS);
  localStorage.setItem('linkedu_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const saveStoredUsers = (users: UserProfile[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_users', JSON.stringify(users));
  }
};

