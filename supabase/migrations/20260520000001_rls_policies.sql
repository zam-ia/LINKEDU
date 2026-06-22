-- =====================================================================
-- DOCE - Políticas de Row Level Security (RLS)
-- Migración: 20260520000001_rls_policies.sql
-- =====================================================================

-- Habilitar RLS en todas las tablas críticas
ALTER TABLE public.colegios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anios_academicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carga_horaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.padres_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conceptos_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egresos ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- Políticas para la Tabla: colegios
-- =====================================================================
CREATE POLICY "Usuarios pueden leer la info de su propio colegio" 
ON public.colegios 
FOR SELECT 
USING (
    id = (auth.jwt() ->> 'colegio_id')::uuid
);

CREATE POLICY "Solo directores pueden actualizar la info del colegio" 
ON public.colegios 
FOR UPDATE 
USING (
    id = (auth.jwt() ->> 'colegio_id')::uuid 
    AND (auth.jwt() ->> 'rol') = 'director'
);

-- =====================================================================
-- Políticas para la Tabla: usuarios
-- =====================================================================
CREATE POLICY "Lectura de usuarios dentro del mismo colegio" 
ON public.usuarios 
FOR SELECT 
USING (
    colegio_id = (auth.jwt() ->> 'colegio_id')::uuid
);

CREATE POLICY "Solo directores pueden crear o actualizar usuarios" 
ON public.usuarios 
FOR ALL 
USING (
    colegio_id = (auth.jwt() ->> 'colegio_id')::uuid 
    AND (auth.jwt() ->> 'rol') = 'director'
);

-- =====================================================================
-- Políticas para la Tabla: alumnos
-- =====================================================================
CREATE POLICY "Directores y docentes pueden ver alumnos de su colegio" 
ON public.alumnos 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios u 
        WHERE u.id = public.alumnos.id 
        AND u.colegio_id = (auth.jwt() ->> 'colegio_id')::uuid
    )
);

CREATE POLICY "Alumnos ven su propio registro" 
ON public.alumnos 
FOR SELECT 
USING (
    id = auth.uid()
);

CREATE POLICY "Padres ven el registro de sus hijos" 
ON public.alumnos 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.padres_alumnos pa 
        WHERE pa.alumno_id = public.alumnos.id 
        AND pa.padre_id = auth.uid()
    )
);

-- =====================================================================
-- Políticas para la Tabla: notas
-- =====================================================================
CREATE POLICY "Directores pueden ver y administrar todas las notas" 
ON public.notas 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios u 
        WHERE u.id = auth.uid() 
        AND u.rol = 'director' 
        AND u.colegio_id = (SELECT u2.colegio_id FROM public.usuarios u2 WHERE u2.id = public.notas.alumno_id)
    )
);

CREATE POLICY "Docentes pueden gestionar notas de sus cursos asignados" 
ON public.notas 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.carga_horaria ch
        JOIN public.evaluaciones e ON e.carga_horaria_id = ch.id
        WHERE e.id = public.notas.evaluacion_id 
        AND ch.docente_id = auth.uid()
    )
);

CREATE POLICY "Alumnos pueden leer sus propias notas" 
ON public.notas 
FOR SELECT 
USING (
    alumno_id = auth.uid()
);

CREATE POLICY "Padres pueden leer las notas de sus hijos" 
ON public.notas 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.padres_alumnos pa 
        WHERE pa.alumno_id = public.notas.alumno_id 
        AND pa.padre_id = auth.uid()
    )
);

-- =====================================================================
-- Políticas para la Tabla: asistencias
-- =====================================================================
CREATE POLICY "Directores y docentes gestionan asistencias" 
ON public.asistencias 
FOR ALL 
USING (
    (auth.jwt() ->> 'rol') = 'director'
    OR EXISTS (
        SELECT 1 FROM public.carga_horaria ch 
        WHERE ch.id = public.asistencias.carga_horaria_id 
        AND ch.docente_id = auth.uid()
    )
);

CREATE POLICY "Padres y alumnos leen asistencias" 
ON public.asistencias 
FOR SELECT 
USING (
    alumno_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.padres_alumnos pa 
        WHERE pa.alumno_id = public.asistencias.alumno_id 
        AND pa.padre_id = auth.uid()
    )
);

-- =====================================================================
-- Políticas para la Tabla: obligaciones (Finanzas)
-- =====================================================================
CREATE POLICY "Director administra obligaciones" 
ON public.obligaciones 
FOR ALL 
USING (
    (auth.jwt() ->> 'rol') = 'director'
);

CREATE POLICY "Padre ve deudas de sus hijos" 
ON public.obligaciones 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.padres_alumnos pa 
        WHERE pa.alumno_id = public.obligaciones.alumno_id 
        AND pa.padre_id = auth.uid()
    )
);

CREATE POLICY "Alumno ve sus propias obligaciones" 
ON public.obligaciones 
FOR SELECT 
USING (
    alumno_id = auth.uid()
);

-- =====================================================================
-- Políticas para la Tabla: egresos
-- =====================================================================
CREATE POLICY "Solo director gestiona egresos" 
ON public.egresos 
FOR ALL 
USING (
    (auth.jwt() ->> 'rol') = 'director'
);
