'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  FileText, 
  Plus, 
  Send, 
  Paperclip 
} from 'lucide-react';

interface TareaItem {
  id: string;
  titulo: string;
  curso: string;
  vencimiento: string;
  prioridad: 'alta' | 'media' | 'baja';
  color: string;
  estado: 'Pendiente' | 'Entregado' | 'Calificado';
  nota?: number;
  entregadoEl?: string;
  comentarioDocente?: string;
}

const INITIAL_TAREAS: TareaItem[] = [
  { 
    id: 't-1', 
    titulo: 'Resolver ejercicios de Fracciones algebraicas', 
    curso: 'Matemática Divertida', 
    vencimiento: 'Hoy, 23:59', 
    prioridad: 'alta', 
    color: '#E07B6A',
    estado: 'Pendiente'
  },
  { 
    id: 't-2', 
    titulo: 'Ensayo sobre Don Quijote de la Mancha', 
    curso: 'Lenguaje y Literatura', 
    vencimiento: 'Viernes, 14:00', 
    prioridad: 'media', 
    color: '#1D1D1F',
    estado: 'Pendiente'
  },
  { 
    id: 't-3', 
    titulo: 'Reporte del experimento sobre la Fotosíntesis', 
    curso: 'Ciencias Naturales', 
    vencimiento: 'Próxima semana', 
    prioridad: 'baja', 
    color: '#5BAD8A',
    estado: 'Entregado',
    entregadoEl: '2026-05-19'
  },
  {
    id: 't-4',
    titulo: 'Práctica Dirigida de Números Enteros',
    curso: 'Matemática Divertida',
    vencimiento: 'Expirado',
    prioridad: 'media',
    color: '#1D1D1F',
    estado: 'Calificado',
    nota: 16,
    entregadoEl: '2026-05-10',
    comentarioDocente: 'Buen desarrollo de ejercicios, sigue así.'
  }
];

export default function TareasAlumno() {
  const [tareas, setTareas] = useState<TareaItem[]>(INITIAL_TAREAS);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTarea, setActiveTarea] = useState<TareaItem | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState('');

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleOpenUpload = (t: TareaItem) => {
    setActiveTarea(t);
    setFileName(null);
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmitTarea = () => {
    if (!activeTarea || !fileName) return;

    const updated = tareas.map(t => {
      if (t.id === activeTarea.id) {
        return {
          ...t,
          estado: 'Entregado' as const,
          entregadoEl: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    setTareas(updated);
    setShowUploadModal(false);
    setActiveTarea(null);
    triggerAlert('Tarea subida con éxito al servidor.');
  };

  return (
    <div className="space-y-6 relative">
      {/* TOAST ALERTA */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-950 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-[#5BAD8A] animate-pulse" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mis Entregas y Tareas</h1>
        <p className="text-sm text-gray-500 mt-1">Sube tus archivos de tareas académicas y revisa tus calificaciones enviadas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending tasks pane */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Tareas Pendientes</h3>
          
          <div className="space-y-3">
            {tareas.filter(t => t.estado === 'Pendiente').map((task) => (
              <div key={task.id} className="premium-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-200 transition-all">
                <div className="flex gap-3">
                  <div className="w-1.5 h-auto rounded-full" style={{ backgroundColor: task.color }} />
                  <div>
                    <h4 className="text-xs font-bold text-gray-950 leading-snug">{task.titulo}</h4>
                    <span className="text-[10px] text-gray-400 font-bold block mt-1">{task.curso}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Límite: {task.vencimiento}
                  </span>
                  <button
                    onClick={() => handleOpenUpload(task)}
                    className="px-3.5 py-1.5 bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer transition-all"
                  >
                    Subir Trabajo
                  </button>
                </div>
              </div>
            ))}
            {tareas.filter(t => t.estado === 'Pendiente').length === 0 && (
              <div className="premium-card p-12 text-center text-gray-400 font-bold text-xs">
                ¡Excelente! Estás al día con todas tus tareas.
              </div>
            )}
          </div>
        </div>

        {/* Checked/Submitted tasks history */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Historial de Calificaciones</h3>
          
          <div className="space-y-3">
            {tareas.filter(t => t.estado !== 'Pendiente').map((task) => (
              <div key={task.id} className="premium-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-950 leading-tight">{task.titulo}</h4>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-1">{task.curso}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                    task.estado === 'Calificado' ? 'bg-[#EAF5EF] text-[#5BAD8A]' : 'bg-[#FEF6E8] text-[#F5A623]'
                  }`}>
                    {task.estado}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-semibold">Entregado: {task.entregadoEl}</span>
                  {task.nota && (
                    <span className={`text-sm font-black font-mono ${task.nota >= 11 ? 'text-[#5BAD8A]' : 'text-[#E07B6A]'}`}>
                      Nota: {task.nota}
                    </span>
                  )}
                </div>

                {task.comentarioDocente && (
                  <p className="text-[10px] text-gray-500 font-bold bg-gray-50 p-2 rounded-lg italic">
                    Feedback: “{task.comentarioDocente}”
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MODAL: UPLOAD TAREA ================= */}
      {showUploadModal && activeTarea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowUploadModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-950 mb-1">Subir Trabajo Escrito</h3>
            <p className="text-xs text-gray-400 font-semibold mb-4">{activeTarea.titulo}</p>
            
            <div className="space-y-4">
              <div className="relative border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 font-bold">
                  {fileName ? fileName : 'Selecciona tu archivo de tarea (.pdf, .doc)'}
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitTarea}
                  disabled={!fileName}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    fileName ? 'bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 shadow-xs' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Entregar Tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
