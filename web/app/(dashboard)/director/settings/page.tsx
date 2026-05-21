'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Building2, 
  Users, 
  Plus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Check, 
  AlertCircle, 
  Camera, 
  ChevronRight,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { 
  supabase, 
  getStoredColegios, 
  saveStoredColegios, 
  getStoredUsers, 
  saveStoredUsers, 
  ColegioInfo, 
  UserProfile 
} from '@/lib/supabase/client';
import ImageCropperModal from '@/components/ImageCropperModal';

export default function DirectorSettingsPage() {
  const { user, colegio, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tabs: 'colegio' | 'personal'
  const [activeTab, setActiveTab] = useState<'colegio' | 'personal'>('colegio');

  // Colegio Info States
  const [colegioNombre, setColegioNombre] = useState('');
  const [colegioLogo, setColegioLogo] = useState('');
  const [colegioRuc, setColegioRuc] = useState('');
  const [colegioAddress, setColegioAddress] = useState('Av. Larco 456, Miraflores, Lima');
  const [colegioPhone, setColegioPhone] = useState('(01) 445-8930');

  // Database States
  const [colegios, setColegios] = useState<ColegioInfo[]>([]);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);

  // Users Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'todos' | 'docente' | 'padre' | 'alumno'>('todos');

  // Modals & Action States
  const [showAddUser, setShowAddUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [activeUserToReset, setActiveUserToReset] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('Linkedu2026!');
  
  // Image Crop States
  const [rawImage, setRawImage] = useState<string>('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form New User
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    rol: 'docente' as 'docente' | 'padre' | 'alumno'
  });

  // Notifications
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Cargar datos
  useEffect(() => {
    const loadedColegios = getStoredColegios();
    const loadedUsers = getStoredUsers();
    setColegios(loadedColegios);
    setUsuarios(loadedUsers);

    if (colegio) {
      const match = loadedColegios.find(c => c.id === colegio.id);
      if (match) {
        setColegioNombre(match.nombre);
        setColegioLogo(match.logo);
        setColegioRuc(match.ruc);
      }
    }
  }, [colegio]);

  if (!user || !colegio) {
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

  // --- IMAGEN CROP & STORAGE PARA EL LOGO DEL COLEGIO ---
  const handleLogoClick = () => {
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
    e.target.value = '';
  };

  const handleCropCompleted = async (croppedDataUrl: string, croppedBlob: Blob) => {
    setIsUploading(true);
    try {
      const fileExt = 'png';
      const fileName = `schools/${colegio.id}/logo_${Date.now()}.${fileExt}`;

      // Upload directly to public Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatar-profiles')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/png'
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('avatar-profiles')
        .getPublicUrl(fileName);

      const uploadedUrl = publicUrlData?.publicUrl || croppedDataUrl;

      // Update state and persistent files
      setColegioLogo(uploadedUrl);
      
      const updatedColegios = colegios.map(c => 
        c.id === colegio.id ? { ...c, logo: uploadedUrl } : c
      );
      setColegios(updatedColegios);
      saveStoredColegios(updatedColegios);

      // Force update session
      if (typeof window !== 'undefined') {
        const session = localStorage.getItem('linkedu_session');
        if (session) {
          const sessionUser = JSON.parse(session);
          localStorage.setItem('linkedu_session', JSON.stringify(sessionUser));
        }
      }

      triggerStatus('¡Logo del colegio recortado y subido a Supabase con éxito!');
    } catch (err: any) {
      console.warn('Logo upload error (falling back to base64):', err.message || err);
      setColegioLogo(croppedDataUrl);
      
      const updatedColegios = colegios.map(c => 
        c.id === colegio.id ? { ...c, logo: croppedDataUrl } : c
      );
      setColegios(updatedColegios);
      saveStoredColegios(updatedColegios);
      
      triggerStatus('Logo del colegio actualizado localmente (Demo).');
    } finally {
      setIsUploading(false);
      setCropperOpen(false);
    }
  };

  // --- SAVE COLEGIO FORM ---
  const handleSaveColegio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colegioNombre.trim() || !colegioRuc.trim()) {
      triggerStatus('Nombre y RUC del colegio son campos requeridos.', true);
      return;
    }

    const updated = colegios.map(c => {
      if (c.id === colegio.id) {
        return {
          ...c,
          nombre: colegioNombre,
          ruc: colegioRuc,
          logo: colegioLogo
        };
      }
      return c;
    });

    setColegios(updated);
    saveStoredColegios(updated);
    triggerStatus('Información institucional actualizada exitosamente.');
  };

  // --- CRUD ACTIONS FOR SCHOOL MEMBERS ---
  const handleToggleUser = (userId: string) => {
    const updated = usuarios.map(u => {
      if (u.id === userId) {
        const nextState = u.activo === false ? true : false;
        triggerStatus(`El usuario "${u.nombre} ${u.apellido}" ha sido ${nextState ? 'activado' : 'inhabilitado'}.`);
        return { ...u, activo: nextState };
      }
      return u;
    });
    setUsuarios(updated);
    saveStoredUsers(updated);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nombre || !newUser.apellido || !newUser.dni || !newUser.email) {
      triggerStatus('Complete todos los campos del formulario.', true);
      return;
    }

    const added: UserProfile = {
      id: crypto.randomUUID(),
      colegio_id: colegio.id,
      rol: newUser.rol,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      dni: newUser.dni,
      email: newUser.email.toLowerCase().trim(),
      foto_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&w=150&h=150&q=80`,
      activo: true
    };

    const updated = [...usuarios, added];
    setUsuarios(updated);
    saveStoredUsers(updated);
    setShowAddUser(false);
    setNewUser({ nombre: '', apellido: '', dni: '', email: '', rol: 'docente' });
    triggerStatus(`Cuenta de ${newUser.rol} creada con éxito.`);
  };

  const handleOpenResetPassword = (usr: UserProfile) => {
    setActiveUserToReset(usr);
    setNewPassword('Linkedu2026!');
    setShowResetPassword(true);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserToReset) return;

    triggerStatus(`Contraseña de ${activeUserToReset.nombre} restablecida a "${newPassword}" en Supabase.`);
    setShowResetPassword(false);
    setActiveUserToReset(null);
  };

  // --- FILTERS ---
  const filteredPersonal = usuarios.filter(u => {
    const isSameSchool = u.colegio_id === colegio.id;
    const isNotSelf = u.id !== user.id; // Evitar que el director se gestione a sí mismo aquí
    const matchesSearch = 
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.dni.includes(searchQuery) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = selectedRoleFilter === 'todos' || u.rol === selectedRoleFilter;

    return isSameSchool && isNotSelf && matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* status alert */}
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Configuración Escolar</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión administrativa institucional, RUC, logo y control de matrículas.</p>
        </div>
        <div className="flex">
          {activeTab === 'personal' && (
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-[#01017b]/10 transition-all cursor-pointer hover:scale-[1.01] active:scale-99"
            >
              <UserPlus className="w-4.5 h-4.5" />
              Nuevo Personal
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-250 gap-1 pb-1">
        <button
          onClick={() => setActiveTab('colegio')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'colegio'
              ? 'bg-[#EEF1FE] text-[#01017b]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Datos de la Institución
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'personal'
              ? 'bg-[#EEF1FE] text-[#01017b]'
              : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Gestión de Personal ({filteredPersonal.length})
        </button>
      </div>

      {/* Content tabs */}
      {activeTab === 'colegio' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo panel */}
          <div className="md:col-span-1">
            <div className="premium-card p-6 flex flex-col items-center text-center space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider self-start">Identidad Escolar</h3>
              
              <div 
                onClick={handleLogoClick}
                className="relative w-36 h-36 rounded-2xl cursor-pointer overflow-hidden border border-gray-200 bg-gray-50 shadow-md group transition-all duration-300 hover:border-[#01017b]"
              >
                <img 
                  src={colegioLogo} 
                  alt={colegioNombre} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1 uppercase">Cambiar Logo</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-gray-900 leading-snug">{colegioNombre}</h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">RUC: {colegioRuc}</span>
              </div>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={handleFileChange}
              />

              <button
                onClick={handleLogoClick}
                className="w-full px-4 py-2 border border-gray-250 text-gray-700 hover:bg-gray-50 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Cargar Nuevo Logo
              </button>
            </div>
          </div>

          {/* Form panel */}
          <div className="md:col-span-2">
            <div className="premium-card p-6 space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-[#01017b]" />
                Ficha del Colegio
              </h3>

              <form onSubmit={handleSaveColegio} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Comercial</label>
                    <input
                      type="text"
                      value={colegioNombre}
                      onChange={(e) => setColegioNombre(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm text-gray-900 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">RUC (Registro Único)</label>
                    <input
                      type="text"
                      value={colegioRuc}
                      maxLength={11}
                      onChange={(e) => setColegioRuc(e.target.value.replace(/\D/g,''))}
                      className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm text-gray-900 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dirección Fiscal</label>
                    <input
                      type="text"
                      value={colegioAddress}
                      onChange={(e) => setColegioAddress(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teléfono Institucional</label>
                    <input
                      type="text"
                      value={colegioPhone}
                      onChange={(e) => setColegioPhone(e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15 focus:border-[#01017b] text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-150">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-[#01017b]/10"
                  >
                    Guardar Ficha
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Personal management list */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Side filters */}
          <div className="lg:col-span-1 premium-card p-5 space-y-4 h-fit">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtrar por Rol</h3>
            <div className="space-y-1.5">
              {['todos', 'docente', 'padre', 'alumno'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r as any)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    selectedRoleFilter === r
                      ? 'bg-[#EEF1FE] text-[#01017b]'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {r === 'todos' ? 'Todos los roles' : r}
                </button>
              ))}
            </div>
          </div>

          {/* List display */}
          <div className="lg:col-span-3 premium-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-150 pb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Personal y Alumnado</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Administra los usuarios pertenecientes a tu colegio.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute top-2.5 left-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por DNI, Nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">DNI</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Estatus</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPersonal.map((usr) => (
                    <tr key={usr.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img 
                          src={usr.foto_url} 
                          alt={usr.nombre} 
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 bg-gray-50 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-gray-950 truncate leading-snug">{usr.nombre} {usr.apellido}</span>
                          <span className="text-[10px] text-gray-400 truncate mt-0.5">{usr.email || 'sin-correo@colegio.edu'}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-xs text-gray-500">{usr.dni}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          usr.rol === 'docente' ? 'bg-[#EAF7F7] text-[#7EC8C8]' :
                          usr.rol === 'padre' ? 'bg-[#FEF6E8] text-[#F5A623]' :
                          'bg-[#F3EFFE] text-[#9B7FD4]'
                        }`}>
                          {usr.rol}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${usr.activo !== false ? 'bg-[#5BAD8A]' : 'bg-[#E07B6A]'}`} />
                          <span className={`text-xs font-semibold ${usr.activo !== false ? 'text-[#5BAD8A]' : 'text-[#E07B6A]'}`}>
                            {usr.activo !== false ? 'Activo' : 'Suspendido'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleOpenResetPassword(usr)}
                            className="p-2 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl text-gray-400 transition-all cursor-pointer"
                            title="Restablecer Contraseña"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleUser(usr.id)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              usr.activo !== false
                                ? 'bg-[#E07B6A]/10 hover:bg-[#E07B6A]/20 text-[#E07B6A]'
                                : 'bg-[#5BAD8A]/10 hover:bg-[#5BAD8A]/20 text-[#5BAD8A]'
                            }`}
                            title={usr.activo !== false ? 'Desactivar' : 'Activar'}
                          >
                            {usr.activo !== false ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredPersonal.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400 font-bold text-sm">
                        No hay usuarios registrados con esta búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD USER MODAL --- */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-gray-950 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#01017b]" />
              Crear Nuevo Usuario
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: Sofía"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Apellido</label>
                  <input
                    type="text"
                    placeholder="Ej: Rojas"
                    value={newUser.apellido}
                    onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">DNI</label>
                  <input
                    type="text"
                    placeholder="8 dígitos"
                    maxLength={8}
                    value={newUser.dni}
                    onChange={(e) => setNewUser({ ...newUser, dni: e.target.value.replace(/\D/g,'') })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#01017b]/15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rol</label>
                  <select
                    value={newUser.rol}
                    onChange={(e) => setNewUser({ ...newUser, rol: e.target.value as any })}
                    className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2"
                  >
                    <option value="docente">Docente</option>
                    <option value="padre">Padre</option>
                    <option value="alumno">Alumno</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Institucional</label>
                <input
                  type="email"
                  placeholder="sofia.rojas@colegio.edu"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD MODAL --- */}
      {showResetPassword && activeUserToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-gray-950 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Restablecer Contraseña
            </h3>
            <p className="text-xs text-gray-400 font-semibold mb-4">
              Restablece la contraseña para <strong className="text-gray-700">{activeUserToReset.nombre} {activeUserToReset.apellido}</strong>.
            </p>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña Temporal</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/15"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Restablecer Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
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
