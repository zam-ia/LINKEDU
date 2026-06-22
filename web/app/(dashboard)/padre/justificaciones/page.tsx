'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';
import { getStoredAlumnos, AlumnoInfo } from '@/lib/supabase/client';

interface JustificacionItem {
  id: string;
  hijoId: string;
  nombreHijo: string;
  fechaFalta: string;
  motivo: string;
  archivoName: string | null;
  estado: 'Pendiente' | 'Aprobado';
  fechaEnvio: string;
}

const INITIAL_JUSTIFICACIONES: JustificacionItem[] = [
  {
    id: 'just-1',
    hijoId: 'a2222222-2222-2222-2222-222222222222', // Mateo
    nombreHijo: 'Mateo Castro',
    fechaFalta: '2026-05-21',
    motivo: 'Cita médica dental programada por brackets.',
    archivoName: 'receta_odontologica.jpg',
    estado: 'Pendiente',
    fechaEnvio: '2026-05-21'
  }
];

export default function JustificacionesPadre() {
  const { user } = useAuthStore();
  const [hijos, setHijos] = useState<AlumnoInfo[]>([]);
  const [selectedHijoId, setSelectedHijoId] = useState('');
  
  // Justificaciones state
  const [justificaciones, setJustificaciones] = useState<JustificacionItem[]>([]);
  
  // Form input states
  const [fechaFalta, setFechaFalta] = useState(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const storedAlumnos = getStoredAlumnos();
    if (user) {
      const matchedHijos = storedAlumnos.filter(
        a => a.contacto_tutor.email === user.email
      );
      setHijos(matchedHijos);
      if (matchedHijos.length > 0) {
        setSelectedHijoId(matchedHijos[0].id);
      }
    }

    // Load justification logs from localStorage
    const saved = localStorage.getItem('doce_justificaciones');
    if (saved) {
      try {
        setJustificaciones(JSON.parse(saved));
      } catch (e) {
        setJustificaciones(INITIAL_JUSTIFICACIONES);
      }
    } else {
      localStorage.setItem('doce_justificaciones', JSON.stringify(INITIAL_JUSTIFICACIONES));
      setJustificaciones(INITIAL_JUSTIFICACIONES);
    }
  }, [user]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSubmitJustificacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo || !selectedHijoId) return;

    const child = hijos.find(h => h.id === selectedHijoId);
    if (!child) return;

    const added: JustificacionItem = {
      id: 'just-' + Date.now(),
      hijoId: selectedHijoId,
      nombreHijo: `${child.nombre} ${child.apellido}`,
      fechaFalta,
      motivo,
      archivoName: attachmentName,
      estado: 'Pendiente',
      fechaEnvio: new Date().toISOString().split('T')[0]
    };

    const updated = [added, ...justificaciones];
    localStorage.setItem('doce_justificaciones', JSON.stringify(updated));
    setJustificaciones(updated);

    // Reset Form
    setMotivo('');
    setAttachmentName(null);
    triggerAlert('Justificación médica enviada al tutor y director.');
  };

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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Justificación de Inasistencias</h1>
        <p className="text-sm text-gray-500 mt-1">Envía dispensas médicas o justificaciones para regularizar la asistencia de tus hijos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="premium-card p-6 space-y-4 h-fit">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2.5">
            Registrar Justificación
          </h3>

          <form onSubmit={handleSubmitJustificacion} className="space-y-4">
            <div>
              <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1.5">Hijo / Estudiante</label>
              <select
                value={selectedHijoId}
                onChange={(e) => setSelectedHijoId(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white text-xs font-semibold focus:outline-none"
              >
                {hijos.map(h => (
                  <option key={h.id} value={h.id}>{h.nombre} {h.apellido}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1.5">Fecha de la Falta</label>
              <input
                type="date"
                required
                value={fechaFalta}
                onChange={(e) => setFechaFalta(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1.5">Motivo / Descripción médica</label>
              <textarea
                required
                rows={3}
                placeholder="Ej. Fiebre y malestar general. Adjunto descanso..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/10"
              />
            </div>

            {/* Simulado de Adjunto */}
            <div>
              <label className="block text-[9px] font-black text-gray-450 uppercase tracking-wider mb-1.5">Receta o Certificado Médico (.jpg, .pdf)</label>
              <div className="relative border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSimulate}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Paperclip className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-500 font-bold">
                  {attachmentName ? attachmentName : 'Selecciona o arrastra el archivo'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1D1D1F] hover:bg-[#1D1D1F]/95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Enviar Justificación
            </button>
          </form>
        </div>

        {/* History panel */}
        <div className="lg:col-span-2 premium-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2.5">
            Historial de Justificaciones enviadas
          </h3>

          <div className="space-y-4">
            {justificaciones.map(just => (
              <div key={just.id} className="p-4 border border-gray-150 rounded-2xl bg-gray-50 flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-950">{just.nombreHijo}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Fecha falta: {just.fechaFalta}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">{just.motivo}</p>
                  
                  {just.archivoName && (
                    <div className="inline-flex items-center gap-1.5 p-1 px-2 border bg-white border-gray-200 rounded-lg text-[9px] font-bold text-gray-500">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <span>{just.archivoName}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                    just.estado === 'Aprobado' ? 'bg-[#EAF5EF] text-[#5BAD8A]' : 'bg-[#FEF6E8] text-[#F5A623]'
                  }`}>
                    {just.estado}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold">Enviado: {just.fechaEnvio}</span>
                </div>
              </div>
            ))}
            {justificaciones.length === 0 && (
              <div className="p-12 text-center text-gray-450">
                Aún no has registrado justificaciones en este periodo.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
