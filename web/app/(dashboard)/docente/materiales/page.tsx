'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Folder, 
  File, 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Link, 
  Share2, 
  X,
  FolderOpen
} from 'lucide-react';
import { getStoredDocentes } from '@/lib/supabase/client';

interface RepoItem {
  id: string;
  nombre: string;
  tipo: 'archivo' | 'link';
  url: string;
  tamano?: string;
  fecha: string;
  curso: string;
}

const INITIAL_MATERIALES: RepoItem[] = [
  {
    id: 'mat-1',
    nombre: 'Syllabus Anual - Matemática I.pdf',
    tipo: 'archivo',
    url: '#',
    tamano: '1.2 MB',
    fecha: '2026-05-02',
    curso: 'Matemática Divertida'
  },
  {
    id: 'mat-2',
    nombre: 'Guía de Ecuaciones de Primer Grado.pdf',
    tipo: 'archivo',
    url: '#',
    tamano: '3.4 MB',
    fecha: '2026-05-18',
    curso: 'Matemática Divertida'
  },
  {
    id: 'mat-3',
    nombre: 'Video Complementario: Multiplicación Divertida',
    tipo: 'link',
    url: 'https://youtube.com',
    fecha: '2026-05-20',
    curso: 'Matemática Divertida'
  }
];

export default function RepositorioDocente() {
  const { user } = useAuthStore();
  const [cursos, setCursos] = useState<string[]>([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [materiales, setMateriales] = useState<RepoItem[]>([]);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    nombre: '',
    tipo: 'archivo' as 'archivo' | 'link',
    url: '',
    tamano: '1.5 MB'
  });

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    // Get teacher's courses
    const allDocentes = getStoredDocentes();
    const activeDocente = allDocentes.find(d => d.email === user?.email);

    if (activeDocente && activeDocente.cursos_asignados.length > 0) {
      const distinctCursos = Array.from(new Set(activeDocente.cursos_asignados.map(c => c.curso)));
      setCursos(distinctCursos);
      setSelectedCurso(distinctCursos[0]);
    }

    // Load from localStorage or initialize
    const saved = localStorage.getItem('linkedu_materiales');
    if (saved) {
      try {
        setMateriales(JSON.parse(saved));
      } catch (e) {
        setMateriales(INITIAL_MATERIALES);
      }
    } else {
      localStorage.setItem('linkedu_materiales', JSON.stringify(INITIAL_MATERIALES));
      setMateriales(INITIAL_MATERIALES);
    }
  }, [user]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.nombre) return;

    const added: RepoItem = {
      id: 'mat-' + Date.now(),
      nombre: newMaterial.nombre,
      tipo: newMaterial.tipo,
      url: newMaterial.url || '#',
      tamano: newMaterial.tipo === 'archivo' ? newMaterial.tamano : undefined,
      fecha: new Date().toISOString().split('T')[0],
      curso: selectedCurso
    };

    const updated = [added, ...materiales];
    localStorage.setItem('linkedu_materiales', JSON.stringify(updated));
    setMateriales(updated);

    setShowAddModal(false);
    setNewMaterial({ nombre: '', tipo: 'archivo', url: '', tamano: '1.5 MB' });
    triggerAlert('Material de clase subido y compartido exitosamente.');
  };

  const handleRemoveMaterial = (id: string) => {
    const updated = materiales.filter(m => m.id !== id);
    localStorage.setItem('linkedu_materiales', JSON.stringify(updated));
    setMateriales(updated);
    triggerAlert('Material eliminado.');
  };

  const currentMateriales = materiales.filter(m => m.curso === selectedCurso);

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
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Repositorio Docente</h1>
          <p className="text-sm text-gray-500 mt-1">Carga guías de estudio, exámenes resueltos y enlaces complementarios para tus alumnos.</p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            Subir Material
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Folder list */}
        <div className="premium-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Tus Asignaturas</h3>
          <div className="space-y-2">
            {cursos.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCurso(c)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedCurso === c 
                    ? 'border-[#4F6AF0] bg-[#4F6AF0]/5 text-[#4F6AF0] font-bold shadow-xs' 
                    : 'border-gray-150 hover:bg-gray-50 text-gray-500'
                }`}
              >
                <Folder className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-bold truncate">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Files display pane */}
        <div className="lg:col-span-3 premium-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-150 pb-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-black text-gray-950">{selectedCurso}</h3>
            </div>
            <span className="text-xs font-bold text-gray-500">{currentMateriales.length} archivos compartidos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMateriales.map((mat) => (
              <div key={mat.id} className="p-4 border border-gray-150 bg-gray-50/50 rounded-2xl flex items-center justify-between group hover:border-[#4F6AF0]/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-xl shadow-xs">
                    {mat.tipo === 'archivo' ? '📄' : '🔗'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-950 truncate leading-snug">{mat.nombre}</p>
                    <p className="text-[10px] text-gray-450 font-semibold mt-0.5">
                      {mat.tipo === 'archivo' ? mat.tamano : 'Enlace Web'} • {mat.fecha}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {mat.tipo === 'archivo' ? (
                    <button 
                      onClick={() => triggerAlert('Descargando archivo...')}
                      className="p-2 hover:bg-[#EEF1FE] text-gray-400 hover:text-[#4F6AF0] rounded-xl cursor-pointer"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <a 
                      href={mat.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2 hover:bg-[#EEF1FE] text-gray-400 hover:text-[#4F6AF0] rounded-xl cursor-pointer"
                      title="Abrir Enlace"
                    >
                      <Link className="w-4 h-4" />
                    </a>
                  )}
                  <button 
                    onClick={() => handleRemoveMaterial(mat.id)}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-[#E07B6A] rounded-xl cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {currentMateriales.length === 0 && (
              <div className="col-span-2 p-12 text-center text-gray-450">
                Aún no has compartido material de estudio para esta asignatura.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL: ADD MATERIAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-950 mb-4">Compartir Material de Estudio</h3>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Tipo de Material</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewMaterial({ ...newMaterial, tipo: 'archivo' })}
                    className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                      newMaterial.tipo === 'archivo' ? 'border-[#4F6AF0] bg-[#4F6AF0]/5 text-[#4F6AF0]' : 'border-gray-250 text-gray-600'
                    }`}
                  >
                    Subir Archivo (.pdf, .zip)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMaterial({ ...newMaterial, tipo: 'link' })}
                    className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                      newMaterial.tipo === 'link' ? 'border-[#4F6AF0] bg-[#4F6AF0]/5 text-[#4F6AF0]' : 'border-gray-250 text-gray-600'
                    }`}
                  >
                    Enlace Web / URL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Nombre del Documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Balotario Bimestral de Ejercicios"
                  value={newMaterial.nombre}
                  onChange={(e) => setNewMaterial({ ...newMaterial, nombre: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              {newMaterial.tipo === 'link' ? (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">URL del Enlace Web</label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Tamaño Simulado</label>
                  <input
                    type="text"
                    placeholder="Ej. 2.4 MB"
                    value={newMaterial.tamano}
                    onChange={(e) => setNewMaterial({ ...newMaterial, tamano: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold focus:outline-none font-mono"
                  />
                </div>
              )}

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
                  Compartir Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
