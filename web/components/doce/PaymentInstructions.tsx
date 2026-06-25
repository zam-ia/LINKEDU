"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Banknote, Building2, Copy, Edit3, Plus, QrCode, Save, Smartphone, Trash2, UploadCloud, X } from "lucide-react";

export type PaymentAccount = {
  code: string;
  bank: string;
  type: "bank" | "wallet";
  holder: string;
  account: string;
  cci?: string;
  note: string;
};

export type PaymentConfig = {
  accounts: PaymentAccount[];
  qrDataUrl?: string;
  updatedAt?: string;
};

export const INSTITUTION_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    code: "BCP",
    bank: "BCP",
    type: "bank",
    holder: "Cuenta recaudadora de la institución",
    account: "191-0000000-0-00",
    cci: "002-191-000000000000-00",
    note: "Pensiones, matrícula y cuotas escolares.",
  },
  {
    code: "BBVA",
    bank: "BBVA",
    type: "bank",
    holder: "Cuenta recaudadora de la institución",
    account: "0011-0000-01-00000000",
    cci: "011-000-000100000000-00",
    note: "Transferencias bancarias y depósitos.",
  },
  {
    code: "YAPE",
    bank: "Yape / Plin",
    type: "wallet",
    holder: "Tesorería institucional",
    account: "987 088 359",
    note: "Pagos rápidos con captura del comprobante.",
  },
];

export const PLATFORM_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    code: "DOCE-BCP",
    bank: "BCP Empresa",
    type: "bank",
    holder: "Doce Plataforma Educativa",
    account: "193-0000000-0-00",
    cci: "002-193-000000000000-00",
    note: "Suscripción SaaS mensual de colegios clientes.",
  },
  {
    code: "DOCE-BBVA",
    bank: "BBVA Empresa",
    type: "bank",
    holder: "Doce Plataforma Educativa",
    account: "0011-0000-02-00000000",
    cci: "011-000-000200000000-00",
    note: "Planes, upgrades, implementación y soporte.",
  },
  {
    code: "DOCE-YAPE",
    bank: "Yape Empresas",
    type: "wallet",
    holder: "Doce",
    account: "987 088 359",
    note: "Pagos menores, adelantos y regularizaciones.",
  },
];

const QR_CELLS = [
  1, 1, 1, 0, 1, 0, 1, 0,
  1, 0, 1, 1, 0, 1, 1, 1,
  1, 1, 1, 0, 1, 0, 0, 1,
  0, 1, 0, 1, 1, 1, 0, 0,
  1, 0, 1, 1, 0, 0, 1, 1,
  0, 1, 1, 0, 1, 1, 0, 1,
  1, 1, 0, 1, 0, 1, 1, 0,
  1, 0, 1, 0, 1, 0, 1, 1,
];

export const getStoredPaymentConfig = (storageKey: string, fallbackAccounts: PaymentAccount[]): PaymentConfig => {
  if (typeof window === "undefined") return { accounts: fallbackAccounts };
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as PaymentConfig;
      return {
        accounts: Array.isArray(parsed.accounts) && parsed.accounts.length > 0 ? parsed.accounts : fallbackAccounts,
        qrDataUrl: parsed.qrDataUrl,
        updatedAt: parsed.updatedAt,
      };
    } catch {
      // Si el storage se corrompe, volvemos a la configuración base.
    }
  }
  const initial = { accounts: fallbackAccounts };
  localStorage.setItem(storageKey, JSON.stringify(initial));
  return initial;
};

export const saveStoredPaymentConfig = (storageKey: string, config: PaymentConfig) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify({ ...config, updatedAt: new Date().toISOString() }));
};

export function StaticQr({ label = "QR estático", imageDataUrl }: { label?: string; imageDataUrl?: string }) {
  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-3 shadow-sm">
      {imageDataUrl ? (
        <img src={imageDataUrl} alt={label} className="h-32 w-32 rounded-2xl object-contain" />
      ) : (
        <div className="grid h-32 w-32 grid-cols-8 gap-1 rounded-2xl bg-white p-2">
          {QR_CELLS.map((cell, index) => (
            <span
              key={index}
              className={`rounded-[3px] ${cell ? "bg-black" : "bg-black/[.04]"}`}
            />
          ))}
        </div>
      )}
      <p className="mt-2 text-center text-[9px] font-black uppercase tracking-[.16em] text-black/35">{label}</p>
    </div>
  );
}

