'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Search, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  CheckCircle, 
  X, 
  ChevronRight, 
  User, 
  DollarSign, 
  Calendar, 
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { 
  getStoredAlumnos, 
  saveStoredAlumnos, 
  getStoredPagos, 
  saveStoredPagos, 
  getStoredAsistencias, 
  getStoredNotas, 
  getStoredEvaluaciones, 
  getStoredColegios,
  AlumnoInfo, 
  PagoInfo,
  AsistenciaInfo,
  NotaInfo,
  EvaluacionInfo
} from '@/lib/supabase/client';

export default function AlumnosPage() {
  const { colegio } = useAuthStore();
  const [alumnos, setAlumnos] = useState<AlumnoInfo[]>([]);
  const [pagos, setPagos] = useState<PagoInfo[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaInfo[]>([]);
  const [notas, setNotas] = useState<NotaInfo[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionInfo[]>([]);
  const [schoolPlan, setSchoolPlan] = useState('Premium SaaS');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrado, setFilterGrado] = useState('todos');
  const [filterSeccion, setFilterSeccion] = useState('todos');
  const [filterFinanciero, setFilterFinanciero] = useState('todos');

  // Active student for the Expediente drawer/modal
  const [selectedAlumno, setSelectedAlumno] = useState<AlumnoInfo | null>(null);
  const [expedienteTab, setExpedienteTab] = useState<'academico' | 'pagos' | 'asistencia' | 'medico'>('academico');

  // Matrícula Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newAlumno, setNewAlumno] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    foto_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    grado: '1ro Primaria',
    seccion: 'A',
    tutorNombre: '',
    tutorRelacion: 'Madre',
    tutorTelefono: '',
    tutorEmail: '',
    sangre: 'O+',
    alergias: '',
    condiciones: '',
    seguro: 'SIS',
    montoMatricula: '350'
  });

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const storedAlumnos = getStoredAlumnos();
    const storedPagos = getStoredPagos();
    const storedAsistencias = getStoredAsistencias();
    const storedNotas = getStoredNotas();
    const storedEvaluaciones = getStoredEvaluaciones();
    const storedColegios = getStoredColegios();

    if (colegio) {
      const matchCol = storedColegios.find(c => c.id === colegio.id);
      if (matchCol) {
        setSchoolPlan(matchCol.plan || 'Premium SaaS');
      }

      setAlumnos(storedAlumnos.filter(a => a.colegio_id === colegio.id));
      setPagos(storedPagos.filter(p => p.colegio_id === colegio.id));
      setAsistencias(storedAsistencias.filter(a => a.colegio_id === colegio.id));
      setNotas(storedNotas.filter(n => n.colegio_id === colegio.id));
      setEvaluaciones(storedEvaluaciones.filter(e => e.colegio_id === colegio.id));
    }
  }, [colegio]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (!newAlumno.nombre || !newAlumno.apellido || !newAlumno.dni || !newAlumno.email) {
        triggerAlert('Por favor, completa los campos requeridos del Paso 1.');
        return;
      }
    } else if (wizardStep === 2) {
      if (!newAlumno.tutorNombre || !newAlumno.tutorTelefono || !newAlumno.tutorEmail) {
        triggerAlert('Por favor, completa los datos de contacto del tutor.');
        return;
      }
    }
    setWizardStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setWizardStep(prev => prev - 1);
  };

  const handleRegisterAlumno = () => {
    if (!colegio) return;

    const studentId = 'student-' + Date.now();
    
    // 1. Create student info
    const addedStudent: AlumnoInfo = {
      id: studentId,
      colegio_id: colegio.id,
      nombre: newAlumno.nombre,
      apellido: newAlumno.apellido,
      dni: newAlumno.dni,
      foto_url: newAlumno.foto_url,
      email: newAlumno.email,
      grado: newAlumno.grado,
      seccion: newAlumno.seccion,
      estado: 'activo',
      financiero: 'pendiente',
      contacto_tutor: {
        nombre: newAlumno.tutorNombre,
        relacion: newAlumno.tutorRelacion,
        telefono: newAlumno.tutorTelefono,
        email: newAlumno.tutorEmail
      },
      datos_medicos: {
        sangre: newAlumno.sangre,
        alergias: newAlumno.alergias ? newAlumno.alergias.split(',').map(s => s.trim()) : [],
        condiciones: newAlumno.condiciones || 'Ninguna',
        seguro: newAlumno.seguro
      }
    };

    // 2. Create initial tuition fee payment (Matrícula)
    const initialPayment: PagoInfo = {
      id: 'p-matricula-' + Date.now(),
      colegio_id: colegio.id,
      alumno_id: studentId,
      concepto: 'Matrícula Inicial 2026',
      monto: parseFloat(newAlumno.montoMatricula) || 350,
      tipo: 'ingreso',
      categoria: 'Matrícula',
      fecha: new Date().toISOString().split('T')[0],
      vencimiento: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      metodo: null,
      comprobante: null
    };

    // Save to localStorage
    const currentStudents = getStoredAlumnos();
    const currentPayments = getStoredPagos();

    const updatedStudents = [addedStudent, ...currentStudents];
    const updatedPayments = [initialPayment, ...currentPayments];

    saveStoredAlumnos(updatedStudents);
    saveStoredPagos(updatedPayments);

    setAlumnos(updatedStudents.filter(a => a.colegio_id === colegio.id));
    setPagos(updatedPayments.filter(p => p.colegio_id === colegio.id));

    setShowWizard(false);
    setWizardStep(1);
    setNewAlumno({
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      foto_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      grado: '1ro Primaria',
      seccion: 'A',
      tutorNombre: '',
      tutorRelacion: 'Madre',
      tutorTelefono: '',
      tutorEmail: '',
      sangre: 'O+',
      alergias: '',
      condiciones: '',
      seguro: 'SIS',
      montoMatricula: '350'
    });

    triggerAlert(`¡Estudiante ${addedStudent.nombre} matriculado con éxito! Se ha generado la orden de pago.`);
  };

  // Filter logic
  const filteredAlumnos = alumnos.filter(alumno => {
    const fullName = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || alumno.dni.includes(searchQuery);
    
    // Check actual financial status from payments
    const studentPayments = pagos.filter(p => p.alumno_id === alumno.id);
    const hasOverdue = studentPayments.some(p => p.estado === 'vencido');
    const isPending = studentPayments.some(p => p.estado === 'pendiente') && !hasOverdue;
    const isAlDia = !hasOverdue && !isPending;

    const actualFinanciero = hasOverdue ? 'en_mora' : isPending ? 'pendiente' : 'al_dia';

    const matchesGrado = filterGrado === 'todos' || alumno.grado === filterGrado;
    const matchesSeccion = filterSeccion === 'todos' || alumno.seccion === filterSeccion;
    const matchesFinanciero = filterFinanciero === 'todos' || actualFinanciero === filterFinanciero;

    return matchesSearch && matchesGrado && matchesSeccion && matchesFinanciero;
  });

  const uniqueGrados = Array.from(new Set(alumnos.map(a => a.grado)));
  const uniqueSecciones = Array.from(new Set(alumnos.map(a => a.seccion)));

  return (
    <div className="space-y-6 relative">
      {/* ALERT TOAST */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-950 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-[#F5A623] animate-pulse" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Alumnado y Matrícula</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión académica de expedientes, registro de nuevos alumnos y control de matrículas.</p>
        </div>
        <div>
          <button 
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#01017b]/20 cursor-pointer transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            Nueva Matrícula
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="premium-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filterGrado}
            onChange={(e) => setFilterGrado(e.target.value)}
            className="rounded-xl border border-gray-350 py-2 px-3 bg-white text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
          >
            <option value="todos">Todos los Grados</option>
            {uniqueGrados.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={filterSeccion}
            onChange={(e) => setFilterSeccion(e.target.value)}
            className="rounded-xl border border-gray-350 py-2 px-3 bg-white text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
          >
            <option value="todos">Sección: Todas</option>
            {uniqueSecciones.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filterFinanciero}
            onChange={(e) => setFilterFinanciero(e.target.value)}
            className="rounded-xl border border-gray-350 py-2 px-3 bg-white text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
          >
            <option value="todos">Estado de Pago: Todos</option>
            <option value="al_dia">Al Día</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_mora">En Mora / Vencido</option>
          </select>
        </div>
      </div>

      {/* STUDENT LIST TABLE */}
      <div className="premium-card p-6 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="p-3.5">Estudiante</th>
                <th className="p-3.5">DNI</th>
                <th className="p-3.5">Grado & Sección</th>
                <th className="p-3.5">Tutor / Apoderado</th>
                <th className="p-3.5">Estado Financiero</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAlumnos.map((alumno) => {
                const studentPayments = pagos.filter(p => p.alumno_id === alumno.id);
                const hasOverdue = studentPayments.some(p => p.estado === 'vencido');
                const isPending = studentPayments.some(p => p.estado === 'pendiente') && !hasOverdue;
                const isAlDia = !hasOverdue && !isPending;

                return (
                  <tr key={alumno.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-3 flex items-center gap-3">
                      <img src={alumno.foto_url} alt="" className="w-9 h-9 rounded-full object-cover shadow-xs border border-gray-100" />
                      <div className="flex flex-col">
                        <span className="font-extrabold text-gray-950 group-hover:text-[#01017b] transition-colors leading-snug">{alumno.nombre} {alumno.apellido}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{alumno.email}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-500 font-bold">{alumno.dni}</td>
                    <td className="p-3 font-semibold text-xs text-gray-800">{alumno.grado} - {alumno.seccion}</td>
                    <td className="p-3 flex flex-col">
                      <span className="font-bold text-xs text-gray-700">{alumno.contacto_tutor.nombre}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{alumno.contacto_tutor.telefono} ({alumno.contacto_tutor.relacion})</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isAlDia ? 'bg-[#EAF5EF] text-[#5BAD8A]' :
                        hasOverdue ? 'bg-[#FDECEA] text-[#E07B6A]' : 'bg-[#FEF6E8] text-[#F5A623]'
                      }`}>
                        {isAlDia ? 'Al Día' : hasOverdue ? 'En Mora' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => {
                          setSelectedAlumno(alumno);
                          setExpedienteTab('academico');
                        }}
                        className="px-3 py-1.5 bg-gray-50 group-hover:bg-[#EEF1FE] group-hover:text-[#01017b] text-gray-500 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                      >
                        Ver Expediente
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredAlumnos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-400 font-bold text-sm">
                    No se encontraron alumnos matriculados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EXPEDIENTE MODAL (DRAWER) ================= */}
      {selectedAlumno && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedAlumno(null)}></div>
          <div className="relative bg-white w-full max-w-2xl h-full shadow-2xl animate-in slide-in-from-right duration-250 flex flex-col">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4">
                <img src={selectedAlumno.foto_url} alt="" className="w-12 h-12 rounded-full object-cover border border-white shadow-md" />
                <div>
                  <h3 className="text-lg font-black text-gray-950">{selectedAlumno.nombre} {selectedAlumno.apellido}</h3>
                  <p className="text-xs text-gray-500 font-semibold">{selectedAlumno.grado} - Sección {selectedAlumno.seccion} • DNI {selectedAlumno.dni}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlumno(null)}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Tab Headers */}
            <div className="flex border-b border-gray-200 px-6 bg-gray-50">
              <button
                onClick={() => setExpedienteTab('academico')}
                className={`pb-2.5 pt-1 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  expedienteTab === 'academico' ? 'border-[#01017b] text-[#01017b]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Boleta Académica
              </button>
              <button
                onClick={() => setExpedienteTab('pagos')}
                className={`pb-2.5 pt-1 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  expedienteTab === 'pagos' ? 'border-[#01017b] text-[#01017b]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Historial de Pagos
              </button>
              <button
                onClick={() => setExpedienteTab('asistencia')}
                className={`pb-2.5 pt-1 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  expedienteTab === 'asistencia' ? 'border-[#01017b] text-[#01017b]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Asistencia
              </button>
              <button
                onClick={() => setExpedienteTab('medico')}
                className={`pb-2.5 pt-1 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  expedienteTab === 'medico' ? 'border-[#01017b] text-[#01017b]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Médico & Tutor
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* TAB: ACADEMICO */}
              {expedienteTab === 'academico' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Notas del Alumno (Bimestre I)</h4>
                    <span className="text-xs font-bold text-[#5BAD8A] bg-[#EAF5EF] px-2 py-0.5 rounded-full">Matemática Divertida</span>
                  </div>

                  <div className="border border-gray-150 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="p-3">Evaluación</th>
                          <th className="p-3">Tipo</th>
                          <th className="p-3">Peso</th>
                          <th className="p-3 text-right">Calificación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold">
                        {evaluaciones.map((evalu) => {
                          const matchingNota = notas.find(n => n.alumno_id === selectedAlumno.id && n.evaluacion_id === evalu.id);
                          return (
                            <tr key={evalu.id}>
                              <td className="p-3 font-bold text-gray-900">{evalu.nombre}</td>
                              <td className="p-3 text-gray-500 uppercase tracking-wider text-[9px]">{evalu.tipo}</td>
                              <td className="p-3 text-gray-400">{evalu.peso}%</td>
                              <td className={`p-3 text-right font-black text-xs ${
                                matchingNota 
                                  ? matchingNota.nota >= 11 ? 'text-[#5BAD8A]' : 'text-[#E07B6A]' 
                                  : 'text-gray-300'
                              }`}>
                                {matchingNota ? matchingNota.nota.toFixed(1) : 'No Evaluado'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-150">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Promedio Ponderado Estimado</span>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">Basado en evaluaciones registradas hasta hoy.</p>
                    </div>
                    <span className="text-2xl font-black text-[#5BAD8A]">
                      {(() => {
                        const studentNotas = notas.filter(n => n.alumno_id === selectedAlumno.id);
                        if (studentNotas.length === 0) return '—';
                        let sum = 0;
                        let weightSum = 0;
                        studentNotas.forEach(n => {
                          const ev = evaluaciones.find(e => e.id === n.evaluacion_id);
                          if (ev) {
                            sum += n.nota * ev.peso;
                            weightSum += ev.peso;
                          }
                        });
                        return weightSum > 0 ? (sum / weightSum).toFixed(1) : '—';
                      })()}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB: PAGOS */}
              {expedienteTab === 'pagos' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Historial Financiero / Recibos</h4>
                  
                  <div className="border border-gray-150 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="p-3">Concepto</th>
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Método</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold">
                        {pagos.filter(p => p.alumno_id === selectedAlumno.id).map((pago) => (
                          <tr key={pago.id}>
                            <td className="p-3 font-bold text-gray-800">{pago.concepto}</td>
                            <td className="p-3 text-gray-400">{pago.fecha}</td>
                            <td className="p-3 text-gray-500">{pago.metodo || 'Pasarela Virtual'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                pago.estado === 'pagado' ? 'bg-[#EAF5EF] text-[#5BAD8A]' :
                                pago.estado === 'vencido' ? 'bg-[#FDECEA] text-[#E07B6A]' : 'bg-[#FEF6E8] text-[#F5A623]'
                              }`}>
                                {pago.estado}
                              </span>
                            </td>
                            <td className="p-3 text-right font-black text-gray-900">S/. {pago.monto.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: ASISTENCIA */}
              {expedienteTab === 'asistencia' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Calendario de Asistencia</h4>
                  
                  {/* Mock calendar block */}
                  <div className="p-5 border border-gray-150 rounded-xl bg-gray-50 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                      <span>Mayo 2026</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#5BAD8A]" /> Presente</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" /> Tardanza</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#E07B6A]" /> Falta</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-black text-gray-400">
                      <span>L</span><span>M</span><span>MI</span><span>J</span><span>V</span><span>S</span><span>D</span>
                      
                      {/* Generar celdas simuladas de Mayo */}
                      {Array.from({ length: 31 }).map((_, i) => {
                        const dayNum = i + 1;
                        // Simular que algunos días tienen asistencia registrada
                        const isWeekend = (dayNum + 4) % 7 === 0 || (dayNum + 4) % 7 === 6; // Mayo 2026 empieza en Viernes
                        
                        let dotColor = 'bg-gray-100 hover:bg-gray-200 text-gray-300';
                        const asistDia = asistencias.find(a => a.alumno_id === selectedAlumno.id && parseInt(a.fecha.split('-')[2]) === dayNum);
                        
                        if (asistDia) {
                          dotColor = asistDia.estado === 'P' ? 'bg-[#EAF5EF] text-[#5BAD8A] border border-[#5BAD8A]/20' : 
                                     asistDia.estado === 'T' ? 'bg-[#FEF6E8] text-[#F5A623] border border-[#F5A623]/20' : 
                                     'bg-[#FDECEA] text-[#E07B6A] border border-[#E07B6A]/20';
                        } else if (isWeekend) {
                          dotColor = 'bg-gray-50 text-gray-200';
                        } else if (dayNum < 21) {
                          // Días pasados por defecto Presente en demo
                          dotColor = 'bg-[#EAF5EF] text-[#5BAD8A] border border-[#5BAD8A]/10';
                        }

                        return (
                          <div 
                            key={i} 
                            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-all font-extrabold cursor-default ${dotColor}`}
                          >
                            {dayNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MEDICAL & TUTOR */}
              {expedienteTab === 'medico' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 border border-gray-150 rounded-xl space-y-3.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">
                      <User className="w-4 h-4 text-[#01017b]" />
                      Apoderado / Tutor
                    </div>
                    <div className="space-y-2 text-xs font-semibold text-gray-600">
                      <p><span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Nombre del Apoderado</span>{selectedAlumno.contacto_tutor.nombre}</p>
                      <p><span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Relación / Vínculo</span>{selectedAlumno.contacto_tutor.relacion}</p>
                      <p><span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Teléfono de Emergencia</span>{selectedAlumno.contacto_tutor.telefono}</p>
                      <p><span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Correo Electrónico</span>{selectedAlumno.contacto_tutor.email}</p>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-150 rounded-xl space-y-3.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">
                      <Activity className="w-4 h-4 text-[#E07B6A]" />
                      Ficha Médica
                    </div>
                    <div className="space-y-2 text-xs font-semibold text-gray-600">
                      <p><span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Grupo Sanguíneo</span>{selectedAlumno.datos_medicos.sangre}</p>
                      <p><span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Seguro de Salud</span>{selectedAlumno.datos_medicos.seguro}</p>
                      <p>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Alergias</span>
                        {selectedAlumno.datos_medicos.alergias.length > 0 
                          ? selectedAlumno.datos_medicos.alergias.join(', ') 
                          : 'Ninguna alergia registrada'}
                      </p>
                      <p><span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Condiciones Médicas / Observaciones</span>{selectedAlumno.datos_medicos.condiciones}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ================= MATRÍCULA WIZARD (MODAL) ================= */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowWizard(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 mb-4">
              <div>
                <h3 className="text-base font-black text-gray-950">Wizard de Matrícula Directa</h3>
                <p className="text-xs text-gray-400 font-semibold">Crea la ficha del alumno, asigna grado e inicializa su pago de matrícula.</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Steps UI */}
            <div className="flex items-center justify-between px-8 mb-6">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  wizardStep >= 1 ? 'bg-[#01017b] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  1
                </div>
                <span className="text-[10px] font-bold mt-1 text-gray-500">Datos Alumno</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-150 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  wizardStep >= 2 ? 'bg-[#01017b] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  2
                </div>
                <span className="text-[10px] font-bold mt-1 text-gray-500">Tutor & Médico</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-150 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  wizardStep >= 3 ? 'bg-[#01017b] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  3
                </div>
                <span className="text-[10px] font-bold mt-1 text-gray-500">Asignación Académica</span>
              </div>
            </div>

            {/* Step Contents */}
            <div className="flex-1 overflow-y-auto space-y-4 px-1 py-1 custom-scrollbar">
              
              {/* STEP 1: DATOS PERSONALES */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Nombre <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Ej. Mateo"
                        value={newAlumno.nombre}
                        onChange={(e) => setNewAlumno({ ...newAlumno, nombre: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Apellido <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Ej. Castro"
                        value={newAlumno.apellido}
                        onChange={(e) => setNewAlumno({ ...newAlumno, apellido: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">DNI <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="8 dígitos"
                        value={newAlumno.dni}
                        onChange={(e) => setNewAlumno({ ...newAlumno, dni: e.target.value.replace(/\D/g, '') })}
                        className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-xs font-semibold font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Correo del Alumno <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        placeholder="alumno@colegio.edu.pe"
                        value={newAlumno.email}
                        onChange={(e) => setNewAlumno({ ...newAlumno, email: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">URL de Foto de Perfil</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newAlumno.foto_url}
                      onChange={(e) => setNewAlumno({ ...newAlumno, foto_url: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-xs font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: TUTOR Y MEDICO */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-gray-50 border border-gray-150 rounded-xl space-y-3">
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider">Datos de Contacto del Tutor</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="Ej. Sofía Castro"
                          value={newAlumno.tutorNombre}
                          onChange={(e) => setNewAlumno({ ...newAlumno, tutorNombre: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Relación / Vínculo</label>
                        <select
                          value={newAlumno.tutorRelacion}
                          onChange={(e) => setNewAlumno({ ...newAlumno, tutorRelacion: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                        >
                          <option value="Madre">Madre</option>
                          <option value="Padre">Padre</option>
                          <option value="Tutor Legal">Tutor Legal</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Teléfono Móvil <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="987654321"
                          value={newAlumno.tutorTelefono}
                          onChange={(e) => setNewAlumno({ ...newAlumno, tutorTelefono: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          placeholder="tutor@colegio.edu.pe"
                          value={newAlumno.tutorEmail}
                          onChange={(e) => setNewAlumno({ ...newAlumno, tutorEmail: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-red-50/20 border border-red-100 rounded-xl space-y-3">
                    <span className="text-[10px] font-black text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-red-500" />
                      Ficha Médica de Emergencia
                    </span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Grupo Sanguíneo</label>
                        <select
                          value={newAlumno.sangre}
                          onChange={(e) => setNewAlumno({ ...newAlumno, sangre: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                        >
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="A+">A+</option>
                          <option value="B+">B+</option>
                          <option value="AB+">AB+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Seguro de Salud</label>
                        <input
                          type="text"
                          placeholder="SIS, EsSalud, Rímac, etc."
                          value={newAlumno.seguro}
                          onChange={(e) => setNewAlumno({ ...newAlumno, seguro: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Alergias (Separadas por comas)</label>
                        <input
                          type="text"
                          placeholder="Ej. Penicilina, Nueces"
                          value={newAlumno.alergias}
                          onChange={(e) => setNewAlumno({ ...newAlumno, alergias: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Condiciones Médicas Crónicas</label>
                        <input
                          type="text"
                          placeholder="Ej. Asma, Diabetes leve o Ninguna"
                          value={newAlumno.condiciones}
                          onChange={(e) => setNewAlumno({ ...newAlumno, condiciones: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ASIGNACION ACADEMICA Y MATRICULA */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Grado a Matricular</label>
                      <select
                        value={newAlumno.grado}
                        onChange={(e) => setNewAlumno({ ...newAlumno, grado: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                      >
                        <option value="1ro Primaria">1ro Primaria</option>
                        <option value="2do Primaria">2do Primaria</option>
                        <option value="3ro Primaria">3ro Primaria</option>
                        <option value="4to Primaria">4to Primaria</option>
                        <option value="5to Primaria">5to Primaria</option>
                        <option value="6to Primaria">6to Primaria</option>
                        <option value="1ro Secundaria">1ro Secundaria</option>
                        <option value="2do Secundaria">2do Secundaria</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Sección</label>
                      <select
                        value={newAlumno.seccion}
                        onChange={(e) => setNewAlumno({ ...newAlumno, seccion: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-semibold"
                      >
                        <option value="A">Sección A</option>
                        <option value="B">Sección B</option>
                        <option value="C">Sección C</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-3.5">
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-[#5BAD8A]" />
                      Concepto de Pago Inicial (Derecho de Matrícula)
                    </span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Monto de la Matrícula (S/.)</label>
                        <input
                          type="number"
                          placeholder="350.00"
                          value={newAlumno.montoMatricula}
                          onChange={(e) => setNewAlumno({ ...newAlumno, montoMatricula: e.target.value })}
                          className="block w-full rounded-xl border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 text-xs font-bold font-mono"
                        />
                      </div>
                      <div className="text-xs text-gray-500 font-semibold flex flex-col justify-end pb-1 leading-normal">
                        <span>Al matricular, se generará una obligación de pago tipo **Pendiente** que el tutor podrá pagar en su portal.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Wizard Footer buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-150 mt-4">
              {wizardStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
              )}
              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all ml-auto"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterAlumno}
                  className="px-4 py-2 bg-[#5BAD8A] hover:bg-[#5BAD8A]/90 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all ml-auto"
                >
                  Finalizar Matrícula
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
