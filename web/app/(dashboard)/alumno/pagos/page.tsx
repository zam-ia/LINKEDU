"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, CreditCard, UploadCloud } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  AlumnoInfo,
  getStoredAlumnos,
  getStoredPagos,
  PagoInfo,
  saveStoredPagos,
} from "@/lib/supabase/client";
import {
  getStoredPaymentConfig,
  INSTITUTION_PAYMENT_ACCOUNTS,
  PaymentAccountsPanel,
  PaymentConfig,
  StaticQr,
} from "@/components/doce/PaymentInstructions";

export default function StudentPaymentsPage() {
  const { user } = useAuthStore();
  const [student, setStudent] = useState<AlumnoInfo | null>(null);
  const [pagos, setPagos] = useState<PagoInfo[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ accounts: INSTITUTION_PAYMENT_ACCOUNTS });
  const [selectedPago, setSelectedPago] = useState<PagoInfo | null>(null);
  const [operationNumber, setOperationNumber] = useState("");
  const [voucherName, setVoucherName] = useState("");
  const [voucherPreview, setVoucherPreview] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    const alumnos = getStoredAlumnos();
    const current = alumnos.find((item) => item.id === user?.id || item.email === user?.email) || alumnos[0] || null;
    setStudent(current);
    const storedPagos = getStoredPagos();
    setPagos(storedPagos);
    if (current) {
      setPaymentConfig(getStoredPaymentConfig(`doce_institution_payment_config_${current.colegio_id}`, INSTITUTION_PAYMENT_ACCOUNTS));
    }
  }, [user]);

  const studentPayments = student ? pagos.filter((item) => item.alumno_id === student.id && item.tipo === "ingreso") : [];
  const vencidos = studentPayments.filter((item) => item.estado === "vencido");
  const pendientes = studentPayments.filter((item) => item.estado !== "pagado");

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 3500);
  };

  const handleVoucherUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      triggerAlert("El voucher supera los 10MB permitidos.");
      return;
    }
    setVoucherName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setVoucherPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const submitVoucher = () => {
    if (!selectedPago) return;
    if (!operationNumber.trim() || !voucherName) {
      triggerAlert("Ingresa el número de operación y adjunta tu voucher.");
      return;
    }
    const updated = getStoredPagos().map((item) => item.id === selectedPago.id ? {
      ...item,
      estado: "pendiente" as const,
      metodo: "Transferencia" as const,
      comprobante: `ALUMNO-EN_REVISION-${operationNumber.trim()}-${voucherName}`,
      fecha: new Date().toISOString().split("T")[0],
    } : item);
    saveStoredPagos(updated);
    setPagos(updated);
    setSelectedPago(null);
    setOperationNumber("");
    setVoucherName("");
    setVoucherPreview("");
    triggerAlert("Voucher enviado. Tesorería validará el pago.");
  };

  return (
    <div className="space-y-6">
      {alertMsg && <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-black px-5 py-3 text-xs font-black text-white shadow-2xl">{alertMsg}</div>}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff2432]">Aula virtual</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">Mis Pagos</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Consulta tu cronograma, pagos vencidos y adjunta comprobantes.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-[#FDECEA] px-4 py-3">
            <p className="text-[10px] font-black uppercase text-[#E07B6A]">Vencidos</p>
            <p className="text-xl font-black text-[#E07B6A]">{vencidos.length}</p>
          </div>
          <div className="rounded-2xl bg-[#FEF6E8] px-4 py-3">
            <p className="text-[10px] font-black uppercase text-[#F5A623]">Pendientes</p>
            <p className="text-xl font-black text-[#F5A623]">{pendientes.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="premium-card overflow-hidden">
          <div className="border-b border-gray-150 p-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Cronograma de pagos</h2>
            <p className="mt-1 text-xs font-semibold text-gray-400">{student ? `${student.nombre} ${student.apellido}` : "Alumno"}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="p-4">Concepto</th>
                  <th className="p-4">Vencimiento</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Monto</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentPayments.map((pago) => (
                  <tr key={pago.id}>
                    <td className="p-4 font-black text-gray-950">{pago.concepto}</td>
                    <td className="p-4 font-bold text-gray-500">{pago.vencimiento || "—"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${pago.estado === "pagado" ? "bg-[#EAF5EF] text-[#5BAD8A]" : pago.estado === "vencido" ? "bg-[#FDECEA] text-[#E07B6A]" : "bg-[#FEF6E8] text-[#F5A623]"}`}>
                        {pago.estado === "pagado" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {pago.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-gray-950">S/. {pago.monto.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      {pago.estado !== "pagado" ? (
                        <button onClick={() => setSelectedPago(pago)} className="rounded-lg bg-black px-3 py-1.5 text-[10px] font-black text-white">Adjuntar voucher</button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">Validado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="premium-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff2432]">Canal rápido</p>
                <h2 className="mt-1 text-lg font-black text-gray-950">Paga por QR o transferencia</h2>
              </div>
              <CreditCard className="h-5 w-5 text-[#ff2432]" />
            </div>
            <div className="mt-4 flex justify-center">
              <StaticQr label="QR institucional" imageDataUrl={paymentConfig.qrDataUrl} />
            </div>
          </div>
          <PaymentAccountsPanel accounts={paymentConfig.accounts} updatedAt={paymentConfig.updatedAt} compact title="Cuentas de pago" subtitle="Transfiere y adjunta el voucher. El pago queda en revisión hasta validación." />
        </aside>
      </div>

      {selectedPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff2432]">Subir comprobante</p>
            <h2 className="mt-2 text-xl font-black">{selectedPago.concepto}</h2>
            <p className="mt-1 text-sm font-black text-[#5BAD8A]">S/. {selectedPago.monto.toFixed(2)}</p>
            <div className="mt-5 space-y-4">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500">N° operación<input value={operationNumber} onChange={(e) => setOperationNumber(e.target.value)} placeholder="Ej. BCP-1928372" className="mt-2 w-full rounded-xl border border-gray-250 px-4 py-3 text-sm font-bold normal-case tracking-normal text-gray-900 outline-none focus:border-black" /></label>
              <label className="block cursor-pointer rounded-2xl border border-dashed border-gray-250 bg-gray-50 p-5 text-center hover:border-[#ff2432]">
                <input type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" className="hidden" onChange={(e) => handleVoucherUpload(e.target.files?.[0])} />
                <UploadCloud className="mx-auto h-6 w-6 text-[#ff2432]" />
                <span className="mt-2 block text-xs font-black text-gray-950">{voucherName || "Adjuntar voucher"}</span>
              </label>
              {voucherPreview && voucherPreview.startsWith("data:image") && <img src={voucherPreview} alt="Voucher" className="max-h-40 w-full rounded-xl border border-gray-150 object-contain" />}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelectedPago(null)} className="rounded-xl border border-gray-250 px-4 py-2 text-xs font-black text-gray-600">Cancelar</button>
              <button onClick={submitVoucher} className="rounded-xl bg-black px-4 py-2 text-xs font-black text-white">Enviar a revisión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