export function PaymentAccountsPanel({
  accounts,
  title = "Canales de pago",
  subtitle = "Selecciona banco o billetera, transfiere y adjunta el voucher para validación.",
  compact = false,
  updatedAt,
}: {
  accounts: PaymentAccount[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
  updatedAt?: string;
}) {
  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard puede fallar en iframes o HTTP local; no bloquea el flujo.
    }
  };

  return (
    <div className={`rounded-2xl border border-black/10 bg-white ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff2432]">{title}</p>
          <p className="mt-1 text-[11px] font-semibold leading-5 text-black/45">{subtitle}</p>
          {updatedAt && <p className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-black/25">Actualizado: {new Date(updatedAt).toLocaleDateString("es-PE")}</p>}
        </div>
        <QrCode className="h-5 w-5 shrink-0 text-[#ff2432]" />
      </div>

      <div className="mt-4 grid gap-2">
        {accounts.map((item) => (
          <div key={item.code} className="rounded-2xl border border-black/[.06] bg-[#f8f8f6] p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                {item.type === "wallet" ? <Smartphone className="h-4 w-4 text-[#ff2432]" /> : <Building2 className="h-4 w-4 text-[#ff2432]" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black text-black">{item.bank}</p>
                  <button
                    type="button"
                    onClick={() => copyValue(item.account)}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[.12em] text-black/50 hover:text-black"
                  >
                    <Copy className="h-3 w-3" /> Copiar
                  </button>
                </div>
                <p className="mt-1 text-[11px] font-bold text-black/70">{item.account}</p>
                {item.cci && <p className="text-[10px] font-semibold text-black/40">CCI: {item.cci}</p>}
                <p className="mt-1 text-[10px] font-medium leading-4 text-black/40">{item.holder} · {item.note}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#fff1f2] px-3 py-2 text-[10px] font-bold leading-4 text-[#b4232d]">
        <Banknote className="h-4 w-4 shrink-0" />
        El pago queda en revisión hasta que tesorería valide operación, monto, fecha y voucher.
      </div>
    </div>
  );
}

export function PaymentConfigEditor({
  storageKey,
  fallbackAccounts,
  title = "Editar canales de pago",
  description = "Actualiza cuentas bancarias, billeteras y QR. Estos datos se usarán en los portales de pago.",
  onSaved,
}: {
  storageKey: string;
  fallbackAccounts: PaymentAccount[];
  title?: string;
  description?: string;
  onSaved?: (config: PaymentConfig) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accounts, setAccounts] = useState<PaymentAccount[]>(fallbackAccounts);
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const config = getStoredPaymentConfig(storageKey, fallbackAccounts);
    setAccounts(config.accounts);
    setQrDataUrl(config.qrDataUrl);
  }, [storageKey, fallbackAccounts]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const updateAccount = (index: number, field: keyof PaymentAccount, value: string) => {
    setAccounts((current) => current.map((account, idx) => idx === index ? { ...account, [field]: value } : account));
  };

  const addAccount = () => {
    setAccounts((current) => [
      ...current,
      {
        code: `CANAL-${current.length + 1}`,
        bank: "Nuevo canal",
        type: "bank",
        holder: "Titular de la cuenta",
        account: "",
        cci: "",
        note: "Uso de este canal de pago.",
      },
    ]);
  };

  const removeAccount = (index: number) => {
    setAccounts((current) => current.filter((_, idx) => idx !== index));
  };

  const handleQrUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Sube el QR en formato de imagen JPG, PNG o SVG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("El QR supera los 5MB permitidos.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setQrDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const save = () => {
    const cleaned = accounts
      .map((account) => ({
        ...account,
        code: account.code.trim() || account.bank.trim() || crypto.randomUUID(),
        bank: account.bank.trim() || "Canal de pago",
        holder: account.holder.trim() || "Titular no definido",
        account: account.account.trim(),
        cci: account.cci?.trim(),
        note: account.note.trim() || "Canal disponible para transferencias.",
      }))
      .filter((account) => account.account.length > 0);

    const config = { accounts: cleaned.length > 0 ? cleaned : fallbackAccounts, qrDataUrl, updatedAt: new Date().toISOString() };
    saveStoredPaymentConfig(storageKey, config);
    onSaved?.(config);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-[11px] font-black text-black shadow-sm transition hover:bg-black hover:text-white"
      >
        <Edit3 className="h-3.5 w-3.5" /> Editar cuentas / QR
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/[.07] p-6 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff2432]">Configuración financiera</p>
                <h2 className="mt-1 text-2xl font-black text-black">{title}</h2>
                <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-black/45">{description}</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 text-black/40 hover:bg-black/5 hover:text-black"><X className="h-5 w-5" /></button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-3">
                {accounts.map((account, index) => (
                  <div key={`${account.code}-${index}`} className="rounded-2xl border border-black/[.07] bg-[#f8f8f6] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-black/35">Canal #{index + 1}</p>
                      <button onClick={() => removeAccount(index)} className="rounded-lg p-2 text-black/35 hover:bg-[#FDECEA] hover:text-[#E07B6A]"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Banco / billetera<input value={account.bank} onChange={(e) => updateAccount(index, "bank", e.target.value)} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-black outline-none focus:border-black" /></label>
                      <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Tipo<select value={account.type} onChange={(e) => updateAccount(index, "type", e.target.value as PaymentAccount["type"])} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-black outline-none focus:border-black"><option value="bank">Banco</option><option value="wallet">Billetera</option></select></label>
                      <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Titular<input value={account.holder} onChange={(e) => updateAccount(index, "holder", e.target.value)} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-black outline-none focus:border-black" /></label>
                      <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Cuenta / teléfono<input value={account.account} onChange={(e) => updateAccount(index, "account", e.target.value)} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-black outline-none focus:border-black" /></label>
                      <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">CCI<input value={account.cci || ""} onChange={(e) => updateAccount(index, "cci", e.target.value)} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-black outline-none focus:border-black" /></label>
                      <label className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Nota<input value={account.note} onChange={(e) => updateAccount(index, "note", e.target.value)} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-black outline-none focus:border-black" /></label>
                    </div>
                  </div>
                ))}
                <button onClick={addAccount} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/20 py-3 text-xs font-black text-black/50 hover:border-black hover:text-black"><Plus className="h-4 w-4" /> Agregar canal</button>
                </div>

                <div className="space-y-3">
                <StaticQr label="QR configurado" imageDataUrl={qrDataUrl} />
                <label className="block cursor-pointer rounded-2xl border border-dashed border-black/20 bg-[#f8f8f6] p-4 text-center hover:border-[#ff2432]">
                  <input type="file" accept="image/jpeg,image/png,image/jpg,image/svg+xml" className="hidden" onChange={(e) => handleQrUpload(e.target.files?.[0])} />
                  <UploadCloud className="mx-auto h-5 w-5 text-[#ff2432]" />
                  <span className="mt-2 block text-[11px] font-black text-black">Subir QR propio</span>
                  <span className="mt-1 block text-[9px] font-semibold text-black/35">JPG, PNG o SVG. Máx. 5MB.</span>
                </label>
                {qrDataUrl && <button onClick={() => setQrDataUrl(undefined)} className="w-full rounded-xl bg-[#FDECEA] py-2 text-[10px] font-black text-[#E07B6A]">Quitar QR</button>}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-black/[.07] bg-white p-4">
              <button onClick={() => setOpen(false)} className="rounded-xl border border-black/10 px-4 py-2 text-xs font-black text-black/60">Cancelar</button>
              <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-black text-white"><Save className="h-4 w-4" /> Guardar configuración</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
