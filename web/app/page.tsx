'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function Home() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirigir al dashboard según el rol
        router.replace(`/${user.rol}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#F4F5F7] min-h-screen">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Spinner animado premium */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#01017b] border-t-transparent"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Cargando Linkedu...</p>
      </div>
    </div>
  );
}

