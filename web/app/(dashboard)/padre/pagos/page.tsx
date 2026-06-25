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
  X,
  UploadCloud
} from 'lucide-react';
import { getStoredPaymentConfig, INSTITUTION_PAYMENT_ACCOUNTS, PaymentAccountsPanel, PaymentConfig, StaticQr } from '@/components/doce/PaymentInstructions';
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
  const [checkoutMode, setCheckoutMode] = useState<'transferencia' | 'tarjeta'>('transferencia');
  const [operationNumber, setOperationNumber] = useState('');
  const [voucherPreview, setVoucherPreview] = useState('');
  const [voucherFileName, setVoucherFileName] = useState('');
  const [institutionPaymentConfig, setInstitutionPaymentConfig] = useState<PaymentConfig>({ accounts: INSTITUTION_PAYMENT_ACCOUNTS });

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

  useEffect(() => {
    if (!currentHijo) return;
    setInstitutionPaymentConfig(getStoredPaymentConfig(`doce_institution_payment_config_${currentHijo.colegio_id}`, INSTITUTION_PAYMENT_ACCOUNTS));
  }, [currentHijo]);

  const handleOpenCheckout = (pago: PagoInfo) => {
    setActivePagoToPay(pago);
    setCheckoutMode('transferencia');
    setOperationNumber('');
    setVoucherPreview('');
    setVoucherFileName('');
    setShowCheckout(true);
  };

  const handleVoucherChange = (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      triggerAlert('El voucher supera los 10MB permitidos.');
      return;
    }
    setVoucherFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setVoucherPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSubmitTransferVoucher = () => {
    if (!activePagoToPay) return;
    if (!operationNumber.trim() || !voucherFileName) {
      triggerAlert('Ingresa el número de operación y adjunta el voucher.');
      return;
    }

    const storedGlobal = getStoredPagos();
    const updated = storedGlobal.map(p => {
      if (p.id === activePagoToPay.id) {
        return {
          ...p,
          estado: 'pendiente' as const,
          metodo: 'Transferencia' as const,
          comprobante: `EN_REVISION-${operationNumber.trim()}-${voucherFileName}`,
          fecha: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });

    saveStoredPagos(updated);
    setPagos(updated);
    setShowCheckout(false);
    setActivePagoToPay(null);
    triggerAlert('Voucher recibido. Tesorería validará el pago antes de liberar el estado de cuenta.');
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
                    ? 'border-[#1D1D1F] bg-[#1D1D1F]/5 text-[#1D1D1F] shadow-xs'
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
                              className="px-3 py-1.5 bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                            >
                              Pagar / adjuntar
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

      {/* ================= MODAL: CHECKOUT CON VOUCHER Y PASARELA MOCK ================= */}
      {showCheckout && activePagoToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowCheckout(false)}></div>
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-[#f8f8f6] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-[#5BAD8A]" />
                <span className="text-xs font-black tracking-widest uppercase text-black">Centro de pago seguro</span>
              </div>
              <button onClick={() => setShowCheckout(false)} className="p-1 hover:bg-black/5 text-black/50 hover:text-black rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_.95fr]">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-black/10 space-y-1">
                  <span className="text-[10px] text-black/40 font-bold uppercase tracking-wider">Concepto de pago</span>
                  <p className="text-sm font-black text-black">{activePagoToPay.concepto}</p>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-black/5">
                    <span className="text-[10px] text-black/40 font-bold uppercase">Total</span>
                    <span className="text-lg font-black text-[#5BAD8A]">S/. {activePagoToPay.monto.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 border border-black/10">
                  <button onClick={() => setCheckoutMode('transferencia')} className={`rounded-xl py-2 text-[11px] font-black ${checkoutMode === 'transferencia' ? 'bg-black text-white' : 'text-black/45'}`}>Transferencia + voucher</button>
                  <button onClick={() => setCheckoutMode('tarjeta')} className={`rounded-xl py-2 text-[11px] font-black ${checkoutMode === 'tarjeta' ? 'bg-black text-white' : 'text-black/45'}`}>Pasarela futura</button>
                </div>

                {checkoutMode === 'transferencia' ? (
                  <div className="rounded-2xl bg-white p-4 border border-black/10">
                    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                      <StaticQr label="QR institucional" imageDataUrl={institutionPaymentConfig.qrDataUrl} />
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-black/45">N° de operación bancaria</label>
                          <input value={operationNumber} onChange={(e) => setOperationNumber(e.target.value)} placeholder="Ej. BCP-1928372" className="mt-2 block w-full rounded-xl border border-black/10 bg-[#f8f8f6] px-3 py-2.5 text-sm font-bold text-black outline-none focus:border-black" />
                        </div>
                        <label className="block cursor-pointer rounded-2xl border border-dashed border-black/20 bg-[#f8f8f6] p-4 text-center hover:border-[#ff2432]">
                          <input type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" className="hidden" onChange={(e) => handleVoucherChange(e.target.files?.[0])} />
                          <UploadCloud className="mx-auto h-6 w-6 text-[#ff2432]" />
                          <span className="mt-2 block text-xs font-black text-black">{voucherFileName || 'Adjuntar voucher JPG, PNG o PDF'}</span>
                          <span className="mt-1 block text-[10px] font-semibold text-black/40">Máximo 10MB. Quedará pendiente de validación.</span>
                        </label>
                        {voucherPreview && voucherPreview.startsWith('data:image') && <img src={voucherPreview} alt="Vista previa del voucher" className="max-h-36 w-full rounded-xl object-contain border border-black/10 bg-white" />}
                        <button onClick={handleSubmitTransferVoucher} className="w-full rounded-xl bg-[#5BAD8A] py-3 text-xs font-black text-white shadow-lg shadow-[#5BAD8A]/20">Enviar voucher a revisión</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#1A1C29] p-4 text-white">
                    <div className="relative w-full h-36 bg-gradient-to-tr from-[#3D405B] to-[#1D1D1F] rounded-xl p-4 shadow-lg mb-4 flex flex-col justify-between overflow-hidden border border-white/10">
                      <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-white/5 rounded-full blur-xl" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-widest italic text-white/90">CREDIT CARD</span>
                        <span className="text-xs font-bold text-white/40">Mock Bank</span>
                      </div>
                      <p className="text-sm font-mono tracking-widest font-bold">{cardDetails.number}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
                        <div><span className="text-[8px] text-white/40 block">TARJETAHABIENTE</span><span>{cardDetails.holder}</span></div>
                        <div><span className="text-[8px] text-white/40 block">VENCE</span><span>{cardDetails.expiry}</span></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[8px] font-black text-white/50 uppercase tracking-wider mb-1">Nombre Completo en la Tarjeta</label>
                        <input type="text" value={cardDetails.holder} onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value.toUpperCase() })} className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-[#1D1D1F] text-xs font-bold font-mono" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[8px] font-black text-white/50 uppercase tracking-wider mb-1">Número de Tarjeta</label>
                          <input type="text" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-[#1D1D1F] text-xs font-bold font-mono" />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-white/50 uppercase tracking-wider mb-1">CVV</label>
                          <input type="text" maxLength={3} value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} className="block w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-[#1D1D1F] text-xs font-bold font-mono text-center" />
                        </div>
                      </div>

                      <button onClick={handleSimulatePayment} disabled={processing} className="w-full py-2.5 bg-[#5BAD8A] hover:bg-[#5BAD8A]/90 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2">
                        {processing ? <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Simulando webhook...</> : <><Lock className="w-4 h-4" /> Pagar S/. {activePagoToPay.monto.toFixed(2)}</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <PaymentAccountsPanel accounts={institutionPaymentConfig.accounts} updatedAt={institutionPaymentConfig.updatedAt} compact title="Cuentas de la institución" subtitle="Usa estos canales para pagos manuales. En producción cada colegio configura sus propias cuentas." />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
