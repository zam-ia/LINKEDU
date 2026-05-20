-- =====================================================================
-- LINKEDU - Esquema de Base de Datos PostgreSQL (Multi-tenant)
-- Migración Inicial: 20260520000000_schema.sql
-- =====================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Colegios (Multi-tenant central)
CREATE TABLE public.colegios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    logo_url TEXT,
    ruc VARCHAR(20) UNIQUE,
    direccion TEXT,
    config_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla Central de Usuarios
-- El id se mapea directamente con auth.users.id de Supabase
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY,
    colegio_id UUID REFERENCES public.colegios(id) ON DELETE CASCADE,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('director', 'docente', 'padre', 'alumno')),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(15) NOT NULL,
    foto_url TEXT,
    activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_dni_per_colegio UNIQUE (colegio_id, dni)
);

-- 3. Años Académicos
CREATE TABLE public.anios_academicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colegio_id UUID REFERENCES public.colegios(id) ON DELETE CASCADE NOT NULL,
    nombre VARCHAR(100) NOT NULL, -- Ej: "Año Escolar 2026"
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Grados
CREATE TABLE public.grados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colegio_id UUID REFERENCES public.colegios(id) ON DELETE CASCADE NOT NULL,
    nombre VARCHAR(100) NOT NULL, -- Ej: "1ro Primaria"
    nivel VARCHAR(50) NOT NULL CHECK (nivel IN ('inicial', 'primaria', 'secundaria')),
    orden INTEGER NOT NULL, -- Para ordenar secuencialmente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Secciones
CREATE TABLE public.secciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grado_id UUID REFERENCES public.grados(id) ON DELETE CASCADE NOT NULL,
    nombre VARCHAR(50) NOT NULL, -- Ej: "A", "B"
    turno VARCHAR(50) DEFAULT 'mañana' CHECK (turno IN ('mañana', 'tarde', 'completo')),
    aula VARCHAR(100),
    tutor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL, -- Docente tutor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Periodos Académicos
CREATE TABLE public.periodos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anio_academico_id UUID REFERENCES public.anios_academicos(id) ON DELETE CASCADE NOT NULL,
    nombre VARCHAR(100) NOT NULL, -- Ej: "Bimestre I", "Trimestre I"
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Cursos
CREATE TABLE public.cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colegio_id UUID REFERENCES public.colegios(id) ON DELETE CASCADE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_curso_codigo_per_colegio UNIQUE (colegio_id, codigo)
);

-- 8. Carga Horaria (Asignación docente a curso/sección en un año lectivo)
CREATE TABLE public.carga_horaria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    docente_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
    seccion_id UUID REFERENCES public.secciones(id) ON DELETE CASCADE NOT NULL,
    anio_id UUID REFERENCES public.anios_academicos(id) ON DELETE CASCADE NOT NULL,
    horas_semanales INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Horarios Detallados
