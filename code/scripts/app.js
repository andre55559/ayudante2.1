// 🚀 AsistenteEscolarAI - JavaScript Principal
// Archivo: scripts/app.js

/**
 * 🏗️ Estado Global de la Aplicación
 */
const AppState = {
  isLicenseValid: false,
  currentUser: null,
  activeTab: 'dashboard',
  theme: 'dark',
  config: {},
  progress: {},
  timers: {
    pomodoro: null,
    session: null
  },
  sounds: true
};

/**
 * 🎯 Inicialización de la Aplicación
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎓 Iniciando AsistenteEscolarAI...');
  
  try {
    // Verificar APIs disponibles
    if (!window.electronAPI) {
      throw new Error('APIs de Electron no disponibles');
    }
    
    // Configurar listeners de eventos
    setupEventListeners();
    
    // Configurar tema inicial
    initializeTheme();
    
    // Esperar estado de licencia
    await waitForLicenseCheck();
    
    console.log('✅ Aplicación inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    showNotification('Error', 'Error al inicializar la aplicación', 'error');
  }
});

/**
 * 🔐 Gestión de Licencias
 */
async function waitForLicenseCheck() {
  return new Promise((resolve) => {
    // Listener para el estado de licencia
    window.electronAPI.onLicenseStatus((data) => {
      console.log('📋 Estado de licencia recibido:', data);
      
      if (data.valid) {
        AppState.isLicenseValid = true;
        showMainApp();
        loadUserData();
        resolve();
      } else {
        AppState.isLicenseValid = false;
        showLicenseScreen();
        resolve();
      }
    });
  });
}

async function validateLicense() {
  const input = document.getElementById('licenseInput');
  const messageDiv = document.getElementById('licenseMessage');
  const validateBtn = document.getElementById('validateBtn');
  
  const code = input.value.trim();
  
  // Validación del input
  if (!code) {
    showLicenseMessage('⚠️ Por favor, ingresa un código de licencia', 'warning');
    input.classList.add('error-shake');
    setTimeout(() => input.classList.remove('error-shake'), 500);
    return;
  }
  
  // Mostrar estado de carga
  validateBtn.classList.add('loading');
  messageDiv.textContent = '';
  
  try {
    const result = await window.electronAPI.validateLicense(code);
    
    if (result.success) {
      AppState.isLicenseValid = true;
      showLicenseMessage('✅ ' + result.message, 'success');
      
      // Sonido de éxito
      if (AppState.sounds) {
        window.notificationAPI?.playNotificationSound('success');
      }
      
      // Transición a la app principal
      setTimeout(() => {
        showMainApp();
        loadUserData();
      }, 1500);
    } else {
      showLicenseMessage('❌ ' + result.error, 'error');
      
      // Sonido de error
      if (AppState.sounds) {
        window.notificationAPI?.playNotificationSound('error');
      }
      
      // Limpiar input y enfocar
      input.value = '';
      input.focus();
    }
  } catch (error) {
    console.error('Error al validar licencia:', error);
    showLicenseMessage('❌ Error de conexión. Inténtalo de nuevo.', 'error');
  } finally {
    validateBtn.classList.remove('loading');
  }
}

function showLicenseMessage(message, type) {
  const messageDiv = document.getElementById('licenseMessage');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
}

/**
 * 📱 Gestión de Pantallas
 */
