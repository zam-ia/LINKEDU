import { createClient } from '@supabase/supabase-js';

// Usamos el fallback de URL y Anon Key para el proyecto Linkedu en Supabase
const supabaseUrl = 'https://hhauwkcnpfithuqnyhss.supabase.co';
const supabaseAnonKey = 'sb_publishable_cwLDk2w3g6WocWhHbL2RaA_IiIoy5tn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  colegio_id: string;
  rol: 'director' | 'docente' | 'padre' | 'alumno';
  nombre: string;
  apellido: string;
  dni: string;
  foto_url: string;
}

export const MOCK_USERS: Record<string, UserProfile> = {
  'director@linkedu.com': {
    id: 'd1111111-1111-1111-1111-111111111111',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    rol: 'director',
    nombre: 'Roberto',
    apellido: 'Mendoza',
    dni: '44556677',
    foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80'
  },
  'docente@linkedu.com': {
    id: 'd2222222-2222-2222-2222-222222222222',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    rol: 'docente',
    nombre: 'María',
    apellido: 'Gutiérrez',
    dni: '11223344',
    foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  },
  'padre@linkedu.com': {
    id: 'f2222222-2222-2222-2222-222222222222',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    rol: 'padre',
    nombre: 'Sofía',
    apellido: 'Castro',
    dni: '99887766',
    foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
  },
  'alumno@linkedu.com': {
    id: 'a2222222-2222-2222-2222-222222222222',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    rol: 'alumno',
    nombre: 'Mateo',
    apellido: 'Castro',
    dni: '66554433',
    foto_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80'
  }
};
