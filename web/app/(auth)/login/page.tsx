"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/doce/BrandMark";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace(`/${user.rol}`);
  }, [router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    const result = await login(email, password);
    if (!result.ok) {
      const messages = {
        invalid_credentials: "El correo o la contraseña no coinciden.",
        email_unconfirmed: "El correo todavía no está confirmado en Supabase.",
        inactive: "La cuenta está inactiva. Contacta al administrador.",
        profile_unavailable: "La cuenta existe, pero su perfil o permisos aún no están configurados.",
        configuration: "No pudimos conectar con Supabase. Revisa la URL y las variables del despliegue.",
      };
      setError(messages[result.reason]);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f5f7] px-5 py-12 text-[#1d1d1f]">
      <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#ff2432]/10 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-black/[.06] bg-white shadow-[0_20px_60px_rgba(0,0,0,.12)] lg:grid-cols-[.9fr_1.1fr]">
        <section className="hidden bg-[#1d1d1f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <BrandMark className="brightness-0 invert" priority />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[.14em] text-[#ff5965]">Sistema operativo educativo</p>
            <h1 className="mt-5 text-5xl font-normal leading-[1.02] tracking-[-.045em]">Tu institución, conectada.</h1>
            <p className="mt-5 max-w-sm text-[15px] font-normal leading-6 text-white/55">Gestión, aprendizaje, credenciales y documentos verificables desde un solo espacio seguro.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/45"><ShieldCheck className="h-4 w-4 text-[#ff2432]" /> Acceso protegido por Supabase Auth</div>
        </section>

        <section className="p-7 sm:p-12 lg:p-16">
          <div className="lg:hidden"><BrandMark priority /></div>
          <div className="mt-10 lg:mt-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#fff0f1] text-[#ff2432]"><LockKeyhole className="h-5 w-5" /></div>
            <h2 className="mt-7 text-[34px] font-normal tracking-[-.04em]">Iniciar sesión</h2>
            <p className="mt-2 text-[15px] font-normal text-[#6e6e73]">Accede con las credenciales asignadas por tu institución.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <label className="block text-xs font-medium text-[#6e6e73]">Correo institucional<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 text-[15px] font-normal outline-none transition focus:border-[#ff2432] focus:shadow-[0_0_0_3px_rgba(255,36,50,.12)]" placeholder="nombre@institucion.edu.pe" /></label>
            <label className="block text-xs font-medium text-[#6e6e73]">Contraseña<div className="relative mt-2"><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="current-password" className="w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 pr-12 text-[15px] font-normal outline-none transition focus:border-[#ff2432] focus:shadow-[0_0_0_3px_rgba(255,36,50,.12)]" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/35 transition hover:bg-black/5 hover:text-black" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-3.5 text-sm font-medium text-white transition duration-200 ease-out hover:bg-black active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Validando…" : "Ingresar a Doce"}<ArrowRight className="h-4 w-4" /></button>
          </form>
          <p className="mt-8 text-center text-[11px] font-normal leading-5 text-black/35">¿Problemas para ingresar? Contacta al administrador de tu institución.</p>
        </section>
      </div>
    </main>
  );
}
