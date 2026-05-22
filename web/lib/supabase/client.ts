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
  password?: string;
}

export interface ColegioInfo {
  id: string;
  nombre: string;
  logo: string;
  ruc: string;
  activo: boolean;
  plan?: string; // 'Básico SaaS' | 'Estandar SaaS' | 'Premium SaaS'
  mensualidad?: number;
  vencimiento?: string;
  color_primario?: string;
  // Nuevos atributos comerciales VIP
  limite_alumnos?: number;
  soporte_prioritario?: 'estándar' | 'preferente' | 'prioritario';
  limite_personalizado?: number;
  observaciones_comerciales?: string;
}

export const INITIAL_COLEGIOS: ColegioInfo[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    nombre: 'Colegio de Excelencia Linkedu',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80',
    ruc: '20123456789',
    activo: true,
    plan: 'Premium SaaS',
    mensualidad: 1199,
    vencimiento: '2026-06-15',
    limite_alumnos: 99999,
    soporte_prioritario: 'prioritario',
    observaciones_comerciales: 'Colegio de prueba VIP. Excelente uso de todos los módulos activos.'
  },
  {
    id: 'b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e',
    nombre: 'Liceo Naval Almirante Guise',
    logo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=100&h=100&q=80',
    ruc: '20987654321',
    activo: true,
    plan: 'Premium SaaS',
    mensualidad: 1199,
    vencimiento: '2026-06-02',
    limite_alumnos: 99999,
    soporte_prioritario: 'prioritario',
    observaciones_comerciales: 'Institución de alto nivel. Interesados en activar pasarela bancaria integrada en el próximo trimestre.'
  },
  {
    id: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    nombre: 'Colegio San Agustín',
    logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=100&h=100&q=80',
    ruc: '20556677889',
    activo: true,
    plan: 'Estandar SaaS',
    mensualidad: 799,
    vencimiento: '2026-05-28', // ¡Próximo a vencer!
    limite_alumnos: 400,
    soporte_prioritario: 'preferente',
    observaciones_comerciales: 'Soporte preferente activo. Tienen planeado migrar al plan Premium para el segundo semestre académico.'
  },
  {
    id: 'd4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
    nombre: 'I.E. Juana Alarco de Dammert',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=100&h=100&q=80',
    ruc: '20443322115',
    activo: false,
    plan: 'Básico SaaS',
    mensualidad: 399,
    vencimiento: '2026-05-10', // ¡Suspendido / Vencido!
    limite_alumnos: 150,
    soporte_prioritario: 'estándar',
    observaciones_comerciales: 'Cuenta suspendida temporalmente por falta de pago. Director Roberto Mendoza indica regularización para fines de mayo.'
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

export interface LinkeduLead {
  id: string;
  nombre: string;
  email: string;
  colegio: string;
  telefono: string;
  fecha: string;
  atendido?: boolean;
}

export const getStoredLeads = (): LinkeduLead[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('linkedu_leads');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  const defaultLeads: LinkeduLead[] = [
    {
      id: 'lead-1',
      nombre: 'Juan Carlos Torres',
      email: 'jtorres@colegiosanignacio.edu.pe',
      colegio: 'Colegio San Ignacio',
      telefono: '+51 983 234 567',
      fecha: '2026-05-20',
      atendido: false
    },
    {
      id: 'lead-2',
      nombre: 'Mirtha Villanueva',
      email: 'mvillanueva@colegiosantaisabel.com',
      colegio: 'Colegio Santa Isabel',
      telefono: '+51 945 876 123',
      fecha: '2026-05-21',
      atendido: true
    },
    {
      id: 'lead-3',
      nombre: 'Alejandro Mendoza',
      email: 'amendoza@liceobolognesi.edu.pe',
      colegio: 'Liceo Coronel Bolognesi',
      telefono: '+51 991 432 098',
      fecha: '2026-05-22',
      atendido: false
    }
  ];
  localStorage.setItem('linkedu_leads', JSON.stringify(defaultLeads));
  return defaultLeads;
};

export const saveStoredLeads = (leads: LinkeduLead[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_leads', JSON.stringify(leads));
  }
};

// =====================================================================
// NUEVAS INTERFACES Y MOCKS COMPLETOS DE LA BASE DE DATOS INTERACTIVA
// =====================================================================

export interface AlumnoInfo {
  id: string;
  colegio_id: string;
  nombre: string;
  apellido: string;
  dni: string;
  foto_url: string;
  email: string;
  grado: string;
  seccion: string;
  estado: 'activo' | 'inactivo';
  financiero: 'al_dia' | 'en_mora' | 'pendiente';
  contacto_tutor: {
    nombre: string;
    relacion: string;
    telefono: string;
    email: string;
  };
  datos_medicos: {
    sangre: string;
    alergias: string[];
    condiciones: string;
    seguro: string;
  };
}

export interface DocenteInfo {
  id: string;
  colegio_id: string;
  nombre: string;
  apellido: string;
  dni: string;
  foto_url: string;
  email: string;
  especialidad: string;
  contrato: 'planilla' | 'honorarios';
  salario: number;
  estado: 'activo' | 'inactivo';
  cursos_asignados: { curso: string; seccion: string; horas: number }[];
}

export interface PagoInfo {
  id: string;
  colegio_id: string;
  alumno_id: string | null; // null si es egreso general
  concepto: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  categoria: 'Matrícula' | 'Pensión' | 'Planilla' | 'Servicios' | 'Proveedores' | 'Mantenimiento' | 'Otro';
  fecha: string;
  vencimiento: string | null;
  estado: 'pagado' | 'pendiente' | 'vencido';
  metodo: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Otro' | null;
  comprobante: string | null;
}

export interface AsistenciaInfo {
  id: string;
  colegio_id: string;
  alumno_id: string;
  fecha: string;
  curso: string;
  estado: 'P' | 'T' | 'F'; // P: Presente, T: Tardanza, F: Falta
}

export interface EvaluacionInfo {
  id: string;
  colegio_id: string;
  curso: string;
  periodo: string; // 'Bimestre I', 'Bimestre II', etc.
  nombre: string;
  tipo: 'examen' | 'tarea' | 'taller' | 'participacion';
  peso: number;
}

export interface NotaInfo {
  id: string;
  colegio_id: string;
  alumno_id: string;
  evaluacion_id: string;
  nota: number;
}

// ── MOCKS INICIALES DE LA BASE DE DATOS ──────────────────────────────

export const INITIAL_ALUMNOS: AlumnoInfo[] = [
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', // Colegio de Excelencia
    nombre: 'Mateo',
    apellido: 'Castro',
    dni: '66554433',
    foto_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'alumno@linkedu.com',
    grado: '1ro Primaria',
    seccion: 'A',
    estado: 'activo',
    financiero: 'en_mora',
    contacto_tutor: {
      nombre: 'Sofía Castro',
      relacion: 'Madre',
      telefono: '998877665',
      email: 'padre@linkedu.com'
    },
    datos_medicos: {
      sangre: 'O+',
      alergias: ['Penicilina'],
      condiciones: 'Asma leve',
      seguro: 'Privado'
    }
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    nombre: 'Lucas',
    apellido: 'Castro',
    dni: '88776655',
    foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'lucas@linkedu.com',
    grado: '2do Primaria',
    seccion: 'A',
    estado: 'activo',
    financiero: 'pendiente',
    contacto_tutor: {
      nombre: 'Sofía Castro',
      relacion: 'Madre',
      telefono: '998877665',
      email: 'padre@linkedu.com'
    },
    datos_medicos: {
      sangre: 'A+',
      alergias: [],
      condiciones: 'Ninguna',
      seguro: 'EsSalud'
    }
  }
];