function showLicenseScreen() {
  document.getElementById('licenseScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
  
  // Enfocar input de licencia
  setTimeout(() => {
    document.getElementById('licenseInput').focus();
  }, 100);
}

function showMainApp() {
  document.getElementById('licenseScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  
  // Inicializar componentes de la app principal
  initializeMainApp();
}

/**
 * 🏠 Inicialización de la App Principal
 */
async function initializeMainApp() {
  try {
    // Cargar configuración
    AppState.config = await window.electronAPI.getAppConfig();
    
    // Aplicar configuración
    applyUserConfig();
    
    // Inicializar navegación
    initializeNavigation();
    
    // Inicializar herramientas
    initializeTools();
    
    // Mostrar bienvenida
    showWelcomeMessage();
    
    // Registrar actividad
    await logActivity('🎯 Aplicación iniciada');
    
    console.log('🏠 App principal inicializada');
  } catch (error) {
    console.error('Error al inicializar app principal:', error);
  }
}

async function loadUserData() {
  try {
    AppState.progress = await window.electronAPI.getUserProgress();
    updateProgressDisplay();
    updateDashboardStats();
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
  }
}

function applyUserConfig() {
  if (AppState.config.theme) {
    changeTheme(AppState.config.theme);
  }
  
  if (AppState.config.dailyGoal) {
    document.getElementById('dailyGoalInput').value = AppState.config.dailyGoal;
    document.getElementById('dailyGoal').textContent = AppState.config.dailyGoal + ' min';
  }
  
  AppState.sounds = AppState.config.sounds !== false;
  document.getElementById('soundEnabled').checked = AppState.sounds;
}

/**
 * 🧭 Sistema de Navegación
 */
function initializeNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // Mostrar tab inicial
  switchTab('dashboard');
}

function switchTab(tabName) {
  // Actualizar botones de navegación
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Mostrar contenido del tab
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
  
  AppState.activeTab = tabName;
  
  // Ejecutar lógica específica del tab
  switch (tabName) {
    case 'dashboard':
      updateDashboardStats();
      break;
    case 'tools':
      initializeTools();
      break;
    case 'progress':
      updateProgressDisplay();
      break;
    case 'settings':
      loadSettingsData();
      break;
  }
  
  console.log(`📋 Cambiado a tab: ${tabName}`);
}

/**
 * 📊 Dashboard y Estadísticas
 */
async function updateDashboardStats() {
  try {
    const progress = AppState.progress || {};
    
    // Tiempo de estudio hoy (simulado por ahora)
    const todayTime = getTodayStudyTime();
    document.getElementById('todayStudyTime').textContent = `${todayTime} min`;
    
    // Ejercicios completados
    document.getElementById('exercisesCompleted').textContent = 
      progress.exercisesCompleted || 0;
    
    // Racha actual (simulada)
    const streak = calculateCurrentStreak();
    document.getElementById('currentStreak').textContent = `${streak} días`;
    
    // Actualizar gráfico de progreso de la meta diaria
    updateDailyGoalProgress(todayTime);
    
  } catch (error) {
    console.error('Error al actualizar estadísticas:', error);
  }
}

function getTodayStudyTime() {
  // Por ahora simulamos el tiempo de estudio del día
  // En una implementación real, esto vendría de la base de datos
  const today = new Date().toDateString();
  const sessionTime = parseInt(localStorage.getItem(`studyTime_${today}`) || '0');
  return sessionTime;
}

function calculateCurrentStreak() {
  // Simulamos el cálculo de la racha actual
  // En una implementación real, esto vendría de la base de datos
  return parseInt(localStorage.getItem('currentStreak') || '0');
}

function updateDailyGoalProgress(currentTime) {
  const dailyGoal = parseInt(document.getElementById('dailyGoalInput').value || '60');
  const progressPercent = Math.min((currentTime / dailyGoal) * 100, 100);
  
  // Actualizar el color del tiempo basado en el progreso
  const timeElement = document.getElementById('todayStudyTime');
  if (progressPercent >= 100) {
    timeElement.style.color = 'var(--success)';
  } else if (progressPercent >= 50) {
    timeElement.style.color = 'var(--warning)';
  } else {
    timeElement.style.color = 'var(--primary)';
  }
}

/**
 * 🔧 Configuración de Event Listeners
 */
function setupEventListeners() {
  // Validación de licencia
  const licenseInput = document.getElementById('licenseInput');
  if (licenseInput) {
    licenseInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        validateLicense();
      }
    });
  }
  
  // Toggle de tema
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Atajos de teclado
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Prevenir zoom con Ctrl + scroll
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });
}

