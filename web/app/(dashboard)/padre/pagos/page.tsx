'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Sparkles, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  Lock, 
  X 
} from 'lucide-react';
import { 
  getStoredAlumnos, 
  saveStoredAlumnos, 
  getStoredPagos, 
  saveStoredPagos, 
  AlumnoInfo, 
  PagoInfo 
} from '@/lib/supabase/client';

export default function PagosPadre() {
  const { user } = useAuthStore();
  const [hijos, setHijos] = useState<AlumnoInfo[]>([]);
  const [selectedHijoId, setSelectedHijoId] = useState('');
  const [pagos, setPagos] = useState<PagoInfo[]>([]);

  // Payment checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [activePagoToPay, setActivePagoToPay] = useState<PagoInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '4111 2222 3333 4444',
    expiry: '12/29',
    cvv: '123',
    holder: 'SOFIA CASTRO'
  });

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const storedAlumnos = getStoredAlumnos();
    const storedPagos = getStoredPagos();

    if (user) {
      const matchedHijos = storedAlumnos.filter(
        a => a.contacto_tutor.email === user.email
      );
      setHijos(matchedHijos);
      if (matchedHijos.length > 0) {
        setSelectedHijoId(matchedHijos[0].id);
      }
      setPagos(storedPagos);
    }
  }, [user]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const currentHijo = hijos.find(h => h.id === selectedHijoId);
  const childPagos = pagos.filter(p => p.alumno_id === selectedHijoId && p.tipo === 'ingreso');

  const handleOpenCheckout = (pago: PagoInfo) => {
    setActivePagoToPay(pago);
    setShowCheckout(true);
  };

  const handleSimulatePayment = () => {
    if (!activePagoToPay || !currentHijo) return;

    setProcessing(true);
    // Simulate webhook bank delays (Culqi/MercadoPago API call)
    setTimeout(() => {
      setProcessing(false);
      
      const storedGlobal = getStoredPagos();
      const updated = storedGlobal.map(p => {
        if (p.id === activePagoToPay.id) {
          return {
            ...p,
            estado: 'pagado' as const,
            metodo: 'Tarjeta' as const,
            comprobante: `CULQI-REF-${Math.floor(Math.random() * 900000 + 100000)}`,
            fecha: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      });

      saveStoredPagos(updated);
      setPagos(updated);

      // Dynamically evaluate if student has any remaining overdue/vencido debts
      const storedGlobalAlumnos = getStoredAlumnos();
      const updatedAlumnos = storedGlobalAlumnos.map(a => {
        if (a.id === currentHijo.id) {
          const remainingVencidos = updated.filter(
            p => p.alumno_id === a.id && p.estado === 'vencido' && p.id !== activePagoToPay.id
          );
          return {
            ...a,
            financiero: remainingVencidos.length > 0 ? ('en_mora' as const) : ('al_dia' as const)
          };
        }
        return a;
      });
      saveStoredAlumnos(updatedAlumnos);
      setHijos(updatedAlumnos.filter(a => a.contacto_tutor.email === user?.email));

      setShowCheckout(false);
      setActivePagoToPay(null);
      triggerAlert(`¡Pago de S/. ${activePagoToPay.monto} procesado con éxito en Culqi!`);
    }, 2000);
  };

  return (
    <div className="space-y-6 relative">
      {/* TOAST NOTIFICADOR */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-950 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-[#5BAD8A] animate-pulse" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Estado de Cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">Consulta tus recibos, pensiones mensuales vencidas y realiza pagos seguros en línea.</p>
        </div>

        {/* Hijos selector tabs */}
        {hijos.length > 1 && (
          <div className="flex gap-2">
            {hijos.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHijoId(h.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedHijoId === h.id 
                    ? 'border-[#4F6AF0] bg-[#4F6AF0]/5 text-[#4F6AF0] shadow-xs' 
                    : 'border-gray-250 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {h.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {currentHijo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Children card profile */}
          <div className="premium-card p-5 space-y-4 h-fit">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-150">
              <img src={currentHijo.foto_url} alt="" className="w-12 h-12 rounded-full object-cover border" />
              <div>
                <h3 className="font-extrabold text-sm text-gray-950 leading-snug">{currentHijo.nombre} {currentHijo.apellido}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{currentHijo.grado} - {currentHijo.seccion}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-gray-600 font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-gray-405">Estado contable:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  currentHijo.financiero === 'al_dia' ? 'bg-[#EAF5EF] text-[#5BAD8A]' : 'bg-[#FDECEA] text-[#E07B6A]'
                }`}>
                  {currentHijo.financiero === 'al_dia' ? 'Al Día' : 'En Mora'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-450">Pensiones Vencidas:</span>
                <span className="font-mono font-black text-gray-900">
                  {childPagos.filter(p => p.estado === 'vencido').length} cuotas
                </span>
              </div>
            </div>
          </div>

          {/* Payments list pane */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Obligaciones y Mensualidades</h3>
            
            <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-3.5">Concepto</th>
                      <th className="p-3.5">Vencimiento</th>
                      <th className="p-3.5">Monto</th>
                      <th className="p-3.5">Estado</th>
                      <th className="p-3.5 text-right">Pagar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {childPagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50/40">
                        <td className="p-3.5 font-bold text-gray-900">{pago.concepto}</td>
                        <td className="p-3.5 text-gray-400 font-bold">{pago.vencimiento || '—'}</td>
                        <td className="p-3.5 font-black text-gray-900">S/. {pago.monto.toFixed(2)}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            pago.estado === 'pagado' ? 'bg-[#EAF5EF] text-[#5BAD8A]' :
                            pago.estado === 'vencido' ? 'bg-[#FDECEA] text-[#E07B6A]' : 'bg-[#FEF6E8] text-[#F5A623]'
                          }`}>
                            {pago.estado}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {pago.estado !== 'pagado' ? (
                            <button
                              onClick={() => handleOpenCheckout(pago)}
                              className="px-3 py-1.5 bg-[#4F6AF0] hover:bg-[#4F6AF0]/90 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                            >
                              Pagar en Línea
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold italic">Sincronizado ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="premium-card p-12 text-center text-gray-400 font-bold text-sm">
          No se encontraron cuentas asociadas.
        </div>
      )}

      {/* ================= MODAL: SECURE CHECKOUT (CULQI MOCKUP) ================= */}
      {showCheckout && activePagoToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowCheckout(false)}></div>
          <div className="relative bg-[#1A1C29] text-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-[#5BAD8A]" />
                <span className="text-xs font-black tracking-widest uppercase text-white">Pasarela Segura Culqi</span>
              </div>
              <button onClick={() => setShowCheckout(false)} className="p-1 hover:bg-white/10 text-white/50 hover:text-white rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sumary of payment */}
            <div className="bg-white/5 p-4 rounded-xl space-y-1 mb-4">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Concepto de Pago</span>
              <p className="text-xs font-black">{activePagoToPay.concepto}</p>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                <span className="text-[10px] text-white/50 font-bold uppercase">Total a debitar</span>
                <span className="text-sm font-black text-[#5BAD8A]">S/. {activePagoToPay.monto.toFixed(2)}</span>
              </div>
            </div>

            {/* Card Simulator Graphic */}
            <div className="relative w-full h-36 bg-gradient-to-tr from-[#3D405B] to-[#4F6AF0] rounded-xl p-4 shadow-lg mb-4 flex flex-col justify-between overflow-hidden border border-white/10">
              <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-white/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest italic text-white/90">CREDIT CARD</span>
                <span className="text-xs font-bold text-white/40">Mock Bank</span>
              </div>
              <p className="text-sm font-mono tracking-widest font-bold">{cardDetails.number}</p>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
                <div>
                  <span className="text-[8px] text-white/40 block">TARJETAHABIENTE</span>
                  <span>{cardDetails.holder}</span>
                </div>
                <div>
                  <span className="text-[8px] text-white/40 block">VENCE</span>
                  <span>{cardDetails.expiry}</span>
                </div>
              </div>
            </div>

            {/* Card Inputs Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-[8px] font-black text-white/50 uppercase tracking-wider mb-1">Nombre Completo en la Tarjeta</label>
                <input
                  type="text"
                  value={cardDetails.holder}
                  onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value.toUpperCase() })}
                  className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-[#4F6AF0] text-xs font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[8px] font-black text-white/50 uppercase tracking-wider mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-[#4F6AF0] text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-white/50 uppercase tracking-wider mb-1">CVV</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-[#4F6AF0] text-xs font-bold font-mono text-center"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={processing}
                className="w-full py-2.5 bg-[#5BAD8A] hover:bg-[#5BAD8A]/90 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Simulando transacción webhook...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pagar S/. {activePagoToPay.monto.toFixed(2)}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
