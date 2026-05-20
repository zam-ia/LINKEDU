'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••'); // Valor fijo simulado
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    const success = await login(email);
    if (success) {
      router.push('/');
    } else {
      setError('Credenciales inválidas. Usa uno de los correos demo listados abajo.');
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setError('');
    const success = await login(demoEmail);
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F8F9FB] px-6 py-12 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo con gradientes suaves */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#4F6AF0] opacity-5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#7EC8C8] opacity-5 blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F6AF0] text-white shadow-md shadow-[#4F6AF0]/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            Link<span className="text-[#4F6AF0]">edu</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
          Iniciar sesión en tu intranet
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Introduce tus credenciales institucionales para acceder.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[460px] z-10">
        <div className="bg-white py-10 px-8 shadow-sm border border-gray-200/80 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex gap-3 text-sm text-red-600">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@colegio.edu.pe"
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6AF0]/15 focus:border-[#4F6AF0] sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-[#4F6AF0] hover:text-[#4F6AF0]/80 transition-colors">
                    ¿La olvidaste?
                  </a>
                </div>
              </div>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  disabled
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-3 py-2.5 text-gray-400 focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-[#4F6AF0] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#4f6af0]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F6AF0] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Ingresar a la Plataforma
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Selector de Perfiles Demo Interactivo */}
          <div className="mt-8 pt-8 border-t border-gray-150">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-4">
              Acceso Rápido (Perfiles Demo)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin('director@linkedu.com')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-xl hover:bg-[#EEF1FE] hover:border-[#4F6AF0]/30 transition-all text-left group cursor-pointer"
              >
                <span className="text-xs font-bold text-gray-800">Dirección</span>
                <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-[#4F6AF0] transition-colors">director@linkedu.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('docente@linkedu.com')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-xl hover:bg-[#EAF7F7] hover:border-[#7EC8C8]/30 transition-all text-left group cursor-pointer"
              >
                <span className="text-xs font-bold text-gray-800">Docente</span>
                <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-[#7EC8C8] transition-colors">docente@linkedu.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('padre@linkedu.com')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-xl hover:bg-[#FEF6E8] hover:border-[#F5A623]/30 transition-all text-left group cursor-pointer"
              >
                <span className="text-xs font-bold text-gray-800">Padre / Tutor</span>
                <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-[#F5A623] transition-colors">padre@linkedu.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('alumno@linkedu.com')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded-xl hover:bg-[#F3EFFE] hover:border-[#9B7FD4]/30 transition-all text-left group cursor-pointer"
              >
                <span className="text-xs font-bold text-gray-800">Alumno</span>
                <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-[#9B7FD4] transition-colors">alumno@linkedu.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
