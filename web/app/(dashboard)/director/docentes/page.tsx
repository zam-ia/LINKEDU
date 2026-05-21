'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Plus, 
  Sparkles, 
  Search, 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  X, 
  Trash2, 
  BookOpen, 
  FileText 
} from 'lucide-react';
import { 
  getStoredDocentes, 
  saveStoredDocentes, 
  getStoredColegios,
  DocenteInfo 
} from '@/lib/supabase/client';

export default function DocentesPage() {
  const { colegio } = useAuthStore();
  const [docentes, setDocentes] = useState<DocenteInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'lista' | 'carga'>('lista');
  const [schoolPlan, setSchoolPlan] = useState('Premium SaaS');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocente, setNewDocente] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    especialidad: 'Matemáticas',
    contrato: 'planilla' as 'planilla' | 'honorarios',
    salario: '1500',
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
  });

  // Schedule Course load states
  const [editingDocenteCarga, setEditingDocenteCarga] = useState<DocenteInfo | null>(null);
  const [newCursoAsignado, setNewCursoAsignado] = useState({
    curso: 'Matemática Divertida',
    seccion: '1ro Primaria - A',
    horas: 4
  });

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const storedDocentes = getStoredDocentes();
    const storedColegios = getStoredColegios();

    if (colegio) {
      const matchCol = storedColegios.find(c => c.id === colegio.id);
      if (matchCol) {
        setSchoolPlan(matchCol.plan || 'Premium SaaS');
      }
      setDocentes(storedDocentes.filter(d => d.colegio_id === colegio.id));
    }
  }, [colegio]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleRegisterDocente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colegio || !newDocente.nombre || !newDocente.apellido || !newDocente.dni || !newDocente.email) {
      triggerAlert('Por favor, completa los campos requeridos.');
      return;
    }

    const added: DocenteInfo = {
      id: 'docente-' + Date.now(),
      colegio_id: colegio.id,
      nombre: newDocente.nombre,
      apellido: newDocente.apellido,
      dni: newDocente.dni,
      foto_url: newDocente.foto_url,
      email: newDocente.email,
      especialidad: newDocente.especialidad,
      contrato: newDocente.contrato,
      salario: parseFloat(newDocente.salario) || 1500,
      estado: 'activo',
      cursos_asignados: []
    };

    const storedGlobal = getStoredDocentes();
    const updated = [added, ...storedGlobal];
    saveStoredDocentes(updated);

    setDocentes(updated.filter(d => d.colegio_id === colegio.id));
    setShowAddModal(false);
    setNewDocente({
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      especialidad: 'Matemáticas',
      contrato: 'planilla',
      salario: '1500',
      foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
    });
    triggerAlert(`Docente ${added.nombre} ${added.apellido} registrado exitosamente.`);
  };

  const handleAddCursoLoad = () => {
    if (!editingDocenteCarga || !colegio) return;

    // Check if course load has conflict (same course in same section for example)
    const exists = editingDocenteCarga.cursos_asignados.some(
      c => c.curso === newCursoAsignado.curso && c.seccion === newCursoAsignado.seccion
    );

    if (exists) {
      triggerAlert('Conflicto: Este docente ya dicta ese curso en la sección seleccionada.');
      return;
    }

    const updatedCarga = [...editingDocenteCarga.cursos_asignados, newCursoAsignado];
    const updatedDocente = { ...editingDocenteCarga, cursos_asignados: updatedCarga };

    const storedGlobal = getStoredDocentes();
    const updatedGlobal = storedGlobal.map(d => d.id === editingDocenteCarga.id ? updatedDocente : d);
    saveStoredDocentes(updatedGlobal);

    setDocentes(updatedGlobal.filter(d => d.colegio_id === colegio.id));
    setEditingDocenteCarga(updatedDocente);
    triggerAlert('Carga académica actualizada.');
  };

  const handleRemoveCursoLoad = (index: number) => {
    if (!editingDocenteCarga || !colegio) return;

    const updatedCarga = editingDocenteCarga.cursos_asignados.filter((_, i) => i !== index);
    const updatedDocente = { ...editingDocenteCarga, cursos_asignados: updatedCarga };

    const storedGlobal = getStoredDocentes();
    const updatedGlobal = storedGlobal.map(d => d.id === editingDocenteCarga.id ? updatedDocente : d);
    saveStoredDocentes(updatedGlobal);

    setDocentes(updatedGlobal.filter(d => d.colegio_id === colegio.id));
    setEditingDocenteCarga(updatedDocente);
    triggerAlert('Curso removido de la carga académica.');
  };

  const filteredDocentes = docentes.filter(d => {
    const full = `${d.nombre} ${d.apellido}`.toLowerCase();
    return full.includes(searchQuery.toLowerCase()) || d.dni.includes(searchQuery);
  });

  return (
    <div className="space-y-6 relative">
      {/* TOAST ALERTA */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-950 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-[#F5A623] animate-pulse" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Personal Docente</h1>
          <p className="text-sm text-gray-500 mt-1">Supervisión académica, salarios, contratos y asignación horaria de profesores.</p>
        </div>
        <div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#4F6AF0]/20 cursor-pointer transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            Registrar Profesor
          </button>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('lista')}
          className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'lista'
              ? 'border-[#4F6AF0] text-[#4F6AF0]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Lista de Personal
        </button>
        <button
          onClick={() => setActiveTab('carga')}
          className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'carga'
              ? 'border-[#4F6AF0] text-[#4F6AF0]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Carga Académica y Horarios
        </button>
      </div>

      {/* SEARCH OR INTERACTIVE SCREEN */}
      {activeTab === 'lista' && (
        <div className="space-y-6">
          <div className="premium-card p-4 flex items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                placeholder="Buscar docente por nombre o DNI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs text-gray-950 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocentes.map((doc) => (
              <div key={doc.id} className="premium-card p-5 space-y-4 hover:scale-[1.01] transition-all">
                <div className="flex items-center gap-3.5 border-b border-gray-150 pb-3">
                  <img src={doc.foto_url} alt="" className="w-12 h-12 rounded-full object-cover border" />
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-950 leading-snug">{doc.nombre} {doc.apellido}</h3>
                    <span className="text-[10px] text-[#4F6AF0] font-black uppercase tracking-wider">{doc.especialidad}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 font-semibold">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-450" />
                    <span>Contrato: <span className="font-bold uppercase text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">{doc.contrato}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-450" />
                    <span>{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-450" />
                    <span>DNI: {doc.dni}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-450" />
                    <span>Salario: <span className="font-black text-gray-900">S/. {doc.salario.toLocaleString()}</span></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-150 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#5BAD8A]">
                    <span className="h-2 w-2 rounded-full bg-[#5BAD8A]" />
                    {doc.cursos_asignados.length} Cursos dictados
                  </span>
                  <button 
                    onClick={() => {
                      setEditingDocenteCarga(doc);
                      setActiveTab('carga');
                    }}
                    className="text-[10px] font-black text-[#4F6AF0] uppercase hover:underline"
                  >
                    Asignar Horas
                  </button>
                </div>
              </div>
            ))}
            {filteredDocentes.length === 0 && (
              <div className="p-12 text-center text-gray-400 font-bold text-sm col-span-3">
                No hay profesores registrados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CARGA HORARIA / ASIGNACION */}
      {activeTab === 'carga' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Docente Selector Sidepane */}
          <div className="premium-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Selecciona Docente</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {docentes.map(d => (
                <button
                  key={d.id}
                  onClick={() => setEditingDocenteCarga(d)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                    editingDocenteCarga?.id === d.id 
                      ? 'border-[#4F6AF0] bg-[#4F6AF0]/5 text-gray-950 font-bold shadow-xs' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <img src={d.foto_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate">{d.nombre} {d.apellido}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate font-semibold">{d.especialidad}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Carga Detail Pane */}
          <div className="lg:col-span-2 space-y-6">
            {editingDocenteCarga ? (
              <div className="premium-card p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-150 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-gray-950">
                      Carga Académica de {editingDocenteCarga.nombre} {editingDocenteCarga.apellido}
                    </h3>
                    <p className="text-xs text-gray-400 font-semibold">Cursos dictados en las diferentes secciones del colegio.</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">
                    Total Horas: {editingDocenteCarga.cursos_asignados.reduce((sum, c) => sum + c.horas, 0)} hrs/sem
                  </span>
                </div>

                {/* Assigned Courses Table */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Cursos Asignados</h4>
                  <div className="border border-gray-150 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="p-3">Curso</th>
                          <th className="p-3">Sección / Grado</th>
                          <th className="p-3">Horas / Semanales</th>
                          <th className="p-3 text-right">Remover</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {editingDocenteCarga.cursos_asignados.map((carga, index) => (
                          <tr key={index}>
                            <td className="p-3 font-bold text-gray-900">{carga.curso}</td>
                            <td className="p-3 text-gray-600">{carga.seccion}</td>
                            <td className="p-3 text-gray-750 font-bold">{carga.horas} horas</td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => handleRemoveCursoLoad(index)}
                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-[#E07B6A] rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {editingDocenteCarga.cursos_asignados.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-450">
                              Este docente aún no tiene asignada una carga académica para el periodo actual.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Course assignment Form */}
                <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#4F6AF0]" />
                    Asignar Nueva Carga Horaria
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1">Nombre del Curso</label>
                      <select
                        value={newCursoAsignado.curso}
                        onChange={(e) => setNewCursoAsignado({ ...newCursoAsignado, curso: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 bg-white text-xs font-semibold focus:outline-none"
                      >
                        <option value="Matemática Divertida">Matemática Divertida</option>
                        <option value="Lenguaje y Literatura">Lenguaje y Literatura</option>
                        <option value="Historia del Perú">Historia del Perú</option>
                        <option value="Ciencias Naturales">Ciencias Naturales</option>
                        <option value="Inglés Avanzado">Inglés Avanzado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1">Grado & Sección</label>
                      <select
                        value={newCursoAsignado.seccion}
                        onChange={(e) => setNewCursoAsignado({ ...newCursoAsignado, seccion: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 bg-white text-xs font-semibold focus:outline-none"
                      >
                        <option value="1ro Primaria - A">1ro Primaria - A</option>
                        <option value="2do Primaria - A">2do Primaria - A</option>
                        <option value="3ro Primaria - A">3ro Primaria - A</option>
                        <option value="1ro Secundaria - A">1ro Secundaria - A</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1">Horas Semanales</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={newCursoAsignado.horas}
                        onChange={(e) => setNewCursoAsignado({ ...newCursoAsignado, horas: parseInt(e.target.value) || 4 })}
                        className="block w-full rounded-xl border border-gray-300 py-2 px-2.5 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddCursoLoad}
                    className="w-full py-2 bg-[#4F6AF0] hover:bg-[#4F6AF0]/95 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    Asignar Horas Dictadas
                  </button>
                </div>
              </div>
            ) : (
              <div className="premium-card p-12 text-center text-gray-400 font-bold text-sm">
                Selecciona un docente de la barra lateral para configurar su carga académica.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: AGREGAR DOCENTE ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-950 mb-4">Registrar Nuevo Profesor</h3>
            <form onSubmit={handleRegisterDocente} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Nombre <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newDocente.nombre}
                    onChange={(e) => setNewDocente({ ...newDocente, nombre: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Apellido <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newDocente.apellido}
                    onChange={(e) => setNewDocente({ ...newDocente, apellido: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">DNI <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    maxLength={8}
                    required
                    value={newDocente.dni}
                    onChange={(e) => setNewDocente({ ...newDocente, dni: e.target.value.replace(/\D/g, '') })}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-xs font-semibold focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Especialidad</label>
                  <select
                    value={newDocente.especialidad}
                    onChange={(e) => setNewDocente({ ...newDocente, especialidad: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-3 bg-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="Matemática y Ciencias">Matemática y Ciencias</option>
                    <option value="Lengua Española">Lengua Española</option>
                    <option value="Historia y Cívica">Historia y Cívica</option>
                    <option value="Idiomas Extranjeros">Idiomas Extranjeros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Correo Institucional <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={newDocente.email}
                  onChange={(e) => setNewDocente({ ...newDocente, email: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Tipo de Contrato</label>
                  <select
                    value={newDocente.contrato}
                    onChange={(e) => setNewDocente({ ...newDocente, contrato: e.target.value as any })}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-3 bg-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="planilla">Planilla Completa</option>
                    <option value="honorarios">Locación (Honorarios)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Monto de Pago (S/.)</label>
                  <input
                    type="number"
                    value={newDocente.salario}
                    onChange={(e) => setNewDocente({ ...newDocente, salario: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2 px-3 text-xs font-bold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Registrar Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
