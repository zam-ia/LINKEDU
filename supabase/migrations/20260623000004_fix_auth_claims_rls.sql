-- DOCE - Corrección de claims JWT y acceso al perfil autenticado
-- Supabase guarda los metadatos personalizados dentro de app_metadata y
-- user_metadata. Las políticas anteriores buscaban rol/colegio_id en la raíz.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'rol',
    auth.jwt() -> 'app_metadata' ->> 'role'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_colegio_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    COALESCE(
      auth.jwt() -> 'app_metadata' ->> 'colegio_id',
      auth.jwt() -> 'user_metadata' ->> 'colegio_id'
    ),
    ''
  )::uuid;
$$;

DROP POLICY IF EXISTS "Usuarios pueden leer su propio perfil" ON public.usuarios;
CREATE POLICY "Usuarios pueden leer su propio perfil"
ON public.usuarios
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden leer su colegio por metadata" ON public.colegios;
CREATE POLICY "Usuarios pueden leer su colegio por metadata"
ON public.colegios
FOR SELECT
TO authenticated
USING (id = public.current_colegio_id());

DROP POLICY IF EXISTS "Usuarios pueden leer colegas por metadata" ON public.usuarios;
CREATE POLICY "Usuarios pueden leer colegas por metadata"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  colegio_id = public.current_colegio_id()
  AND public.current_colegio_id() IS NOT NULL
);

DROP POLICY IF EXISTS "Directores administran usuarios por metadata" ON public.usuarios;
CREATE POLICY "Directores administran usuarios por metadata"
ON public.usuarios
FOR ALL
TO authenticated
USING (
  public.current_user_role() = 'director'
  AND colegio_id = public.current_colegio_id()
)
WITH CHECK (
  public.current_user_role() = 'director'
  AND colegio_id = public.current_colegio_id()
);

-- Reemplaza las políticas Super Admin creadas con el claim incorrecto.
DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'colegios', 'usuarios', 'anios_academicos', 'grados', 'secciones',
    'periodos', 'cursos', 'carga_horaria', 'horarios', 'alumnos',
    'padres_alumnos', 'asistencias', 'evaluaciones', 'notas',
    'conceptos_pago', 'obligaciones', 'pagos', 'egresos'
  ]
  LOOP
    policy_name := 'Superadmin acceso total ' || table_name;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_role() = ''superadmin'') WITH CHECK (public.current_user_role() = ''superadmin'')',
      policy_name,
      table_name
    );
  END LOOP;
END
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_colegio_id() TO authenticated;