function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + número para cambiar tabs
  if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
    e.preventDefault();
    const tabs = ['dashboard', 'tools', 'progress', 'settings'];
    const tabIndex = parseInt(e.key) - 1;
    if (tabs[tabIndex]) {
      switchTab(tabs[tabIndex]);
    }
  }
  
  // Escape para cerrar modales
  if (e.key === 'Escape') {
    closeAllModals();
  }
}

/**
 * 🎨 Gestión de Temas
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
  changeTheme(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  changeTheme(newTheme);
}

function changeTheme(themeName = 'dark') {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('selectedTheme', themeName);
  AppState.theme = themeName;
  
  // Actualizar icono del botón de tema
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = themeName === 'dark' ? '☀️' : '🌙';
  }
  
  // Actualizar selector en configuración
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = themeName;
  }
  
  // Guardar en configuración
  saveAppConfig({ theme: themeName });
  
  console.log(`🎨 Tema cambiado a: ${themeName}`);
}

/**
 * 💾 Gestión de Configuración
 */
async function saveAppConfig(updates) {
  try {
    AppState.config = { ...AppState.config, ...updates };
    await window.electronAPI.saveAppConfig(updates);
  } catch (error) {
    console.error('Error al guardar configuración:', error);
  }
}

async function updateDailyGoal() {
  const newGoal = parseInt(document.getElementById('dailyGoalInput').value);
  if (newGoal >= 15 && newGoal <= 480) {
    document.getElementById('dailyGoal').textContent = newGoal + ' min';
    await saveAppConfig({ dailyGoal: newGoal });
    showNotification('Configuración', `Meta diaria actualizada a ${newGoal} minutos`, 'success');
  }
}

async function toggleSound() {
  const enabled = document.getElementById('soundEnabled').checked;
  AppState.sounds = enabled;
  await saveAppConfig({ sounds: enabled });
  showNotification('Configuración', 
    enabled ? 'Sonidos activados' : 'Sonidos desactivados', 'info');
}

async function toggleReminders() {
  const enabled = document.getElementById('remindersEnabled').checked;
  await saveAppConfig({ reminders: enabled });
  showNotification('Configuración', 
    enabled ? 'Recordatorios activados' : 'Recordatorios desactivados', 'info');
}

/**
 * 📈 Gestión de Progreso
 */
function updateProgressDisplay() {
  const progress = AppState.progress || {};
  
  // Estadísticas generales
  const totalTime = Math.floor((progress.totalStudyTime || 0) / 60);
  document.getElementById('totalStudyTime').textContent = `${totalTime} horas`;
  document.getElementById('totalExercises').textContent = progress.exercisesCompleted || 0;
  document.getElementById('activeDays').textContent = progress.activeDays || 0;
  
  // Progreso por asignatura
  const subjects = progress.subjects || {};
  Object.keys(subjects).forEach(subject => {
    const subjectData = subjects[subject];
    const progressBar = document.querySelector(`[data-subject="${subject}"]`);
    const timeSpan = progressBar?.parentElement.parentElement.querySelector('.subject-time');
    
    if (progressBar && timeSpan) {
      const hours = Math.floor((subjectData.time || 0) / 60);
      const percentage = Math.min((subjectData.time || 0) / 3600 * 100, 100); // 60 horas = 100%
      
      progressBar.style.width = `${percentage}%`;
      timeSpan.textContent = `${hours}h`;
    }
  });
}

async function updateUserProgress(updates) {
  try {
    AppState.progress = { ...AppState.progress, ...updates };
    await window.electronAPI.updateUserProgress(updates);
    updateProgressDisplay();
    updateDashboardStats();
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
  }
}

