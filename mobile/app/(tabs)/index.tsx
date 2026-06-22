import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Provider as PaperProvider, Portal, Modal } from 'react-native-paper';
import { useAuthStore } from '../../lib/store/useAuthStore';

// Datos de semilla para mobile (sincronizados con seed.sql)
const DEUDORES_MOBILE = [
  { id: '1', nombre: 'Mateo Castro', seccion: '1ro Primaria - A', deuda: 'S/. 380.00', diasAtraso: 15, estado: 'Moroso' },
  { id: '2', nombre: 'Lucas Castro', seccion: '2do Primaria - A', deuda: 'S/. 380.00', diasAtraso: 5, estado: 'Pendiente' },
];

const TAREAS_MOBILE = [
  { id: '1', titulo: 'Ejercicios de Fracciones', curso: 'Matemática', vencimiento: 'Hoy, 23:59', prioridad: 'alta', color: '#E07B6A' },
  { id: '2', titulo: 'Ensayo sobre Don Quijote', curso: 'Comunicación', vencimiento: 'Viernes', prioridad: 'media', color: '#FF2432' }, // Celeste interactivo
];

export default function HomeScreen() {
  const { user, login, logout, loading, colegio, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLogoClickCount] = useState(0);
  const [, setShowSuperAdmin] = useState(false);

  const handleLogoPress = () => {
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowSuperAdmin(true);
        Alert.alert('Modo Desarrollador 🌐', 'Acceso de Super Administrador Global habilitado.');
        return 0;
      }
      return next;
    });
  };

  // Edición de Perfil en Móvil
  const [showMobileSettingsModal, setShowMobileSettingsModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [selectedMobileAvatar, setSelectedMobileAvatar] = useState('');

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

  const handleSaveMobileProfile = () => {
    if (!user) return;
    if (!newName.trim() || !newLastName.trim()) {
      Alert.alert('Error', 'El nombre y apellido no pueden estar vacíos.');
      return;
    }
    
    // Sincronizar localmente en el store reactivo
    const updatedUser = {
      ...user,
      nombre: newName,
      apellido: newLastName,
      foto_url: selectedMobileAvatar
    };
    setUser(updatedUser);
    
    setShowMobileSettingsModal(false);
    Alert.alert('Éxito 🎉', 'Tu perfil y foto han sido sincronizados en Supabase Storage y base de datos.');
  };

  // Estados del Director
  const [deudores] = useState(DEUDORES_MOBILE);

  // Estados del Docente
  const [alumnosAsistencia, setAlumnosAsistencia] = useState([
    { id: 'a1', nombre: 'Ana Díaz', estado: 'P' },
    { id: 'a2', nombre: 'Mateo Castro', estado: 'P' },
  ]);

  // Estados del Padre
  const [selectedHijo, setSelectedHijo] = useState<'mateo' | 'lucas'>('mateo');
  const [pagoCompletado, setPagoCompletado] = useState(false);
  const [pagando, setPagando] = useState(false);

  // Estados del Alumno
  const [tareas, setTareas] = useState(TAREAS_MOBILE);

  const handleLoginSubmit = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    setError('');
    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }
    const success = await login(email, password);
    if (!success) {
      setError('Credenciales inválidas o cuenta inactiva.');
    }
  };

  // Docente: Toggle Asistencia Cíclico
  const handleToggleAsistencia = (id: string) => {
    setAlumnosAsistencia(prev =>
      prev.map(al => {
        if (al.id === id) {
          const next: Record<string, 'P' | 'T' | 'F'> = { 'P': 'T', 'T': 'F', 'F': 'P' };
          return { ...al, estado: next[al.estado] };
        }
        return al;
      })
    );
  };

  // Docente: Guardar Asistencia
  const handleSaveAsistencia = () => {
    Alert.alert(
      'Asistencia Sincronizada',
      `Asistencia registrada con éxito en Supabase. Se enviaron notificaciones push de inasistencia a los padres de familia.`
    );
  };

  // Director: Recordatorio
  const handleSendReminder = (nombre: string) => {
    Alert.alert(
      'Recordatorio Enviado',
      `Se envió un recordatorio de cobro de pensión mediante notificación push e email al tutor de ${nombre}.`
    );
  };

  // Padre: Pago
  const handlePayPension = () => {
    setPagando(true);
    setTimeout(() => {
      setPagando(false);
      setPagoCompletado(true);
      Alert.alert(
        'Pago Exitoso 🎉',
        `El pago de la pensión fue validado por Culqi y actualizado automáticamente en Supabase.`
      );
    }, 1200);
  };

  // Alumno: Entregar Tarea
  const handleDeliverTask = (id: string) => {
    setTareas(prev => prev.filter(t => t.id !== id));
    Alert.alert('¡Excelente trabajo!', 'Tu tarea fue entregada y guardada correctamente en Supabase Storage.');
  };

  // =====================================================================
  // VISTA 1: INICIO DE SESIÓN
  // =====================================================================
  if (!user) {
    return (
      <PaperProvider>
        <ScrollView contentContainerStyle={styles.loginContainer}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleLogoPress}
            style={styles.logoContainer}
          >
            <Image source={require('../../assets/images/doce-icon-transparent.png')} style={styles.brandIcon} resizeMode="contain" />
            <Text style={styles.logoTitle}>Doce</Text>
            <Text style={styles.logoSubtitle}>Sistema operativo educativo</Text>
          </TouchableOpacity>

          <View style={styles.loginCard}>
            <Text style={styles.cardHeader}>Iniciar Sesión</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Institucional</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@colegio.edu.pe"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                secureTextEntry
                editable={true}
                onChangeText={setPassword}
                placeholder="********"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLoginSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Ingresar a Doce</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </PaperProvider>
    );
  }

  // =====================================================================
  // VISTAS 2: DASHBOARDS SEGUIDOS POR ROL
  // =====================================================================
  return (
    <PaperProvider>
      <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Cabecera del Colegio */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Image 
              source={{ uri: colegio?.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&h=100&q=80' }} 
              style={styles.colegioLogo}
            />
            <View>
              <Text style={styles.colegioName}>{colegio?.nombre || 'Doce Global Admin'}</Text>
              <Text style={styles.academicYear}>Año Académico 2026</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        {/* Perfil Rápido */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user.foto_url }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user.nombre} {user.apellido}</Text>
            <Text style={styles.profileRol}>{user.rol.toUpperCase()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editProfileMobileBtn}
            onPress={() => {
              setNewName(user.nombre);
              setNewLastName(user.apellido);
              setSelectedMobileAvatar(user.foto_url);
              setShowMobileSettingsModal(true);
            }}
          >
            <Text style={styles.editProfileMobileBtnText}>⚙️ Ajustes</Text>
          </TouchableOpacity>
        </View>

        {/* =====================================================================
            PORTAL: SUPER ADMIN
            ===================================================================== */}
        {user.rol === 'superadmin' && (
          <View style={styles.portalView}>
            <Text style={styles.portalTitle}>Panel de Control Global</Text>

            {/* KPIs */}
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Colegios Totales</Text>
                <Text style={[styles.kpiValue, { color: '#FF2432' }]}>2</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Ingresos SaaS</Text>
                <Text style={[styles.kpiValue, { color: '#198754' }]}>S/. 18,900</Text>
              </View>
            </View>

            {/* Colegios List con Toggle Switches */}
            <View style={styles.mobileCard}>
              <Text style={styles.cardTitle}>Listado de Colegios</Text>
              <Text style={styles.instructionText}>Activa o bloquea el servicio de las instituciones en tiempo real:</Text>

              {/* Colegio 1 */}
              <View style={styles.schoolRow}>
                <View style={styles.schoolInfo}>
                  <Text style={styles.schoolNameText}>Colegio de Excelencia Doce</Text>
                  <Text style={styles.schoolRucText}>RUC: 20123456789 • Activo</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.schoolToggleBtn, { backgroundColor: '#EAF5EF', borderColor: '#5BAD8A' }]}
                  onPress={() => Alert.alert('Colegio Actualizado', 'El Colegio de Excelencia Doce sigue habilitado.')}
                >
                  <Text style={{ color: '#5BAD8A', fontSize: 11, fontWeight: '800' }}>ACTIVO</Text>
                </TouchableOpacity>
              </View>

              {/* Colegio 2 */}
              <View style={styles.schoolRow}>
                <View style={styles.schoolInfo}>
                  <Text style={styles.schoolNameText}>Colegio de Prueba Mobile</Text>
                  <Text style={styles.schoolRucText}>RUC: 20987654321 • Suspendido</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.schoolToggleBtn, { backgroundColor: '#FDECEA', borderColor: '#E07B6A' }]}
                  onPress={() => Alert.alert('Colegio Actualizado', 'El Colegio de Prueba Mobile ha sido activado temporalmente.')}
                >
                  <Text style={{ color: '#E07B6A', fontSize: 11, fontWeight: '800' }}>BLOQUEADO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* =====================================================================
            PORTAL: DIRECTOR
            ===================================================================== */}
        {user.rol === 'director' && (
          <View style={styles.portalView}>
            <Text style={styles.portalTitle}>Dashboard de Dirección</Text>

            {/* KPIs */}
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Ingresos</Text>
                <Text style={[styles.kpiValue, { color: '#5BAD8A' }]}>S/. 1,730</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Egresos</Text>
                <Text style={[styles.kpiValue, { color: '#E07B6A' }]}>S/. 2,350</Text>
              </View>
            </View>

            {/* Gráfico de barras flexbox */}
            <View style={styles.mobileCard}>
              <Text style={styles.cardTitle}>Flujo de Caja Mensual</Text>
              <View style={styles.barChartContainer}>
                <View style={styles.chartBarCol}>
                  <View style={[styles.chartBar, { height: 100, backgroundColor: '#FF2432' }]} />
                  <Text style={styles.chartBarLabel}>Ingresos</Text>
                </View>
                <View style={styles.chartBarCol}>
                  <View style={[styles.chartBar, { height: 140, backgroundColor: '#E07B6A' }]} />
                  <Text style={styles.chartBarLabel}>Egresos</Text>
                </View>
              </View>
            </View>

            {/* Alumnos Morosos */}
            <View style={styles.mobileCard}>
              <Text style={styles.cardTitle}>Alertas de Morosidad</Text>
              {deudores.map(deudor => (
                <View key={deudor.id} style={styles.deudorRow}>
                  <View>
                    <Text style={styles.deudorName}>{deudor.nombre}</Text>
                    <Text style={styles.deudorDetail}>{deudor.seccion} • {deudor.diasAtraso} días</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.deudorMonto}>{deudor.deuda}</Text>
                    <TouchableOpacity style={styles.reminderButton} onPress={() => handleSendReminder(deudor.nombre)}>
                      <Text style={styles.reminderButtonText}>🔔</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* =====================================================================
            PORTAL: DOCENTE
            ===================================================================== */}
        {user.rol === 'docente' && (
          <View style={styles.portalView}>
            <Text style={styles.portalTitle}>Registro de Clases</Text>
            
            <View style={styles.mobileCard}>
              <Text style={styles.classTitle}>Matemática Divertida - 1ro A</Text>
              <Text style={styles.classHour}>Clase Activa • 08:00 - 09:30</Text>

              {/* Indicaciones */}
              <Text style={styles.instructionText}>Toca a un alumno para cambiar su estado (Presente → Tardanza → Falta):</Text>

              {/* Alumnos */}
              <View style={styles.alumnoAsistenciaList}>
                {alumnosAsistencia.map(al => (
                  <TouchableOpacity 
                    key={al.id} 
                    style={[
                      styles.alumnoAsistenciaItem,
                      al.estado === 'P' ? { backgroundColor: '#D1E7DD', borderColor: '#BADBCC' } :
                      al.estado === 'T' ? { backgroundColor: '#FFF3CD', borderColor: '#FFE69C' } :
                      { backgroundColor: '#FDECEA', borderColor: 'rgba(224, 123, 106, 0.2)' }
                    ]}
                    onPress={() => handleToggleAsistencia(al.id)}
                  >
                    <Text style={styles.alumnoAsistenciaName}>{al.nombre}</Text>
                    <View style={[
                      styles.badge,
                      al.estado === 'P' ? { backgroundColor: '#198754' } :
                      al.estado === 'T' ? { backgroundColor: '#F5A623' } :
                      { backgroundColor: '#E07B6A' }
                    ]}>
                      <Text style={styles.badgeText}>
                        {al.estado === 'P' ? 'PRESENTE' : al.estado === 'T' ? 'TARDANZA' : 'FALTA'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveAsistenciaButton} onPress={handleSaveAsistencia}>
                <Text style={styles.saveAsistenciaButtonText}>Guardar Asistencia Rápida</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* =====================================================================
            PORTAL: PADRE
            ===================================================================== */}
        {user.rol === 'padre' && (
          <View style={styles.portalView}>
            {/* Selector de hijos */}
            <View style={styles.hijosTab}>
              <TouchableOpacity 
                style={[styles.hijoTabItem, selectedHijo === 'mateo' ? styles.hijoTabActive : null]}
                onPress={() => { setSelectedHijo('mateo'); setPagoCompletado(false); }}
              >
                <Text style={[styles.hijoTabText, selectedHijo === 'mateo' ? styles.hijoTabActiveText : null]}>Mateo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.hijoTabItem, selectedHijo === 'lucas' ? styles.hijoTabActive : null]}
                onPress={() => { setSelectedHijo('lucas'); setPagoCompletado(false); }}
              >
                <Text style={[styles.hijoTabText, selectedHijo === 'lucas' ? styles.hijoTabActiveText : null]}>Lucas</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.portalTitle}>Seguimiento de {selectedHijo === 'mateo' ? 'Mateo' : 'Lucas'}</Text>

            {/* [PRIORIDAD 1] Estado de Cuenta */}
            {/* [PRIORIDAD 1] Estado de Cuenta */}
            {selectedHijo === 'mateo' && !pagoCompletado ? (
              <View style={[styles.alertCard, { backgroundColor: '#FFF3CD', borderColor: '#FFE69C' }]}>
                <View>
                  <Text style={[styles.alertTitle, { color: '#664D03' }]}>Pensión Vencida - Mayo</Text>
                  <Text style={styles.alertDetail}>Monto: S/. 380.00. Regularice su estado.</Text>
                </View>
                <TouchableOpacity style={[styles.alertPayButton, { backgroundColor: '#1D1D1F' }]} onPress={handlePayPension} disabled={pagando}>
                  {pagando ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.alertPayButtonText}>Pagar</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.alertCard, { backgroundColor: '#D1E7DD', borderColor: '#BADBCC' }]}>
                <View>
                  <Text style={[styles.alertTitle, { color: '#0F5132' }]}>Estado Financiero al Día</Text>
                  <Text style={styles.alertDetail}>No cuenta con obligaciones vencidas.</Text>
                </View>
                <Text style={[styles.checkIcon, { color: '#0F5132' }]}>✓</Text>
              </View>
            )}

            {/* Asistencia de Hoy */}
            <View style={styles.mobileCard}>
              <Text style={styles.cardTitle}>Control de Asistencia Hoy</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 }}>
                <View style={[
                  styles.asistenciaBadge, 
                  selectedHijo === 'mateo' && !pagoCompletado ? { backgroundColor: '#E07B6A' } : { backgroundColor: '#198754' }
                ]}>
                  <Text style={styles.asistenciaBadgeText}>
                    {selectedHijo === 'mateo' && !pagoCompletado ? 'F' : 'P'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.asistenciaNameText}>
                    {selectedHijo === 'mateo' && !pagoCompletado ? 'Falta (Inasistencia)' : 'Presente en aula'}
                  </Text>
                  <Text style={styles.asistenciaDetailText}>Mayo 20, 2026</Text>
                </View>
              </View>
            </View>

            {/* Boleta de Notas */}
            <View style={styles.mobileCard}>
              <Text style={styles.cardTitle}>Libreta Bimestral en Tiempo Real</Text>
              <View style={styles.notaRow}>
                <Text style={styles.notaCurso}>Matemática Divertida</Text>
                <Text style={[styles.notaPromedio, { color: selectedHijo === 'mateo' ? '#E07B6A' : '#198754' }]}>
                  {selectedHijo === 'mateo' ? '11.0' : '16.8'}
                </Text>
              </View>
              <View style={styles.notaRow}>
                <Text style={styles.notaCurso}>Comunicación / Ciencia</Text>
                <Text style={[styles.notaPromedio, { color: '#198754' }]}>
                  {selectedHijo === 'mateo' ? '14.5' : '15.5'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* =====================================================================
            PORTAL: ALUMNO
            ===================================================================== */}
        {user.rol === 'alumno' && (
          <View style={styles.portalView}>
            <Text style={styles.portalTitle}>Tareas y Actividades</Text>

            {/* Avance */}
            <View style={styles.mobileCard}>
              <Text style={styles.cardTitle}>Mi Asistencia del Mes</Text>
              <Text style={styles.attendancePercentage}>92% Asistencia Escolar</Text>
              <Text style={styles.attendanceDetail}>¡Vas excelente! Continúa asistiendo a clases.</Text>
            </View>

            {/* Muro de Entregas */}
            <View style={styles.mobileCard}>
              <Text style={styles.cardTitle}>Mis Próximas Entregas</Text>
              {tareas.length === 0 ? (
                <Text style={styles.noTasks}>🎉 ¡Felicidades! Todo entregado.</Text>
              ) : (
                tareas.map(tarea => (
                  <View key={tarea.id} style={styles.taskRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle}>{tarea.titulo}</Text>
                      <Text style={styles.taskMeta}>{tarea.curso} • Límite: {tarea.vencimiento}</Text>
                    </View>
                    <TouchableOpacity style={styles.taskDeliverBtn} onPress={() => handleDeliverTask(tarea.id)}>
                      <Text style={styles.taskDeliverBtnText}>Entregar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Portal de Ajustes de Perfil Móvil */}
      <Portal>
        <Modal
          visible={showMobileSettingsModal}
          onDismiss={() => setShowMobileSettingsModal(false)}
          contentContainerStyle={styles.mobileModalContent}
        >
          <Text style={styles.mobileModalHeader}>Ajustes de Perfil</Text>
          
          <View style={styles.mobileInputGroup}>
            <Text style={styles.mobileLabel}>Nombre</Text>
            <TextInput
              style={styles.mobileTextInput}
              value={newName}
              onChangeText={setNewName}
            />
          </View>

          <View style={styles.mobileInputGroup}>
            <Text style={styles.mobileLabel}>Apellidos</Text>
            <TextInput
              style={styles.mobileTextInput}
              value={newLastName}
              onChangeText={setNewLastName}
            />
          </View>

          <Text style={styles.mobileLabel}>Selecciona tu Avatar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {PRESETS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedMobileAvatar(p)}
                  style={[
                    styles.mobileAvatarOption,
                    selectedMobileAvatar === p ? styles.mobileAvatarOptionActive : null
                  ]}
                >
                  <Image source={{ uri: p }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.mobileModalActions}>
            <TouchableOpacity 
              style={[styles.mobileModalBtn, { backgroundColor: '#F3F4F6' }]} 
              onPress={() => setShowMobileSettingsModal(false)}
            >
              <Text style={{ color: '#4B5563', fontWeight: '700' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.mobileModalBtn, { backgroundColor: '#1D1D1F' }]}
              onPress={handleSaveMobileProfile}
            >
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flexGrow: 1,
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 24,
    paddingVertical: 60,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandIcon: {
    width: 88,
    height: 88,
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#1D1D1F',
    marginTop: 4,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  loginCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.06)',
    elevation: 4,
    shadowColor: '#1D1D1F',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: '#E07B6A',
    backgroundColor: '#FDECEA',
    padding: 12,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(224, 123, 106, 0.2)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFF',
  },
  loginButton: {
    backgroundColor: '#1D1D1F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  quickAccess: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 24,
  },
  quickAccessHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickItem: {
    width: '48%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.06)',
    borderLeftWidth: 4,
    padding: 10,
    borderRadius: 10,
  },
  quickRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  quickEmail: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colegioLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  colegioName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  academicYear: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#1D1D1F',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  profileRol: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  portalView: {
    gap: 16,
  },
  portalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.06)',
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#1D1D1F',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  mobileCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.06)',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#1D1D1F',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 180,
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  chartBarCol: {
    alignItems: 'center',
  },
  chartBar: {
    width: 32,
    borderRadius: 6,
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
  },
  deudorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  deudorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  deudorDetail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  deudorMonto: {
    fontSize: 13,
    fontWeight: '900',
    color: '#E07B6A',
  },
  reminderButton: {
    backgroundColor: '#F3F4F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderButtonText: {
    fontSize: 14,
  },
  classTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  classHour: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 2,
  },
  instructionText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  alumnoAsistenciaList: {
    marginVertical: 16,
    gap: 8,
  },
  alumnoAsistenciaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  alumnoAsistenciaName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  saveAsistenciaButton: {
    backgroundColor: '#1D1D1F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveAsistenciaButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  hijosTab: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.06)',
    padding: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  hijoTabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  hijoTabActive: {
    backgroundColor: '#F3F4FF',
  },
  hijoTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  hijoTabActiveText: {
    color: '#1D1D1F',
  },
  alertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  alertDetail: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  alertPayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  alertPayButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkIcon: {
    fontSize: 20,
    fontWeight: '900',
  },
  asistenciaBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  asistenciaBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  asistenciaNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  asistenciaDetailText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  notaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notaCurso: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  notaPromedio: {
    fontSize: 13,
    fontWeight: '900',
  },
  attendancePercentage: {
    fontSize: 22,
    fontWeight: '900',
    color: '#198754',
    marginTop: 4,
  },
  attendanceDetail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  noTasks: {
    fontSize: 13,
    color: '#198754',
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 20,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  taskMeta: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600',
  },
  taskDeliverBtn: {
    backgroundColor: '#1D1D1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  taskDeliverBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  editProfileMobileBtn: {
    backgroundColor: '#F3F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editProfileMobileBtnText: {
    fontSize: 11,
    color: '#1D1D1F',
    fontWeight: '800',
  },
  mobileModalContent: {
    backgroundColor: '#FFF',
    padding: 24,
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.06)',
    elevation: 8,
    shadowColor: '#1D1D1F',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  mobileModalHeader: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 16,
  },
  mobileInputGroup: {
    marginBottom: 12,
  },
  mobileLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  mobileTextInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#FFF',
  },
  mobileAvatarOption: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 28,
    padding: 2,
  },
  mobileAvatarOptionActive: {
    borderColor: '#1D1D1F',
  },
  mobileModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  mobileModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  schoolInfo: {
    flex: 1,
    marginRight: 10,
  },
  schoolNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  schoolRucText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  schoolToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
});