export const INITIAL_DOCENTES: DocenteInfo[] = [
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    nombre: 'María',
    apellido: 'Gutiérrez',
    dni: '11223344',
    foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'docente@linkedu.com',
    especialidad: 'Matemática y Ciencias',
    contrato: 'planilla',
    salario: 1500,
    estado: 'activo',
    cursos_asignados: [
      { curso: 'Matemática Divertida', seccion: '1ro Primaria - A', horas: 8 },
      { curso: 'Matemática Divertida', seccion: '2do Primaria - A', horas: 8 }
    ]
  }
];

export const INITIAL_PAGOS: PagoInfo[] = [
  {
    id: 'p1',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    alumno_id: 'a2222222-2222-2222-2222-222222222222', // Mateo
    concepto: 'Pensión Mensual Mayo',
    monto: 380,
    tipo: 'ingreso',
    categoria: 'Pensión',
    fecha: '2026-05-01',
    vencimiento: '2026-05-10',
    estado: 'vencido',
    metodo: null,
    comprobante: null
  },
  {
    id: 'p2',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    alumno_id: 'a3333333-3333-3333-3333-333333333333', // Lucas
    concepto: 'Pensión Mensual Mayo',
    monto: 380,
    tipo: 'ingreso',
    categoria: 'Pensión',
    fecha: '2026-05-01',
    vencimiento: '2026-05-31',
    estado: 'pendiente',
    metodo: null,
    comprobante: null
  },
  {
    id: 'p3',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    alumno_id: null,
    concepto: 'Planillas docentes Mayo 2026',
    monto: 1500,
    tipo: 'egreso',
    categoria: 'Planilla',
    fecha: '2026-05-15',
    vencimiento: null,
    estado: 'pagado',
    metodo: 'Transferencia',
    comprobante: 'Planilla_Mayo.pdf'
  },
  {
    id: 'p4',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    alumno_id: null,
    concepto: 'Pago de luz e internet',
    monto: 350,
    tipo: 'egreso',
    categoria: 'Servicios',
    fecha: '2026-05-10',
    vencimiento: null,
    estado: 'pagado',
    metodo: 'Tarjeta',
    comprobante: 'Enel_Recibo_05.pdf'
  }
];