async function resetProgress() {
  if (confirm('⚠️ ¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.')) {
    try {
      const defaultProgress = {
        totalStudyTime: 0,
        exercisesCompleted: 0,
        activeDays: 0,
        lastSession: null,
        subjects: {
          matematicas: { time: 0, exercises: 0 },
          español: { time: 0, exercises: 0 },
          ciencias: { time: 0, exercises: 0 }
        }
      };
      
      await window.electronAPI.updateUserProgress(defaultProgress);
      AppState.progress = defaultProgress;
      
      updateProgressDisplay();
      updateDashboardStats();
      
      showNotification('Progreso', 'Progreso reiniciado correctamente', 'success');
    } catch (error) {
      console.error('Error al reiniciar progreso:', error);
      showNotification('Error', 'No se pudo reiniciar el progreso', 'error');
    }
  }
}

/**
 * 📋 Sistema de Actividades
 */
async function logActivity(activity) {
  try {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item slide-up';
    activityItem.innerHTML = `
      <span class="activity-icon">📝</span>
      <span class="activity-text">${activity}</span>
      <span class="activity-time">Ahora</span>
    `;
    
    // Insertar al principio de la lista
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Limitar a 5 actividades mostradas
    const items = activityList.querySelectorAll('.activity-item');
    if (items.length > 5) {
      items[items.length - 1].remove();
    }
    
    console.log('📝 Actividad registrada:', activity);
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
}

/**
 * 🔔 Sistema de Notificaciones
 */
function showNotification(title, message, type = 'info') {
  if (window.notificationAPI) {
    window.notificationAPI.showNotification(title, message, type);
    
    if (AppState.sounds) {
      window.notificationAPI.playNotificationSound(type);
    }
  } else {
    // Fallback para navegadores sin la API personalizada
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }
}

/**
 * 🗂️ Gestión de Modales
 */
function showHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = 'auto';
}

/**
 * 💾 Gestión de Respaldos
 */
async function createBackup() {
  try {
    const result = await window.electronAPI.createBackup();
    
    if (result.success) {
      document.getElementById('lastBackup').textContent = new Date().toLocaleString();
      showNotification('Respaldo', 'Respaldo creado correctamente', 'success');
    } else {
      showNotification('Error', 'No se pudo crear el respaldo', 'error');
    }
  } catch (error) {
    console.error('Error al crear respaldo:', error);
    showNotification('Error', 'Error al crear respaldo', 'error');
  }
}

/**
 * 👋 Mensajes de Bienvenida
 */
function showWelcomeMessage() {
  const welcomeElement = document.getElementById('userWelcome');
  if (welcomeElement) {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) {
      greeting = '¡Buenos días!';
    } else if (hour < 18) {
      greeting = '¡Buenas tardes!';
    } else {
      greeting = '¡Buenas noches!';
    }
    
    welcomeElement.textContent = greeting;
  }
}

/**
 * ⚙️ Configuración de Settings
 */
function loadSettingsData() {
  // Cargar información de la licencia
  const licenseStatus = document.getElementById('licenseStatus');
  if (licenseStatus) {
    licenseStatus.textContent = AppState.isLicenseValid ? 'Activada ✅' : 'No activada ❌';
  }
  
  // Cargar último backup
  const lastBackup = localStorage.getItem('lastBackup');
  const lastBackupElement = document.getElementById('lastBackup');
  if (lastBackupElement) {
    lastBackupElement.textContent = lastBackup || 'Nunca';
  }
}

/**
 * 🔧 Utilidades Globales
 */
window.validateLicense = validateLicense;
window.showHelpModal = showHelpModal;
window.closeModal = closeModal;
window.changeTheme = changeTheme;
window.updateDailyGoal = updateDailyGoal;
window.toggleSound = toggleSound;
window.toggleReminders = toggleReminders;
window.createBackup = createBackup;
window.resetProgress = resetProgress;

// Debug en desarrollo
if (process?.env?.NODE_ENV === 'development') {
  window.AppState = AppState;
  window.logActivity = logActivity;
  window.updateUserProgress = updateUserProgress;
}

console.log('📱 App.js cargado - Sistema base listo');
