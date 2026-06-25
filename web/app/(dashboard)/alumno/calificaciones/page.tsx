"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, ClipboardList, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  AlumnoInfo,
  EvaluacionInfo,
  getStoredAlumnos,
  getStoredEvaluaciones,
  getStoredNotas,
  NotaInfo,
} from "@/lib/supabase/client";

export default function StudentGradesPage() {
  const { user } = useAuthStore();
  const [student, setStudent] = useState<AlumnoInfo | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionInfo[]>([]);
  const [notas, setNotas] = useState<NotaInfo[]>([]);
  const [selectedCurso, setSelectedCurso] = useState("");

  useEffect(() => {
    const alumnos = getStoredAlumnos();
    const current = alumnos.find((item) => item.id === user?.id || item.email === user?.email) || alumnos[0] || null;
    setStudent(current);

    if (current) {
      const schoolEvaluations = getStoredEvaluaciones().filter((item) => item.colegio_id === current.colegio_id);
      const studentGrades = getStoredNotas().filter((item) => item.alumno_id === current.id);
      const courses = Array.from(new Set(schoolEvaluations.map((item) => item.curso)));
      setEvaluaciones(schoolEvaluations);
      setNotas(studentGrades);
      setSelectedCurso(courses[0] || "");
    }
  }, [user]);

  const cursos = useMemo(() => Array.from(new Set(evaluaciones.map((item) => item.curso))), [evaluaciones]);
  const activeEvaluaciones = evaluaciones.filter((item) => item.curso === selectedCurso);

  const promedio = useMemo(() => {
    let sum = 0;
    let weight = 0;
    activeEvaluaciones.forEach((evaluation) => {
      const grade = notas.find((item) => item.evaluacion_id === evaluation.id);
      if (grade) {
        sum += grade.nota * evaluation.peso;
        weight += evaluation.peso;
      }
    });
    return weight > 0 ? sum / weight : 0;
  }, [activeEvaluaciones, notas]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff2432]">Aula virtual</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">Mis Calificaciones</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Consulta notas, pesos y promedio por curso o diplomado.</p>
        </div>
        <div className="rounded-2xl bg-black px-5 py-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-white/45">Promedio actual</p>
          <p className="mt-1 text-2xl font-black">{promedio ? promedio.toFixed(1) : "—"}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="premium-card p-5">
          <ClipboardList className="h-5 w-5 text-[#ff2432]" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Evaluaciones</p>
          <p className="mt-1 text-2xl font-black text-gray-950">{activeEvaluaciones.length}</p>
        </div>
        <div className="premium-card p-5">
          <BookOpen className="h-5 w-5 text-[#ff2432]" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Cursos activos</p>
          <p className="mt-1 text-2xl font-black text-gray-950">{cursos.length}</p>
        </div>
        <div className="premium-card p-5">
          <Award className="h-5 w-5 text-[#ff2432]" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Estado</p>
          <p className={`mt-1 text-lg font-black ${promedio >= 11 ? "text-[#5BAD8A]" : "text-[#E07B6A]"}`}>{promedio >= 11 ? "Aprobatorio" : "En observación"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="premium-card h-fit p-5">
          <p className="text-xs font-black uppercase tracking-wider text-gray-900">Mis Cursos y Diplomados</p>
          <div className="mt-4 space-y-2">
            {cursos.map((curso) => (
              <button
                key={curso}
                onClick={() => setSelectedCurso(curso)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-xs font-black transition ${selectedCurso === curso ? "border-black bg-black text-white" : "border-gray-150 text-gray-500 hover:bg-gray-50"}`}
              >
                {curso}
              </button>
            ))}
          </div>
        </aside>

        <section className="premium-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-150 p-5">
            <div>
              <h2 className="text-sm font-black text-gray-950">{selectedCurso || "Sin curso seleccionado"}</h2>
              <p className="mt-1 text-[11px] font-semibold text-gray-400">{student ? `${student.grado} ${student.seccion}` : "Alumno"}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[#5BAD8A]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="p-4">Evaluación</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Peso</th>
                  <th className="p-4 text-right">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeEvaluaciones.map((evaluation) => {
                  const grade = notas.find((item) => item.evaluacion_id === evaluation.id);
                  return (
                    <tr key={evaluation.id}>
                      <td className="p-4 font-black text-gray-950">{evaluation.nombre}</td>
                      <td className="p-4 font-bold capitalize text-gray-500">{evaluation.tipo}</td>
                      <td className="p-4 font-bold text-gray-500">{evaluation.peso}%</td>
                      <td className={`p-4 text-right font-mono text-sm font-black ${grade && grade.nota >= 11 ? "text-[#5BAD8A]" : "text-[#E07B6A]"}`}>{grade ? grade.nota.toFixed(1) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
