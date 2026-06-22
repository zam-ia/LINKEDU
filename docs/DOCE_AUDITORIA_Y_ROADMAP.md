# Doce — auditoría técnica, decisión de producto y roadmap

Fecha: 22 de junio de 2026

## Decisión de producto

Doce sigue siendo un SaaS porque se alquila a múltiples instituciones, pero su categoría comercial no debe presentarse como “otro SaaS escolar” ni únicamente como “aula virtual”. La definición correcta es:

> Doce es un sistema operativo educativo multi-institución que integra gestión, aprendizaje y credenciales verificables.

El aula virtual es un módulo central. La gestión institucional, las credenciales y los documentos verificables constituyen el producto completo.

La marca recomendada es **Doce**, sin “Agency”. “Doce OS” puede utilizarse como descriptor editorial, pero no es necesario incorporarlo al logotipo.

## Alcance auditado

Se revisaron las estructuras, rutas, servicios y piezas críticas de:

- Linkedu: aplicación Next.js, app móvil Expo y migraciones Supabase.
- REBA Admin: usuarios, roles/permisos, eventos, matrículas, diseñador y emisión de certificados.
- REBA API: autenticación, policies, permisos, servicios, jobs, QR, certificados, auditoría y migraciones.
- REBA Aula Virtual: cursos/diplomados, módulos, clases, materiales, evaluaciones, pagos y certificados.

Una copia literal no es técnicamente correcta: REBA usa Vue + Laravel y Doce usa Next.js + Supabase. Se trasladaron capacidades y reglas de negocio, no acoplamientos de framework.

## Hallazgos críticos en Linkedu

### Seguridad

1. La autenticación anterior simulaba usuarios y sesiones en `localStorage`.
2. Existía una contraseña maestra visible y hardcodeada para Super Admin.
3. La migración de Super Admin insertaba directamente en `auth.users`, una práctica no compatible con un aprovisionamiento seguro.
4. Varias políticas RLS antiguas dependen de `rol` y `colegio_id` dentro del JWT. Esos claims no aparecen automáticamente por existir en `public.usuarios`.
5. La política de Storage permitía actualizar objetos sin propietario (`owner is null`).
6. Las operaciones comerciales, usuarios, comunicados y ajustes mezclaban datos reales con fallback local sin una frontera explícita.

Acciones aplicadas:

- Supabase Auth es ahora la ruta normal de autenticación.
- El modo demo solo se activa con `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true`.
- Se eliminó la contraseña maestra del código y de los mensajes de interfaz.
- Se retiró el alta directa de Super Admin desde SQL.
- Storage solo permite actualizar archivos cuyo `owner` coincide con `auth.uid()`.
- La nueva arquitectura usa `current_colegio_id()`, `is_superadmin()` y `has_permission()` como funciones de autorización en base de datos.

Pendiente antes de producción:

- Migrar las políticas RLS de las tablas académicas antiguas para que utilicen las nuevas funciones, no claims JWT implícitos.
- Eliminar definitivamente los fallbacks locales de módulos heredados.
- Aprovisionar Super Admin mediante un proceso administrativo protegido.
- Añadir MFA obligatorio para Super Admin y roles financieros.

### Arquitectura y mantenibilidad

1. La landing anterior superaba ampliamente el tamaño razonable de una página y mezclaba copy, reproductor simulado, leads y configuración.
2. El panel Super Admin concentra demasiadas responsabilidades en un único componente.
3. El cliente Supabase contiene tipos, seeds y repositorios mock en el mismo archivo.
4. La navegación se define por rol fijo, sin resolver todavía permisos efectivos por usuario.
5. Existen 79 errores y 139 advertencias en el lint global heredado. El build compila, pero esta deuda debe reducirse antes de exigir lint en CI.

Recomendación de separación:

```text
features/
  auth/
  organizations/
  users-access/
  learning/
  credentials/
  documents/
  finance/
lib/
  supabase/
    browser.ts
    server.ts
    database.types.ts
  permissions/
```

## Capacidades útiles de REBA adaptadas

### Roles y permisos

Se tomó como referencia la gestión de roles, agrupación de permisos por recurso y matriz de acciones. No se copió la asignación que otorgaba permisos administrativos extensos al rol `alumno` en un seeder de REBA.

Doce incorpora:

- Roles por institución.
- Catálogo global de permisos.
- Permisos por rol.
- Excepciones directas por usuario.
- Evaluación de permisos dentro de PostgreSQL.
- Matriz visual editable.

### Certificados

Se adaptaron los siguientes patrones de REBA:

- Plantilla versionada.
- Elementos de texto, imagen, firma, QR y separadores.
- Variables dinámicas.
- Emisión individual o masiva.
- Estados borrador, emitido, anulado y vencido.
- Código y token únicos.
- Descarga, envío y trazabilidad.
- Verificación pública contra base de datos.

