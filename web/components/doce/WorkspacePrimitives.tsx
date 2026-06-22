import { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff2432]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-black sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-black/45">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-black/[.07] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between"><p className="text-[10px] font-black uppercase tracking-[.14em] text-black/35">{label}</p><span className="text-[#ff2432]">{icon}</span></div>
      <p className="mt-5 text-3xl font-black tracking-[-.04em] text-black">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-black/40">{detail}</p>
    </div>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "warning" | "danger" | "neutral" | "accent" }) {
  const classes = { success: "bg-emerald-50 text-emerald-700", warning: "bg-amber-50 text-amber-700", danger: "bg-red-50 text-red-700", neutral: "bg-black/5 text-black/50", accent: "bg-[#fff0f1] text-[#d80d1b]" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] ${classes[tone]}`}>{children}</span>;
}

export const primaryButton = "inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-bold text-white transition hover:bg-[#ff2432]";
export const secondaryButton = "inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-bold text-black transition hover:bg-black/[.03]";
