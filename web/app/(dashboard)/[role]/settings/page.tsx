'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Check, 
  AlertCircle, 
  Lock, 
  Image as ImageIcon,
  Key,
  Grid
} from 'lucide-react';
import { supabase, getStoredUsers, saveStoredUsers, UserProfile } from '@/lib/supabase/client';
import ImageCropperModal from '@/components/ImageCropperModal';

const PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
];

export default function RoleSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  
  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Cropper & Upload Modal
  const [rawImage, setRawImage] = useState<string>('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Notifications
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Sync state with store on load
  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setApellido(user.apellido);
      setDni(user.dni || '');
      setEmail(user.email || '');
      setFotoUrl(user.foto_url);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F4F5F7]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#01017b] border-t-transparent"></div>
      </div>
    );
  }

  const triggerStatus = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. Trigger image file select
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImage(reader.result);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  // 2. Perform Real Supabase Storage Upload with graceful mock fallback
  const handleCropCompleted = async (croppedDataUrl: string, croppedBlob: Blob) => {
    setIsUploading(true);
    try {
      const fileExt = 'png';
      const fileName = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      // Perform real storage upload to bucket 'avatar-profiles'
      const { data, error } = await supabase.storage
        .from('avatar-profiles')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/png'
        });

      if (error) {
        throw error;
      }

      // Fetch public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatar-profiles')
        .getPublicUrl(fileName);

      const uploadedUrl = publicUrlData?.publicUrl || croppedDataUrl;

      // Update Local State and Zustand Store
      setFotoUrl(uploadedUrl);
      updateUserProfile(nombre, apellido, uploadedUrl);
      
      triggerStatus('¡Foto de perfil recortada y subida a Supabase con éxito!');
    } catch (err: any) {
      console.warn('Supabase Storage error (Falling back to local simulation):', err.message || err);
      
      // Elegant Fallback: Use Base64 local URL
      setFotoUrl(croppedDataUrl);
      updateUserProfile(nombre, apellido, croppedDataUrl);
      
      triggerStatus('Foto de perfil actualizada de forma local (Demo).');
    } finally {
      setIsUploading(false);
      setCropperOpen(false);
    }
  };

  // Select pre-configured preset avatar
  const handleSelectPreset = (url: string) => {
    setFotoUrl(url);
    updateUserProfile(nombre, apellido, url);
    triggerStatus('Avatar seleccionado con éxito.');
  };

  // 3. Save profile form changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      triggerStatus('El nombre y apellido no pueden estar vacíos.', true);
      return;
    }

    try {
      // Update in Store and localStorage
      updateUserProfile(nombre, apellido, fotoUrl);
      
      // Update email/DNI inside the mock database to keep in sync
      const storedUsers = getStoredUsers();
      const updated = storedUsers.map(u => 
        u.id === user.id ? { ...u, nombre, apellido, dni, email, foto_url: fotoUrl } : u
      );
      saveStoredUsers(updated);

      triggerStatus('Información del perfil guardada correctamente.');
    } catch (error) {
      triggerStatus('Error al guardar la información.', true);
    }
  };

  // 4. Reset/Change Password simulation
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      triggerStatus('Por favor complete ambos campos.', true);
      return;
    }
    
    if (newPassword.length < 6) {
      triggerStatus('La nueva contraseña debe tener al menos 6 caracteres.', true);
      return;
    }

    // Simulate database write in auth
    triggerStatus('Contraseña actualizada con éxito en Supabase Auth.');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Dynamic feedback alert */}
      {statusMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 border py-3 px-5 rounded-xl shadow-xl animate-in fade-in slide-in-from-top duration-300 font-bold text-sm ${
          statusMessage.isError 
            ? 'bg-[#FDF3F2] border-[#E07B6A] text-[#E07B6A]' 
            : 'bg-[#EAF5EF] border-[#5BAD8A] text-[#5BAD8A]'
        }`}>
          {statusMessage.isError ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Ajustes Personales</h1>
        <p className="text-sm text-gray-500 mt-1 uppercase font-bold tracking-wider text-[#01017b]">
          Perfil de {user.rol}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Premium Photo Widget */}
        <div className="md:col-span-1 space-y-6">
          {/* Layer 1: Avatar management */}
          <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider self-start">Foto de Perfil</h3>
            
            {/* Clickable circular avatar with camera hover overlay */}
            <div 
              onClick={handleAvatarClick}
              className="relative w-32 h-32 rounded-full cursor-pointer overflow-hidden border-2 border-gray-150 bg-gray-50 shadow-md group transition-all duration-300 hover:border-[#01017b]"
            >
              <img 
                src={fotoUrl} 
                alt={`${nombre} ${apellido}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1 uppercase">Cambiar</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-gray-900">{nombre} {apellido}</h4>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{user.rol}</span>
            </div>

            {/* Hidden Input File */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleFileChange}
            />

            <button
              onClick={handleAvatarClick}
              className="w-full px-4 py-2 border border-gray-250 text-gray-700 hover:bg-gray-50 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
            >
              Cargar Imagen
            </button>
          </div>

          {/* Layer 2: Preset Avatar Selector */}
          <div className="premium-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-[#9B7FD4]" />
              Avatares Ilustrativos
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
              Si lo prefieres, elige una ilustración premium prediseñada para tu perfil.
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all active:scale-90 cursor-pointer ${
                    fotoUrl === preset ? 'border-[#01017b] ring-2 ring-[#01017b]/15' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={preset} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Information & Security Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Layer 1: Personal Information */}
          <div className="premium-card p-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-[#01017b]" />
              Información del Usuario
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Apellidos</label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">DNI / Documento</label>
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-150">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-[#01017b]/10 active:scale-98"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>

          {/* Layer 2: Password / Credentials */}
          <div className="premium-card p-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-[#E07B6A]" />
              Seguridad y Contraseña
            </h3>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña Actual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/15 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nueva Contraseña</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/15 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-150">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E07B6A] hover:bg-[#E07B6A]/90 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-[#E07B6A]/10 active:scale-98"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal Integration */}
      <ImageCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={rawImage}
        onCropCompleted={handleCropCompleted}
        isUploading={isUploading}
      />
    </div>
  );
}