La verificación de Doce no entrega la fila completa. Las funciones RPC construyen un payload permitido con institución, titular, programa, estado, código y fechas.

### Aula virtual

Se adaptaron:

- Programas de tipo curso, taller, diplomado, programa o evento.
- Módulos ordenables y liberación programada.
- Lecciones de contenido, video, archivo, enlace, clase en vivo, evaluación o tarea.
- Matrículas y avance porcentual.
- Progreso por lección.
- Panel administrativo y acceso del alumno.

### Credenciales

Se creó una base independiente de certificados porque una credencial tiene dimensiones, vigencia y ciclo de vida distintos:

- CR80 vertical u horizontal.
- Anverso y reverso.
- Plantilla por tipo de titular.
- Campos visibles configurables.
- QR y código único.
- Vencimiento y anulación.
- Registro de cada consulta pública.

## Implementación realizada

### Producto y marca

- Nueva landing de Doce.
- Posicionamiento como sistema operativo educativo.
- Propuesta de valor por gestión, aula virtual, credenciales y documentos.
- Planes Básico, Gestión, Profesional y Enterprise desde S/ 5 por alumno/mes.
- Wordmark sin “Agency” y aplicación en la interfaz.

### Base de datos

La migración `20260622000004_doce_platform.sql` agrega:

- Configuración comercial por institución.
- Planes, suscripciones y módulos contratados.
- Roles, permisos, asignaciones y excepciones.
- Programas, módulos, lecciones, matrículas y progreso.
- Plantillas y documentos emitidos.
- Plantillas y credenciales emitidas.
- Verificaciones y auditoría.
- Funciones públicas seguras de verificación.
- RLS para las nuevas entidades.

### Interfaces

- `/director/aula-virtual`
- `/director/credenciales`
- `/director/documentos`
- `/superadmin/roles`
- `/alumno/certificados`
- `/verificar/certificado/{codigo}`
- `/verificar/carnet/{token}`

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SALES_WHATSAPP=51900000000
NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
```

`NEXT_PUBLIC_ENABLE_DEMO_AUTH` debe permanecer en `false` en cualquier entorno con usuarios reales.

## Roadmap de producción

### Fase inmediata — cerrar la base segura

1. Aplicar la migración en un proyecto staging de Supabase.
2. Generar `database.types.ts` desde el esquema real.
3. Migrar RLS de tablas heredadas a las nuevas funciones de tenant y permisos.
4. Separar clientes Supabase browser/server.
5. Crear invitaciones de usuarios desde una Edge Function con service role solo en servidor.
6. Añadir pruebas automáticas de aislamiento entre dos instituciones.

### Fase LMS operativa

1. CRUD real de programas, módulos y lecciones.
2. Storage privado para materiales con signed URLs.
3. Tareas, intentos de evaluación y calificaciones.
4. Calendario, clases en vivo y control de disponibilidad.
5. Experiencia de aprendizaje del alumno con persistencia de progreso.

### Fase credenciales y documentos

1. Persistir el diseñador visual en JSON versionado.
2. Generar QR reales desde tokens no predecibles.
3. Renderizar PDF/PNG en servidor o worker.
4. Impresión A4, CR80, sangrado, corte y reverso.
5. Procesamiento masivo en cola con estados y reintentos.
6. Envío transaccional y ZIP masivo.

### Fase operación institucional

1. Importaciones Excel con validación previa y reporte de errores.
2. Finanzas y conciliación.
3. Comunicaciones multicanal.
4. Auditoría consultable.
5. Super Admin comercial con consumo, plan, vencimiento y soporte.

## Puertas de salida antes de vender a clientes reales

- Cero contraseñas o service keys dentro del repositorio.
- Aislamiento multi-tenant probado automáticamente.
- Lint global sin errores.
- Pruebas de permisos para cada acción crítica.
- Backups y restauración ensayados.
- Logs de auditoría inmutables para emisión y anulación.
- Política de privacidad y minimización de datos en verificadores públicos.
- Observabilidad de jobs de PDF, correo e importaciones.
- Prueba de carga para generación masiva.

## Validación actual

- `npm.cmd run build`: correcto.
- 29 rutas generadas por Next.js.
- Landing, login, módulos nuevos y verificadores: HTTP 200.
- Lint de los archivos nuevos: sin errores.
- Lint global heredado: 79 errores y 139 advertencias pendientes.

El estado actual es una base de evolución sólida y demostrable, no todavía un release productivo. El siguiente trabajo debe concentrarse en persistencia real de los nuevos módulos, migración de RLS heredado y motor de generación de archivos.
