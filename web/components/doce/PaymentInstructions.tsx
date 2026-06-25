"use client";

import { Banknote, Building2, Copy, QrCode, Smartphone } from "lucide-react";

export type PaymentAccount = {
  code: string;
  bank: string;
  type: "bank" | "wallet";
  holder: string;
  account: string;
  cci?: string;
  note: string;
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

export function StaticQr({ label = "QR estático" }: { label?: string }) {
  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-3 shadow-sm">
      <div className="grid h-32 w-32 grid-cols-8 gap-1 rounded-2xl bg-white p-2">
        {QR_CELLS.map((cell, index) => (
          <span
            key={index}
            className={`rounded-[3px] ${cell ? "bg-black" : "bg-black/[.04]"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[9px] font-black uppercase tracking-[.16em] text-black/35">{label}</p>
    </div>
  );
}

export function PaymentAccountsPanel({
  accounts,
  title = "Canales de pago",
  subtitle = "Selecciona banco o billetera, transfiere y adjunta el voucher para validación.",
  compact = false,
}: {
  accounts: PaymentAccount[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
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
