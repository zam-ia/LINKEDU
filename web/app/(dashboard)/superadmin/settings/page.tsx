"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { CheckCircle2, CloudUpload, FileImage, ImageIcon, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeader, StatusBadge, primaryButton, secondaryButton } from "@/components/doce/WorkspacePrimitives";
import { defaultBrandAssetUrls, type BrandAssetKind, type BrandAssetsConfig } from "@/lib/brand-assets";
import { supabase } from "@/lib/supabase/client";

const assetTypes: Array<{ kind: BrandAssetKind; title: string; description: string; ratio: string }> = [
  { kind: "wordmark", title: "Logo horizontal", description: "Cabeceras, navegación y documentos. Recomendado: SVG o PNG transparente.", ratio: "aspect-[3/1]" },
  { kind: "icon", title: "Icono de aplicación", description: "Favicon, menú compacto y avatar de marca. Recomendado: SVG cuadrado.", ratio: "aspect-square" },
  { kind: "hero", title: "Imagen principal", description: "Recurso visual opcional para el hero de la landing. JPG, PNG o SVG.", ratio: "aspect-video" },
];

export default function SuperAdminSettings() {
  const [assets, setAssets] = useState<BrandAssetsConfig>({});
  const [previews, setPreviews] = useState<Partial<Record<BrandAssetKind, string>>>({});
  const [files, setFiles] = useState<Partial<Record<BrandAssetKind, File>>>({});
  const [busy, setBusy] = useState<BrandAssetKind | null>(null);
  const [project, setProject] = useState("");
  const [message, setMessage] = useState("");

  const authenticatedRequest = useCallback(async (path: string, init?: RequestInit) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) throw new Error("La sesión expiró. Inicia sesión nuevamente.");
    return fetch(path, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${data.session.access_token}` } });
  }, []);

  const load = useCallback(async () => {
    setMessage("");
    const response = await authenticatedRequest("/api/admin/brand-assets");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo cargar la configuración.");
    setAssets(payload.assets ?? {});
    setProject(payload.project ?? "");
  }, [authenticatedRequest]);

  useEffect(() => { void load().catch((error: Error) => setMessage(error.message)); }, [load]);

  const chooseFile = (kind: BrandAssetKind, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) return setMessage("Formato no admitido. Usa JPG, PNG o SVG.");
    if (file.size > 8 * 1024 * 1024) return setMessage("El archivo supera 8 MB.");
    if (previews[kind]?.startsWith("blob:")) URL.revokeObjectURL(previews[kind]!);
    setFiles((current) => ({ ...current, [kind]: file }));
    setPreviews((current) => ({ ...current, [kind]: URL.createObjectURL(file) }));
    setMessage("");
  };

  const upload = async (kind: BrandAssetKind) => {
    const file = files[kind];
    if (!file) return;
    setBusy(kind);
    setMessage("");
    try {
      const form = new FormData();
      form.append("kind", kind);
      form.append("file", file);
      const response = await authenticatedRequest("/api/admin/brand-assets", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo subir el archivo.");
      setAssets(payload.assets);
      setFiles((current) => ({ ...current, [kind]: undefined }));
      setPreviews((current) => ({ ...current, [kind]: undefined }));
      setMessage("Recurso actualizado y publicado correctamente.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error inesperado."); }
    finally { setBusy(null); }
  };

  const remove = async (kind: BrandAssetKind) => {
    setBusy(kind);
    try {
      const response = await authenticatedRequest(`/api/admin/brand-assets?kind=${kind}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo restaurar el recurso.");
      setAssets(payload.assets);
      setMessage("Se restauró el recurso predeterminado de Doce.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error inesperado."); }
    finally { setBusy(null); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader eyebrow="Configuración global" title="Marca y recursos de la página" description="Sube recursos JPG, PNG o SVG, revisa su vista previa y publícalos en Supabase Storage sin exponer credenciales del servidor." action={<button onClick={() => void load()} className={secondaryButton}><RefreshCw className="h-4 w-4" /> Actualizar</button>} />

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-black/[.07] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="text-sm font-medium">Supabase conectado</h2><p className="mt-1 text-xs font-normal text-black/40">{project || "Validando proyecto…"} · bucket privado de escritura y lectura pública de marca</p></div></div></div>
        <div className="flex items-center rounded-2xl border border-black/[.07] bg-white px-5 py-4"><StatusBadge tone="success">JPG · PNG · SVG</StatusBadge></div>
      </div>

      {message && <div role="status" className={`rounded-2xl px-5 py-4 text-sm font-medium ${message.includes("correctamente") || message.includes("restauró") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{message}</div>}

      <div className="grid gap-5 lg:grid-cols-3">
        {assetTypes.map((assetType) => {
          const currentUrl = previews[assetType.kind] || assets[assetType.kind]?.url || defaultBrandAssetUrls[assetType.kind];
          const selected = files[assetType.kind];
          return <article key={assetType.kind} className="overflow-hidden rounded-[22px] border border-black/[.07] bg-white shadow-sm">
            <div className={`m-4 flex ${assetType.ratio} items-center justify-center overflow-hidden rounded-2xl border border-black/[.06] bg-[#f5f5f7] p-5`}>
              {currentUrl ? <img src={currentUrl} alt={`Vista previa de ${assetType.title}`} className="h-full w-full object-contain" /> : <ImageIcon className="h-10 w-10 text-black/20" />}
            </div>
            <div className="p-5 pt-1"><div className="flex items-start justify-between gap-3"><div><h2 className="text-[17px] font-medium">{assetType.title}</h2><p className="mt-2 text-xs font-normal leading-5 text-black/45">{assetType.description}</p></div>{assets[assetType.kind] && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}</div>
              <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 bg-[#f5f5f7] px-4 py-3 text-xs font-medium transition hover:border-[#ff2432]/40 hover:bg-[#fff0f1]"><FileImage className="h-4 w-4 text-[#ff2432]" /> Seleccionar archivo<input type="file" accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml" onChange={(event) => chooseFile(assetType.kind, event)} className="sr-only" /></label>
              {selected && <p className="mt-2 truncate text-[10px] font-normal text-black/35">{selected.name} · {(selected.size / 1024).toFixed(0)} KB</p>}
              <div className="mt-4 flex gap-2"><button disabled={!selected || busy === assetType.kind} onClick={() => void upload(assetType.kind)} className={`${primaryButton} flex-1 disabled:cursor-not-allowed disabled:opacity-35`}><CloudUpload className="h-4 w-4" /> {busy === assetType.kind ? "Publicando…" : "Publicar"}</button>{assets[assetType.kind] && <button title="Restaurar recurso original" disabled={busy === assetType.kind} onClick={() => void remove(assetType.kind)} className="rounded-xl border border-black/10 p-3 text-black/40 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</div>
            </div>
          </article>;
        })}
      </div>
      <div className="rounded-[22px] bg-[#1d1d1f] p-6 text-white"><p className="text-[11px] font-medium uppercase tracking-[.12em] text-white/40">Seguridad de archivos</p><p className="mt-3 max-w-3xl text-sm font-normal leading-6 text-white/60">Los SVG con scripts, eventos embebidos, URLs JavaScript o `foreignObject` son rechazados. El límite es 8 MB por archivo y las escrituras requieren una sesión Super Admin válida.</p></div>
    </div>
  );
}