export const INITIAL_ASISTENCIAS: AsistenciaInfo[] = [
  {
    id: 'as1',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    alumno_id: 'a2222222-2222-2222-2222-222222222222', // Mateo
    fecha: '2026-05-21',
    curso: 'Matemática Divertida',
    estado: 'F' // Falta
  },
  {
    id: 'as2',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    alumno_id: 'a3333333-3333-3333-3333-333333333333', // Lucas
    fecha: '2026-05-21',
    curso: 'Matemática Divertida',
    estado: 'P' // Presente
  }
];

export const INITIAL_EVALUACIONES: EvaluacionInfo[] = [
  {
    id: 'ev1',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    curso: 'Matemática Divertida',
    periodo: 'Bimestre I',
    nombre: 'Examen Parcial',
    tipo: 'examen',
    peso: 30
  },
  {
    id: 'ev2',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    curso: 'Matemática Divertida',
    periodo: 'Bimestre I',
    nombre: 'Tareas y Talleres',
    tipo: 'tarea',
    peso: 30
  },
  {
    id: 'ev3',
    colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    curso: 'Matemática Divertida',
    periodo: 'Bimestre I',
    nombre: 'Examen Bimestral',
    tipo: 'examen',
    peso: 40
  }
];

export const INITIAL_NOTAS: NotaInfo[] = [
  // Notas de Mateo
  { id: 'n1', colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', alumno_id: 'a2222222-2222-2222-2222-222222222222', evaluacion_id: 'ev1', nota: 11 },
  { id: 'n2', colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', alumno_id: 'a2222222-2222-2222-2222-222222222222', evaluacion_id: 'ev2', nota: 12 },
  { id: 'n3', colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', alumno_id: 'a2222222-2222-2222-2222-222222222222', evaluacion_id: 'ev3', nota: 10 },
  // Notas de Lucas
  { id: 'n4', colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', alumno_id: 'a3333333-3333-3333-3333-333333333333', evaluacion_id: 'ev1', nota: 17 },
  { id: 'n5', colegio_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', alumno_id: 'a3333333-3333-3333-3333-333333333333', evaluacion_id: 'ev2', nota: 16.6 }
];

// ── FUNCIONES DE ACCESO LOCALSTORAGE ──────────────────────────────────

export const getStoredAlumnos = (): AlumnoInfo[] => {
  if (typeof window === 'undefined') return INITIAL_ALUMNOS;
  const saved = localStorage.getItem('linkedu_alumnos');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('linkedu_alumnos', JSON.stringify(INITIAL_ALUMNOS));
  return INITIAL_ALUMNOS;
};

export const saveStoredAlumnos = (alumnos: AlumnoInfo[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_alumnos', JSON.stringify(alumnos));
  }
};

export const getStoredDocentes = (): DocenteInfo[] => {
  if (typeof window === 'undefined') return INITIAL_DOCENTES;
  const saved = localStorage.getItem('linkedu_docentes');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('linkedu_docentes', JSON.stringify(INITIAL_DOCENTES));
  return INITIAL_DOCENTES;
};

export const saveStoredDocentes = (docentes: DocenteInfo[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_docentes', JSON.stringify(docentes));
  }
};

export const getStoredPagos = (): PagoInfo[] => {
  if (typeof window === 'undefined') return INITIAL_PAGOS;
  const saved = localStorage.getItem('linkedu_pagos');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('linkedu_pagos', JSON.stringify(INITIAL_PAGOS));
  return INITIAL_PAGOS;
};

export const saveStoredPagos = (pagos: PagoInfo[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_pagos', JSON.stringify(pagos));
  }
};

export const getStoredAsistencias = (): AsistenciaInfo[] => {
  if (typeof window === 'undefined') return INITIAL_ASISTENCIAS;
  const saved = localStorage.getItem('linkedu_asistencias');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('linkedu_asistencias', JSON.stringify(INITIAL_ASISTENCIAS));
  return INITIAL_ASISTENCIAS;
};

export const saveStoredAsistencias = (asistencias: AsistenciaInfo[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_asistencias', JSON.stringify(asistencias));
  }
};

export const getStoredEvaluaciones = (): EvaluacionInfo[] => {
  if (typeof window === 'undefined') return INITIAL_EVALUACIONES;
  const saved = localStorage.getItem('linkedu_evaluaciones');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('linkedu_evaluaciones', JSON.stringify(INITIAL_EVALUACIONES));
  return INITIAL_EVALUACIONES;
};

export const saveStoredEvaluaciones = (evaluaciones: EvaluacionInfo[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_evaluaciones', JSON.stringify(evaluaciones));
  }
};

export const getStoredNotas = (): NotaInfo[] => {
  if (typeof window === 'undefined') return INITIAL_NOTAS;
  const saved = localStorage.getItem('linkedu_notas');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('linkedu_notas', JSON.stringify(INITIAL_NOTAS));
  return INITIAL_NOTAS;
};

export const saveStoredNotas = (notas: NotaInfo[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkedu_notas', JSON.stringify(notas));
  }
};

export const seedDataForNewSchool = (newColegioId: string, schoolName: string) => {
  if (typeof window === 'undefined') return;

  // 1. Seed Alumnos
  const alumnos = getStoredAlumnos();
  const alreadyHasAlumnos = alumnos.some(a => a.colegio_id === newColegioId);
  if (!alreadyHasAlumnos) {
    const mateoId = crypto.randomUUID();
    const lucasId = crypto.randomUUID();
    
    const newAlumnos: AlumnoInfo[] = [
      {
        id: mateoId,
        colegio_id: newColegioId,
        nombre: 'Mateo',
        apellido: `Castro (${schoolName.replace('Colegio ', '')})`,
        dni: '66554433',
        foto_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80',
        email: `alumno@${schoolName.toLowerCase().replace(/\s+/g, '').replace('colegio', '')}.com`,
        grado: '1ro Primaria',
        seccion: 'A',
        estado: 'activo',
        financiero: 'en_mora',
        contacto_tutor: {
          nombre: `Sofía Castro`,
          relacion: 'Madre',
          telefono: '998877665',
          email: `padre@${schoolName.toLowerCase().replace(/\s+/g, '').replace('colegio', '')}.com`
        },
        datos_medicos: {
          sangre: 'O+',
          alergias: ['Penicilina'],
          condiciones: 'Asma leve',
          seguro: 'Privado'
        }
      },
      {
        id: lucasId,
        colegio_id: newColegioId,
        nombre: 'Lucas',
        apellido: `Castro (${schoolName.replace('Colegio ', '')})`,
        dni: '88776655',
        foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
        email: `lucas@${schoolName.toLowerCase().replace(/\s+/g, '').replace('colegio', '')}.com`,
        grado: '2do Primaria',
        seccion: 'A',
        estado: 'activo',
        financiero: 'pendiente',
        contacto_tutor: {
          nombre: `Sofía Castro`,
          relacion: 'Madre',
          telefono: '998877665',
          email: `padre@${schoolName.toLowerCase().replace(/\s+/g, '').replace('colegio', '')}.com`
        },
        datos_medicos: {
          sangre: 'A+',
          alergias: [],
          condiciones: 'Ninguna',
          seguro: 'EsSalud'
        }
      }
    ];
    saveStoredAlumnos([...alumnos, ...newAlumnos]);

    // 2. Seed Docentes
    const docentes = getStoredDocentes();
    const newDocentes: DocenteInfo[] = [
      {
        id: crypto.randomUUID(),
        colegio_id: newColegioId,
        nombre: 'María',
        apellido: `Gutiérrez (${schoolName.replace('Colegio ', '')})`,
        dni: '11223344',
        foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
        email: `docente@${schoolName.toLowerCase().replace(/\s+/g, '').replace('colegio', '')}.com`,
        especialidad: 'Matemática y Ciencias',
        contrato: 'planilla',
        salario: 1500,
        estado: 'activo',
        cursos_asignados: [
          { curso: 'Matemática Divertida', seccion: '1ro Primaria - A', horas: 8 },
          { curso: 'Matemática Divertida', seccion: '2do Primaria - A', horas: 8 }
        ]
      }
    ];
    saveStoredDocentes([...docentes, ...newDocentes]);

    // 3. Seed Pagos
    const pagos = getStoredPagos();
    const newPagos: PagoInfo[] = [
      {
        id: crypto.randomUUID(),
        colegio_id: newColegioId,
        alumno_id: mateoId,
        concepto: 'Pensión Mensual Mayo',
        monto: 380,
        tipo: 'ingreso',
        categoria: 'Pensión',
        fecha: '2026-05-01',
        vencimiento: '2026-05-10',
        estado: 'vencido',
        metodo: null,
        comprobante: null
      },
      {
        id: crypto.randomUUID(),
        colegio_id: newColegioId,
        alumno_id: lucasId,
        concepto: 'Pensión Mensual Mayo',
        monto: 380,
        tipo: 'ingreso',
        categoria: 'Pensión',
        fecha: '2026-05-01',
        vencimiento: '2026-05-31',
        estado: 'pendiente',
        metodo: null,
        comprobante: null
      },
      {
        id: crypto.randomUUID(),
        colegio_id: newColegioId,
        alumno_id: null,
        concepto: 'Planillas docentes Mayo 2026',
        monto: 1500,
        tipo: 'egreso',
        categoria: 'Planilla',
        fecha: '2026-05-15',
        vencimiento: null,
        estado: 'pagado',
        metodo: 'Transferencia',
        comprobante: 'Planilla_Mayo.pdf'
      }
    ];
    saveStoredPagos([...pagos, ...newPagos]);

    // 4. Seed Asistencias
    const asistencias = getStoredAsistencias();
    const newAsistencias: AsistenciaInfo[] = [
      { id: crypto.randomUUID(), colegio_id: newColegioId, alumno_id: mateoId, fecha: '2026-05-21', curso: 'Matemática Divertida', estado: 'F' },
      { id: crypto.randomUUID(), colegio_id: newColegioId, alumno_id: lucasId, fecha: '2026-05-21', curso: 'Matemática Divertida', estado: 'P' }
    ];
    saveStoredAsistencias([...asistencias, ...newAsistencias]);

    // 5. Seed Evaluaciones
    const evaluaciones = getStoredEvaluaciones();
    const ev1Id = crypto.randomUUID();
    const ev2Id = crypto.randomUUID();
    const ev3Id = crypto.randomUUID();
    const newEvaluaciones: EvaluacionInfo[] = [
      { id: ev1Id, colegio_id: newColegioId, curso: 'Matemática Divertida', periodo: 'Bimestre I', nombre: 'Examen Parcial', tipo: 'examen', peso: 30 },
      { id: ev2Id, colegio_id: newColegioId, curso: 'Matemática Divertida', periodo: 'Bimestre I', nombre: 'Tareas y Talleres', tipo: 'tarea', peso: 30 },
      { id: ev3Id, colegio_id: newColegioId, curso: 'Matemática Divertida', periodo: 'Bimestre I', nombre: 'Examen Bimestral', tipo: 'examen', peso: 40 }
    ];
    saveStoredEvaluaciones([...evaluaciones, ...newEvaluaciones]);

    // 6. Seed Notas
    const notas = getStoredNotas();
    const newNotas: NotaInfo[] = [
      { id: crypto.randomUUID(), colegio_id: newColegioId, alumno_id: mateoId, evaluacion_id: ev1Id, nota: 11 },
      { id: crypto.randomUUID(), colegio_id: newColegioId, alumno_id: mateoId, evaluacion_id: ev2Id, nota: 12 },
      { id: crypto.randomUUID(), colegio_id: newColegioId, alumno_id: mateoId, evaluacion_id: ev3Id, nota: 10 },
      { id: crypto.randomUUID(), colegio_id: newColegioId, alumno_id: lucasId, evaluacion_id: ev1Id, nota: 17 },
      { id: crypto.randomUUID(), colegio_id: newColegioId, alumno_id: lucasId, evaluacion_id: ev2Id, nota: 16.6 }
    ];
    saveStoredNotas([...notas, ...newNotas]);

    // 7. Seed corresponding Padre & Alumno users so they can log in too!
    const users = getStoredUsers();
    const newUsers: UserProfile[] = [
      {
        id: crypto.randomUUID(),
        colegio_id: newColegioId,
        rol: 'padre',
        nombre: `Sofía (Padre)`,
        apellido: `Castro (${schoolName.replace('Colegio ', '')})`,
        dni: '99887766',
        email: `padre@${schoolName.toLowerCase().replace(/\s+/g, '').replace('colegio', '')}.com`,
        foto_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
        activo: true,
        password: 'admin123'
      },
      {
        id: mateoId,
        colegio_id: newColegioId,
        rol: 'alumno',
        nombre: `Mateo (Alumno)`,
        apellido: `Castro (${schoolName.replace('Colegio ', '')})`,
        dni: '66554433',
        email: `alumno@${schoolName.toLowerCase().replace(/\s+/g, '').replace('colegio', '')}.com`,
        foto_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80',
        activo: true,
        password: 'admin123'
      }
    ];
    localStorage.setItem('linkedu_users', JSON.stringify([...users, ...newUsers]));
  }
};


