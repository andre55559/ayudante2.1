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
  
  if (!code) {
    showLicenseMessage('⚠️ Por favor, ingresa un código de licencia', 'warning');
    input.classList.add('error-shake');
    setTimeout(() => input.classList.remove('error-shake'), 500);
    return;
  }
  
  validateBtn.classList.add('loading');
  messageDiv.textContent = '';
  
  try {
    const result = await window.electronAPI.validateLicense(code);
    
    if (result.success) {
      AppState.isLicenseValid = true;
      showLicenseMessage('✅ ' + result.message, 'success');
      if (AppState.sounds) window.notificationAPI?.playNotificationSound('success');
      setTimeout(() => {
        showMainApp();
        loadUserData();
      }, 1500);
    } else {
      showLicenseMessage('❌ ' + result.error, 'error');
      if (AppState.sounds) window.notificationAPI?.playNotificationSound('error');
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
  setTimeout(() => document.getElementById('licenseInput').focus(), 100);
}

function showMainApp() {
  document.getElementById('licenseScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  initializeMainApp();
}

/**
 * 🏠 Inicialización de la App Principal
 */
async function initializeMainApp() {
  try {
    AppState.config = await window.electronAPI.getAppConfig();
    applyUserConfig();
    initializeNavigation();
    initializeTools(); // Ensure tools are initialized (calculator etc might need this)
    showWelcomeMessage();
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
  if (AppState.config.theme) changeTheme(AppState.config.theme);
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
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  switchTab('dashboard'); // Default tab
}

function switchTab(tabName) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName)?.classList.add('active');
  
  AppState.activeTab = tabName;
  
  switch (tabName) {
    case 'dashboard': updateDashboardStats(); break;
    case 'tools': initializeTools(); break; // Re-initialize or update tools if needed
    case 'progress': updateProgressDisplay(); break;
    case 'settings': loadSettingsData(); break;
    case 'aiHelperTab':
      // if (typeof window.initializeAiHelper === 'function') {
      //   window.initializeAiHelper();
      // }
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
    const todayTime = getTodayStudyTime();
    document.getElementById('todayStudyTime').textContent = `${todayTime} min`;
    document.getElementById('exercisesCompleted').textContent = progress.exercisesCompleted || 0;
    const streak = calculateCurrentStreak();
    document.getElementById('currentStreak').textContent = `${streak} días`;
    updateDailyGoalProgress(todayTime);
  } catch (error) {
    console.error('Error al actualizar estadísticas:', error);
  }
}

function getTodayStudyTime() {
  const today = new Date().toDateString();
  return parseInt(localStorage.getItem(`studyTime_${today}`) || '0');
}

function calculateCurrentStreak() {
  return parseInt(localStorage.getItem('currentStreak') || '0');
}

function updateDailyGoalProgress(currentTime) {
  const dailyGoal = parseInt(document.getElementById('dailyGoalInput').value || '60');
  const progressPercent = Math.min((currentTime / dailyGoal) * 100, 100);
  const timeElement = document.getElementById('todayStudyTime');
  if (progressPercent >= 100) timeElement.style.color = 'var(--success)';
  else if (progressPercent >= 50) timeElement.style.color = 'var(--warning)';
  else timeElement.style.color = 'var(--primary)';
}

/**
 * 🔧 Configuración de Event Listeners
 */
function setupEventListeners() {
  const licenseInput = document.getElementById('licenseInput');
  if (licenseInput) licenseInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') validateLicense(); });
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', async () => {
      const apiKeyInput = document.getElementById('apiKeyInput');
      const apiKey = apiKeyInput.value.trim();
      const apiKeyMessage = document.getElementById('apiKeyMessage');
      if (!apiKey) {
        apiKeyMessage.textContent = 'La clave API no puede estar vacía.';
        apiKeyMessage.className = 'message error';
        apiKeyMessage.style.display = 'block';
        return;
      }
      try {
        const result = await window.electronAPI.saveApiKey(apiKey);
        if (result.success) {
          apiKeyMessage.textContent = '¡Clave API guardada correctamente!';
          apiKeyMessage.className = 'message success';
        } else {
          apiKeyMessage.textContent = 'Error al guardar la clave API: ' + (result.error || 'Error desconocido');
          apiKeyMessage.className = 'message error';
        }
      } catch (error) {
        console.error('Error invoking saveApiKey:', error);
        apiKeyMessage.textContent = 'Ocurrió un error inesperado al guardar.';
        apiKeyMessage.className = 'message error';
      }
      apiKeyMessage.style.display = 'block';
    });
  }
  
  document.addEventListener('keydown', handleKeyboardShortcuts);
  document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
}

function handleKeyboardShortcuts(e) {
  if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') { // Updated to 5 tabs
    e.preventDefault();
    const tabs = ['dashboard', 'tools', 'progress', 'settings', 'aiHelperTab']; // Added aiHelperTab
    const tabIndex = parseInt(e.key) - 1;
    if (tabs[tabIndex]) switchTab(tabs[tabIndex]);
  }
  if (e.key === 'Escape') closeAllModals();
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
  changeTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function changeTheme(themeName = 'dark') {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('selectedTheme', themeName);
  AppState.theme = themeName;
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.textContent = themeName === 'dark' ? '☀️' : '🌙';
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = themeName;
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
  AppState.sounds = document.getElementById('soundEnabled').checked;
  await saveAppConfig({ sounds: AppState.sounds });
  showNotification('Configuración', AppState.sounds ? 'Sonidos activados' : 'Sonidos desactivados', 'info');
}