CREATE TABLE public.horarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carga_horaria_id UUID REFERENCES public.carga_horaria(id) ON DELETE CASCADE NOT NULL,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Estudiantes (Perfil extendido)
CREATE TABLE public.alumnos (
    id UUID PRIMARY KEY REFERENCES public.usuarios(id) ON DELETE CASCADE,
    seccion_id UUID REFERENCES public.secciones(id) ON DELETE RESTRICT NOT NULL,
    codigo_estudiante VARCHAR(100) UNIQUE NOT NULL,
    datos_medicos_json JSONB DEFAULT '{}'::jsonb,
    doc_dni_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Relación Padres y Alumnos
CREATE TABLE public.padres_alumnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    padre_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    relacion VARCHAR(50) NOT NULL CHECK (relacion IN ('padre', 'madre', 'tutor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_padre_alumno UNIQUE (padre_id, alumno_id)
);

-- 12. Registro de Asistencias
CREATE TABLE public.asistencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    carga_horaria_id UUID REFERENCES public.carga_horaria(id) ON DELETE CASCADE NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado CHAR(1) NOT NULL CHECK (estado IN ('P', 'T', 'F')), -- P=Presente, T=Tardanza, F=Falta
    justificacion_url TEXT,
    justificada BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_asistencia_alumno_fecha_curso UNIQUE (alumno_id, fecha, carga_horaria_id)
);

-- 13. Evaluaciones (Configurables por el Docente)
CREATE TABLE public.evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carga_horaria_id UUID REFERENCES public.carga_horaria(id) ON DELETE CASCADE NOT NULL,
    periodo_id UUID REFERENCES public.periodos(id) ON DELETE CASCADE NOT NULL,
    nombre VARCHAR(150) NOT NULL, -- Ej: "Examen Parcial I"
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('examen', 'practica', 'tarea', 'participacion', 'proyecto')),
    peso_porcentaje NUMERIC(5, 2) NOT NULL CHECK (peso_porcentaje > 0 AND peso_porcentaje <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Registro de Notas
CREATE TABLE public.notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id UUID REFERENCES public.evaluaciones(id) ON DELETE CASCADE NOT NULL,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    calificacion NUMERIC(4, 2) NOT NULL CHECK (calificacion BETWEEN 0 AND 20),
    observacion TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_nota_alumno_evaluacion UNIQUE (evaluacion_id, alumno_id)
);

-- 15. Conceptos de Pago (Financiero)
CREATE TABLE public.conceptos_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colegio_id UUID REFERENCES public.colegios(id) ON DELETE CASCADE NOT NULL,
    nombre VARCHAR(150) NOT NULL, -- Ej: "Pensión Marzo 2026", "Matrícula Anual"
    monto_base NUMERIC(10, 2) NOT NULL CHECK (monto_base >= 0),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('matricula', 'pension', 'otro')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Obligaciones (Deudas generadas a los alumnos)
CREATE TABLE public.obligaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE NOT NULL,
    concepto_id UUID REFERENCES public.conceptos_pago(id) ON DELETE RESTRICT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL CHECK (estado IN ('pendiente', 'pagado', 'vencido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Pagos Realizados
CREATE TABLE public.pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obligacion_id UUID REFERENCES public.obligaciones(id) ON DELETE RESTRICT NOT NULL,
    monto_pagado NUMERIC(10, 2) NOT NULL CHECK (monto_pagado > 0),
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metodo VARCHAR(50) NOT NULL CHECK (metodo IN ('efectivo', 'transferencia', 'tarjeta_online')),
    referencia_pasarela TEXT,
    comprobante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. Egresos del Colegio
CREATE TABLE public.egresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colegio_id UUID REFERENCES public.colegios(id) ON DELETE CASCADE NOT NULL,
    categoria VARCHAR(100) NOT NULL CHECK (categoria IN ('Planilla', 'Servicios', 'Proveedores', 'Mantenimiento', 'Otro')),
    descripcion TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    comprobante_url TEXT,
    aprobado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- Triggers automáticos y Funciones Auxiliares
-- =====================================================================

-- Función para sincronizar de auth.users a public.usuarios de manera robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, colegio_id, rol, nombre, apellido, dni, foto_url, activo)
    VALUES (
        new.id,
        (new.raw_user_meta_data->>'colegio_id')::uuid,
        COALESCE(new.raw_user_meta_data->>'rol', 'alumno'),
        COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'),
        COALESCE(new.raw_user_meta_data->>'apellido', 'Nuevo'),
        COALESCE(new.raw_user_meta_data->>'dni', '00000000'),
        new.raw_user_meta_data->>'foto_url',
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        colegio_id = EXCLUDED.colegio_id,
        rol = EXCLUDED.rol,
        nombre = EXCLUDED.nombre,
        apellido = EXCLUDED.apellido,
        dni = EXCLUDED.dni,
        foto_url = EXCLUDED.foto_url;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para creación automática de perfil desde auth.users
-- Nota: Para que este trigger se active, debe estar asociado a auth.users en Supabase.
-- Se documentará para que se configure en el dashboard de Supabase si corresponde, 
-- pero el SQL de creación es el siguiente:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
