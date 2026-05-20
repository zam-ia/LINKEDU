-- =====================================================================
-- LINKEDU - Migración para Super Admin y Activación de Colegios
-- Migración: 20260520000003_superadmin.sql
-- =====================================================================

-- 1. Modificar restricción de roles en la tabla de usuarios
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('superadmin', 'director', 'docente', 'padre', 'alumno'));

-- 2. Habilitar columna 'activo' en la tabla de colegios
ALTER TABLE public.colegios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true NOT NULL;

-- 3. Políticas de RLS para el rol 'superadmin' en todas las tablas críticas
-- Como PostgreSQL evalúa las políticas SELECT/ALL con OR, agregar estas políticas
-- le dará acceso completo al Super Admin sin restringir las existentes para otros roles.

CREATE POLICY "Superadmin acceso total colegios" ON public.colegios FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total usuarios" ON public.usuarios FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total anios_academicos" ON public.anios_academicos FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total grados" ON public.grados FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total secciones" ON public.secciones FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total periodos" ON public.periodos FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total cursos" ON public.cursos FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total carga_horaria" ON public.carga_horaria FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total horarios" ON public.horarios FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total alumnos" ON public.alumnos FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total padres_alumnos" ON public.padres_alumnos FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total asistencias" ON public.asistencias FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total evaluaciones" ON public.evaluaciones FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total notas" ON public.notas FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total conceptos_pago" ON public.conceptos_pago FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total obligaciones" ON public.obligaciones FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total pagos" ON public.pagos FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');
CREATE POLICY "Superadmin acceso total egresos" ON public.egresos FOR ALL USING ((auth.jwt() ->> 'rol') = 'superadmin');

-- 4. Sembrar Super Admin por defecto
-- En un entorno real de Supabase Auth, se crea primero en auth.users
-- Registramos su entrada en auth.users (si no existe) y en public.usuarios

INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role)
VALUES (
    's0000000-0000-0000-0000-000000000000',
    'superadmin@linkedu.com',
    '{"nombre": "Administrador", "apellido": "Global"}'::jsonb,
    '{"rol": "superadmin"}'::jsonb,
    'authenticated',
    'authenticated'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.usuarios (id, colegio_id, rol, nombre, apellido, dni, foto_url, activo)
VALUES (
    's0000000-0000-0000-0000-000000000000',
    NULL, -- No está amarrado a ningún colegio particular
    'superadmin',
    'Administrador',
    'Global',
    '00000000',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 5. Creación del Storage Bucket para Avatares si no existe
-- Supabase organiza archivos en buckets públicos/privados de storage.
-- Este script declara la intención de usar un bucket público llamado 'avatar-profiles'
-- En Supabase Cloud, esto se crea visualmente en la sección Storage o con SQL en supabase_admin.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatar-profiles', 'avatar-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para el Bucket
-- Permite lectura pública a todas las imágenes
CREATE POLICY "Lectura pública para avatares"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatar-profiles');

-- Permite subir imágenes de perfil a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden subir fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatar-profiles');

-- Permite actualizar/eliminar su propia imagen de perfil
CREATE POLICY "Usuarios pueden actualizar sus fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatar-profiles' AND (auth.uid() = owner OR owner IS NULL));

CREATE POLICY "Usuarios pueden eliminar sus fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatar-profiles' AND auth.uid() = owner);
