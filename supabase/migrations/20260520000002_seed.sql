-- =====================================================================
-- LINKEDU - Datos de Semilla para Demo e Interactividad
-- Migración: 20260520000002_seed.sql
-- =====================================================================

-- 1. Insertar Colegio Demo
INSERT INTO public.colegios (id, nombre, logo_url, ruc, direccion, config_json)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Colegio de Excelencia Linkedu',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80',
    '20123456789',
    'Av. Larco 123, Miraflores, Lima, Perú',
    '{"moneda": "PEN", "meta_ingresos_mes": 15000}'::jsonb
) ON CONFLICT DO NOTHING;

-- Definir variables reutilizables en SQL
-- Colegio ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d

-- 2. Crear Usuarios (Simulando auth.users)
-- UUIDs fijos para los perfiles (Todos son hexadecimales válidos)
-- Director: d1111111-1111-1111-1111-111111111111
-- Docente 1: d2222222-2222-2222-2222-222222222222
-- Docente 2: d3333333-3333-3333-3333-333333333333
-- Padre 1: f1111111-1111-1111-1111-111111111111
-- Padre 2: f2222222-2222-2222-2222-222222222222
-- Alumno 1: a1111111-1111-1111-1111-111111111111
-- Alumno 2: a2222222-2222-2222-2222-222222222222
-- Alumno 3: a3333333-3333-3333-3333-333333333333

INSERT INTO public.usuarios (id, colegio_id, rol, nombre, apellido, dni, foto_url, activo) VALUES
('d1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'director', 'Roberto', 'Mendoza', '44556677', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80', true),
('d2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'docente', 'María', 'Gutiérrez', '11223344', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', true),
('d3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'docente', 'Juan', 'Pérez', '55667788', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80', true),
('f1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'padre', 'Pedro', 'Díaz', '88776655', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', true),
('f2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'padre', 'Sofía', 'Castro', '99887766', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80', true),
('a1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'alumno', 'Ana', 'Díaz', '77889900', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80', true),
('a2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'alumno', 'Mateo', 'Castro', '66554433', 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80', true),
('a3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'alumno', 'Lucas', 'Castro', '55443322', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80', true)
ON CONFLICT DO NOTHING;

-- 3. Años Académicos
INSERT INTO public.anios_academicos (id, colegio_id, nombre, fecha_inicio, fecha_fin, activo) VALUES
('b1b1b1b1-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Año Académico 2026', '2026-03-01', '2026-12-20', true)
ON CONFLICT DO NOTHING;

-- 4. Periodos
INSERT INTO public.periodos (id, anio_academico_id, nombre, fecha_inicio, fecha_fin) VALUES
('c1c1c1c1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111', 'Bimestre I', '2026-03-01', '2026-05-15'),
('c2c2c2c2-2222-2222-2222-222222222222', 'b1b1b1b1-1111-1111-1111-111111111111', 'Bimestre II', '2026-05-16', '2026-07-25')
ON CONFLICT DO NOTHING;