async function toggleReminders() {
  const enabled = document.getElementById('remindersEnabled').checked;
  await saveAppConfig({ reminders: enabled });
  showNotification('Configuración', enabled ? 'Recordatorios activados' : 'Recordatorios desactivados', 'info');
}

/**
 * 📈 Gestión de Progreso
 */
function updateProgressDisplay() {
  const progress = AppState.progress || {};
  const totalTime = Math.floor((progress.totalStudyTime || 0) / 60);
  document.getElementById('totalStudyTime').textContent = `${totalTime} horas`;
  document.getElementById('totalExercises').textContent = progress.exercisesCompleted || 0;
  document.getElementById('activeDays').textContent = progress.activeDays || 0;
  
  const subjects = progress.subjects || {};
  Object.keys(subjects).forEach(subject => {
    const subjectData = subjects[subject];
    const progressBar = document.querySelector(`[data-subject="${subject}"]`);
    const timeSpan = progressBar?.parentElement.parentElement.querySelector('.subject-time');
    if (progressBar && timeSpan) {
      const hours = Math.floor((subjectData.time || 0) / 60);
      const percentage = Math.min((subjectData.time || 0) / 3600 * 100, 100);
      progressBar.style.width = `${percentage}%`;
      timeSpan.textContent = `${hours}h`;
    }
  });
}

async function updateUserProgress(updates) {
  try {
    AppState.progress = { ...(AppState.progress || {}), ...updates }; // Ensure AppState.progress is not null
    await window.electronAPI.updateUserProgress(AppState.progress); // Send the whole updated object
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
        totalStudyTime: 0, exercisesCompleted: 0, activeDays: 0, lastSession: null,
        subjects: { matematicas: { time: 0, exercises: 0 }, español: { time: 0, exercises: 0 }, ciencias: { time: 0, exercises: 0 } }
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
    activityItem.innerHTML = `<span class="activity-icon">📝</span><span class="activity-text">${activity}</span><span class="activity-time">Ahora</span>`;
    activityList.insertBefore(activityItem, activityList.firstChild);
    const items = activityList.querySelectorAll('.activity-item');
    if (items.length > 5) items[items.length - 1].remove();
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
    if (AppState.sounds) window.notificationAPI.playNotificationSound(type);
  } else {
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }
}

/**
 * 🗂️ Gestión de Modales
 */
function showHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
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
    let greeting = hour < 12 ? '¡Buenos días!' : (hour < 18 ? '¡Buenas tardes!' : '¡Buenas noches!');
    welcomeElement.textContent = greeting;
  }
}

/**
 * ⚙️ Configuración de Settings
 */
function loadSettingsData() {
  window.electronAPI.loadApiKey().then(result => {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeyMessage = document.getElementById('apiKeyMessage');
    if (apiKeyInput) {
      if (result.success && result.apiKey) {
        apiKeyInput.value = result.apiKey;
      } else if (!result.success && result.error && apiKeyMessage) {
        apiKeyMessage.textContent = 'Error al cargar la clave API: ' + result.error;
        apiKeyMessage.className = 'message error';
        apiKeyMessage.style.display = 'block';
      }
    }
  }).catch(err => {
    console.error('Error invoking loadApiKey:', err);
    const apiKeyMessage = document.getElementById('apiKeyMessage');
    if (apiKeyMessage) {
      apiKeyMessage.textContent = 'Error crítico al invocar loadApiKey.';
      apiKeyMessage.className = 'message error';
      apiKeyMessage.style.display = 'block';
    }
  });

  const licenseStatus = document.getElementById('licenseStatus');
  if (licenseStatus) licenseStatus.textContent = AppState.isLicenseValid ? 'Activada ✅' : 'No activada ❌';
  
  const lastBackup = localStorage.getItem('lastBackup');
  const lastBackupElement = document.getElementById('lastBackup');
  if (lastBackupElement) lastBackupElement.textContent = lastBackup || 'Nunca';
}

/**
 * 🛠️ Funciones de Herramientas (Placeholder - definir en sus propios archivos o aquí si son simples)
 */
function initializeTools() {
  // Initialize calculator, pomodoro, etc. if they need specific setup when tab is shown or app starts
  // For now, their event listeners are in index.html or respective JS files.
  // If calculator.js, timer.js, units.js, utils.js manage their own state and init, this might be minimal.
  console.log("🛠️ Herramientas inicializadas/actualizadas");
}


/**
 * 🔧 Utilidades Globales (expuestas a HTML via window)
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

// Functions for tools - these might be better in their own JS files if complex
// For now, keeping it simple, assuming they are called from HTML onclick
// Calculator functions are in calculator.js, etc.

// Debug en desarrollo
if (process?.env?.NODE_ENV === 'development') {
  window.AppState = AppState;
  window.logActivity = logActivity;
  window.updateUserProgress = updateUserProgress;
}

console.log('📱 App.js cargado - Sistema base listo');