-- 5. Grados
INSERT INTO public.grados (id, colegio_id, nombre, nivel, orden) VALUES
('e1e1e1e1-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '1ro Primaria', 'primaria', 1),
('e2e2e2e2-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '2do Primaria', 'primaria', 2)
ON CONFLICT DO NOTHING;

-- 6. Secciones
INSERT INTO public.secciones (id, grado_id, nombre, turno, aula, tutor_id) VALUES
('f1f1f1f1-1111-1111-1111-111111111111', 'e1e1e1e1-1111-1111-1111-111111111111', 'A', 'mañana', 'Aula 101', 'd2222222-2222-2222-2222-222222222222'),
('f2f2f2f2-2222-2222-2222-222222222222', 'e2e2e2e2-2222-2222-2222-222222222222', 'A', 'mañana', 'Aula 201', 'd3333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- 7. Registrar Alumnos en Ficha
INSERT INTO public.alumnos (id, seccion_id, codigo_estudiante, datos_medicos_json) VALUES
('a1111111-1111-1111-1111-111111111111', 'f1f1f1f1-1111-1111-1111-111111111111', 'ALU-2026-001', '{"sangre": "O+", "alergias": "Ninguna", "seguro": "EsSalud"}'::jsonb),
('a2222222-2222-2222-2222-222222222222', 'f1f1f1f1-1111-1111-1111-111111111111', 'ALU-2026-002', '{"sangre": "A-", "alergias": "Penicilina", "seguro": "Rímac"}'::jsonb),
('a3333333-3333-3333-3333-333333333333', 'f2f2f2f2-2222-2222-2222-222222222222', 'ALU-2026-003', '{"sangre": "O+", "alergias": "Ninguna", "seguro": "SIS"}'::jsonb)
ON CONFLICT DO NOTHING;

-- 8. Vincular Padres con Alumnos
INSERT INTO public.padres_alumnos (padre_id, alumno_id, relacion) VALUES
('f1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'padre'),
('f2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'madre'),
('f2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'madre')
ON CONFLICT DO NOTHING;

-- 9. Cursos
INSERT INTO public.cursos (id, colegio_id, nombre, codigo) VALUES
('c01c01c0-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Matemática Divertida', 'MAT-101'),
('c02c02c0-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Comunicación Integral', 'COM-101')
ON CONFLICT DO NOTHING;

-- 10. Carga Horaria (Asignación)
-- María (d2222222) enseña Matemática en 1ro Primaria Sección A (f1f1f1f1)
-- Juan (d3333333) enseña Comunicación en 1ro Primaria Sección A (f1f1f1f1)
INSERT INTO public.carga_horaria (id, docente_id, curso_id, seccion_id, anio_id, horas_semanales) VALUES
('e01c01c0-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'c01c01c0-1111-1111-1111-111111111111', 'f1f1f1f1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111', 6),
('e02c02c0-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333', 'c02c02c0-2222-2222-2222-222222222222', 'f1f1f1f1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111', 4)
ON CONFLICT DO NOTHING;

-- 11. Horarios
INSERT INTO public.horarios (carga_horaria_id, dia_semana, hora_inicio, hora_fin, aula) VALUES
('e01c01c0-1111-1111-1111-111111111111', 1, '08:00:00', '09:30:00', 'Aula 101'), -- Lunes Matemática
('e01c01c0-1111-1111-1111-111111111111', 3, '08:00:00', '09:30:00', 'Aula 101'), -- Miércoles Matemática
('e02c02c0-2222-2222-2222-222222222222', 2, '08:00:00', '09:30:00', 'Aula 101'), -- Martes Comunicación
('e02c02c0-2222-2222-2222-222222222222', 4, '08:00:00', '09:30:00', 'Aula 101')  -- Jueves Comunicación
ON CONFLICT DO NOTHING;

-- 12. Evaluaciones del Bimestre I (MATEMÁTICA - Suma 100%)
INSERT INTO public.evaluaciones (id, carga_horaria_id, periodo_id, nombre, tipo, peso_porcentaje) VALUES
('e01e01e0-1111-1111-1111-111111111111', 'e01c01c0-1111-1111-1111-111111111111', 'c1c1c1c1-1111-1111-1111-111111111111', 'Examen Parcial', 'examen', 30.00),
('e02e02e0-2222-2222-2222-222222222222', 'e01c01c0-1111-1111-1111-111111111111', 'c1c1c1c1-1111-1111-1111-111111111111', 'Tareas y Talleres', 'tarea', 30.00),
('e03e03e0-3333-3333-3333-333333333333', 'e01c01c0-1111-1111-1111-111111111111', 'c1c1c1c1-1111-1111-1111-111111111111', 'Examen Bimestral', 'examen', 40.00)
ON CONFLICT DO NOTHING;

-- 13. Notas de los Estudiantes en Bimestre I (Matemática)
INSERT INTO public.notas (evaluacion_id, alumno_id, calificacion, observacion) VALUES
-- Ana (a1111111)
('e01e01e0-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 16.50, 'Buen razonamiento matemático'),
('e02e02e0-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 18.00, 'Entregas a tiempo'),
('e03e03e0-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 15.00, 'Faltó desarrollar el último ejercicio'),
-- Mateo (a2222222)
('e01e01e0-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 11.00, 'Debe practicar más divisiones'),
('e02e02e0-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 12.00, 'Presentó con retraso'),
('e03e03e0-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 10.00, 'Se distrajo en la prueba')
ON CONFLICT DO NOTHING;

-- 14. Asistencias de Ejemplo
INSERT INTO public.asistencias (alumno_id, carga_horaria_id, fecha, estado) VALUES
('a1111111-1111-1111-1111-111111111111', 'e01c01c0-1111-1111-1111-111111111111', '2026-05-18', 'P'),
('a2222222-2222-2222-2222-222222222222', 'e01c01c0-1111-1111-1111-111111111111', '2026-05-18', 'T'),
('a1111111-1111-1111-1111-111111111111', 'e01c01c0-1111-1111-1111-111111111111', '2026-05-20', 'P'),
('a2222222-2222-2222-2222-222222222222', 'e01c01c0-1111-1111-1111-111111111111', '2026-05-20', 'F')
ON CONFLICT DO NOTHING;

-- 15. Conceptos Financieros (Matrícula y Pensión)
INSERT INTO public.conceptos_pago (id, colegio_id, nombre, monto_base, tipo) VALUES
('c91c91c9-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Matrícula Anual 2026', 450.00, 'matricula'),
('c92c92c9-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Pensión Mensual - Mayo', 380.00, 'pension'),
('c93c93c9-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Pensión Mensual - Junio', 380.00, 'pension')
ON CONFLICT DO NOTHING;

-- 16. Obligaciones de los Alumnos
INSERT INTO public.obligaciones (id, alumno_id, concepto_id, monto, fecha_vencimiento, estado) VALUES
-- Ana (a1111111)
('eb1eb1eb-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c91c91c9-1111-1111-1111-111111111111', 450.00, '2026-03-05', 'pagado'),
('eb2eb2eb-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'c92c92c9-2222-2222-2222-222222222222', 380.00, '2026-05-05', 'pagado'),
-- Mateo (a2222222)
('eb3eb3eb-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'c91c91c9-1111-1111-1111-111111111111', 450.00, '2026-03-05', 'pagado'),
('eb4eb4eb-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'c92c92c9-2222-2222-2222-222222222222', 380.00, '2026-05-05', 'vencido'), -- Moroso
-- Lucas (a3333333)
('eb5eb5eb-5555-5555-5555-555555555555', 'a3333333-3333-3333-3333-333333333333', 'c91c91c9-1111-1111-1111-111111111111', 450.00, '2026-03-05', 'pagado'),
('eb6eb6eb-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', 'c92c92c9-2222-2222-2222-222222222222', 380.00, '2026-05-05', 'pendiente')
ON CONFLICT DO NOTHING;

-- 17. Registro de Pagos
INSERT INTO public.pagos (obligacion_id, monto_pagado, fecha_pago, metodo, referencia_pasarela) VALUES
('eb1eb1eb-1111-1111-1111-111111111111', 450.00, '2026-03-02 10:30:00+00', 'efectivo', NULL),
('eb2eb2eb-2222-2222-2222-222222222222', 380.00, '2026-05-04 15:45:00+00', 'tarjeta_online', 'ch_554488992211'),
('eb3eb3eb-3333-3333-3333-333333333333', 450.00, '2026-03-04 11:15:00+00', 'transferencia', 'tx_ref_88771122'),
('eb5eb5eb-5555-5555-5555-555555555555', 450.00, '2026-03-05 09:00:00+00', 'efectivo', NULL)
ON CONFLICT DO NOTHING;

-- 18. Egresos del Colegio (Para el gráfico de flujo de caja)
INSERT INTO public.egresos (colegio_id, categoria, descripcion, monto, fecha, aprobado_por) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Planilla', 'Pago de planillas docentes Mayo 2026', 1500.00, '2026-05-15', 'd1111111-1111-1111-1111-111111111111'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Servicios', 'Pago de luz e internet de locales', 350.00, '2026-05-10', 'd1111111-1111-1111-1111-111111111111'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mantenimiento', 'Pintado y reparaciones de aulas', 500.00, '2026-05-08', 'd1111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;
