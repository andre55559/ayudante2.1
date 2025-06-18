// 🍅 AsistenteEscolarAI - Temporizador Pomodoro
// Archivo: scripts/timer.js

/**
 * ⏱️ Estado del Temporizador
 */
const TimerState = {
  isRunning: false,
  isPaused: false,
  currentTime: 25 * 60, // 25 minutos en segundos
  totalTime: 25 * 60,
  mode: 'focus', // 'focus', 'shortBreak', 'longBreak'
  cycle: 1,
  totalCycles: 4,
  timerId: null,
  startTime: null,
  pausedTime: 0,
  sessions: {
    focus: 0,
    shortBreak: 0,
    longBreak: 0
  },
  settings: {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    autoStartBreaks: true,
    autoStartFocus: false,
    soundEnabled: true,
    notifications: true
  }
};

/**
 * 🏗️ Inicialización del Temporizador
 */
function initializeTimer() {
  setupTimerDisplay();
  loadTimerSettings();
  updateTimerProgress();
  
  console.log('🍅 Temporizador Pomodoro inicializado');
}

/**
 * 📺 Configurar display del temporizador
 */
function setupTimerDisplay() {
  updateTimerDisplay();
  updateTimerLabel();
  updateTimerProgress();
  updateTimerButton();
}

/**
 * ▶️ Alternar temporizador (Iniciar/Pausar)
 */
function toggleTimer() {
  if (!TimerState.isRunning) {
    startTimer();
  } else {
    pauseTimer();
  }
}

/**
 * ▶️ Iniciar temporizador
 */
function startTimer() {
  if (TimerState.isPaused) {
    resumeTimer();
    return;
  }
  
  TimerState.isRunning = true;
  TimerState.isPaused = false;
  TimerState.startTime = Date.now();
  
  // Usar la API del preload si está disponible
  if (window.educationalAPI && window.educationalAPI.startTimer) {
    TimerState.timerId = window.educationalAPI.startTimer(
      TimerState.currentTime / 60,
      handleTimerTick
    );
  } else {
    // Fallback manual
    TimerState.timerId = setInterval(() => {
      TimerState.currentTime--;
      handleTimerTick({
        minutes: Math.floor(TimerState.currentTime / 60),
        seconds: TimerState.currentTime % 60,
        total: TimerState.currentTime
      });
      
      if (TimerState.currentTime <= 0) {
        clearInterval(TimerState.timerId);
        handleTimerTick({ finished: true });
      }
    }, 1000);
  }
  
  updateTimerButton();
  logActivity(`🍅 Temporizador iniciado: ${TimerState.mode} (${formatTime(TimerState.currentTime)})`);
  
  // Notificación de inicio
  if (TimerState.settings.notifications) {
    showNotification('Pomodoro', `${getModeDisplayName()} iniciado`, 'info');
  }
  
  console.log('▶️ Temporizador iniciado');
}

/**
 * ⏸️ Pausar temporizador
 */
function pauseTimer() {
  TimerState.isRunning = false;
  TimerState.isPaused = true;
  TimerState.pausedTime += Date.now() - TimerState.startTime;
  
  if (TimerState.timerId) {
    if (window.educationalAPI && window.educationalAPI.stopTimer) {
      window.educationalAPI.stopTimer(TimerState.timerId);
    } else {
      clearInterval(TimerState.timerId);
    }
    TimerState.timerId = null;
  }
  
  updateTimerButton();
  logActivity('⏸️ Temporizador pausado');
  
  console.log('⏸️ Temporizador pausado');
}

/**
 * ▶️ Reanudar temporizador
 */
function resumeTimer() {
  TimerState.isRunning = true;
  TimerState.isPaused = false;
  TimerState.startTime = Date.now();
  
  // Continuar desde donde se pausó
  if (window.educationalAPI && window.educationalAPI.startTimer) {
    TimerState.timerId = window.educationalAPI.startTimer(
      TimerState.currentTime / 60,
      handleTimerTick
    );
  } else {
    TimerState.timerId = setInterval(() => {
      TimerState.currentTime--;
      handleTimerTick({
        minutes: Math.floor(TimerState.currentTime / 60),
        seconds: TimerState.currentTime % 60,
        total: TimerState.currentTime
      });
      
      if (TimerState.currentTime <= 0) {
        clearInterval(TimerState.timerId);
        handleTimerTick({ finished: true });
      }
    }, 1000);
  }
  
  updateTimerButton();
  logActivity('▶️ Temporizador reanudado');
  
  console.log('▶️ Temporizador reanudado');
}

/**
 * 🔄 Reiniciar temporizador
 */
function resetTimer() {
  // Detener si está corriendo
  if (TimerState.isRunning || TimerState.isPaused) {
    if (TimerState.timerId) {
      if (window.educationalAPI && window.educationalAPI.stopTimer) {
        window.educationalAPI.stopTimer(TimerState.timerId);
      } else {
        clearInterval(TimerState.timerId);
      }
      TimerState.timerId = null;
    }
  }
  
  // Resetear estado
  TimerState.isRunning = false;
  TimerState.isPaused = false;
  TimerState.currentTime = TimerState.totalTime;
  TimerState.startTime = null;
  TimerState.pausedTime = 0;
  
  // Actualizar interfaz
  updateTimerDisplay();
  updateTimerProgress();
  updateTimerButton();
  
  logActivity('🔄 Temporizador reiniciado');
  
  console.log('🔄 Temporizador reiniciado');
}

/**
 * ⏰ Manejar tick del temporizador
 */
function handleTimerTick(data) {
  if (data.finished) {
    handleTimerComplete();
  } else {
    TimerState.currentTime = data.total;
    updateTimerDisplay();
    updateTimerProgress();
    
    // Advertencia en los últimos 10 segundos
    if (data.total <= 10 && data.total > 0) {
      playWarningSound();
    }
  }
}

/**
 * ✅ Manejar completado del temporizador
 */
function handleTimerComplete() {
  TimerState.isRunning = false;
  TimerState.isPaused = false;
  TimerState.currentTime = 0;
  TimerState.timerId = null;
  
  // Registrar sesión completada
  TimerState.sessions[TimerState.mode]++;
  
  // Actualizar progreso del usuario
  updateStudyProgress();
  
  // Notificaciones
  handleTimerNotifications();
  
  // Determinar próximo modo
  const nextMode = getNextMode();
  
  // Auto-avanzar si está configurado
  if (shouldAutoStart(nextMode)) {
    setTimeout(() => {
      setTimerMode(nextMode);
      startTimer();
    }, 2000);
  } else {
    setTimerMode(nextMode);
  }
  
  logActivity(`✅ ${getModeDisplayName()} completado`);
  
  console.log('✅ Temporizador completado');
}

/**
 * 🔔 Manejar notificaciones del temporizador
 */
function handleTimerNotifications() {
  const modeDisplayName = getModeDisplayName();
  
  // Notificación visual
  if (TimerState.settings.notifications) {
    showNotification(
      'Pomodoro Completado', 
      `${modeDisplayName} terminado. ¡Buen trabajo!`, 
      'success'
    );
  }
  
  // Sonido de finalización
  if (TimerState.settings.soundEnabled) {
    playCompletionSound();
  }
  
  // Efecto visual en la aplicación
  flashTimerComplete();
}

/**
 * 🎵 Reproducir sonidos
 */
function playWarningSound() {
  if (TimerState.settings.soundEnabled && window.notificationAPI) {
    window.notificationAPI.playNotificationSound('warning');
  }
}

function playCompletionSound() {
  if (TimerState.settings.soundEnabled && window.notificationAPI) {
    window.notificationAPI.playNotificationSound('success');
  }
}

/**
 * ✨ Efecto visual de completado
 */
function flashTimerComplete() {
  const timerCircle = document.querySelector('.timer-circle');
  if (timerCircle) {
    timerCircle.classList.add('glow', 'pulse');
    setTimeout(() => {
      timerCircle.classList.remove('glow', 'pulse');
    }, 3000);
  }
}

/**
 * 📊 Actualizar progreso de estudio
 */
async function updateStudyProgress() {
  if (TimerState.mode === 'focus') {
    const studyTime = TimerState.settings.focusTime * 60; // en segundos
    const today = new Date().toDateString();
    
    // Actualizar tiempo de estudio local
    const currentTodayTime = parseInt(localStorage.getItem(`studyTime_${today}`) || '0');
    localStorage.setItem(`studyTime_${today}`, String(currentTodayTime + TimerState.settings.focusTime));
    
    // Actualizar progreso en la aplicación
    if (window.updateUserProgress) {
      const progressUpdate = {
        totalStudyTime: (AppState.progress?.totalStudyTime || 0) + studyTime,
        lastSession: new Date().toISOString()
      };
      
      await window.updateUserProgress(progressUpdate);
    }
    
    // Actualizar estadísticas del dashboard
    if (window.updateDashboardStats) {
      window.updateDashboardStats();
    }
  }
}

/**
 * 🔄 Lógica de modos del Pomodoro
 */
function getNextMode() {
  switch (TimerState.mode) {
    case 'focus':
      if (TimerState.cycle % 4 === 0) {
        return 'longBreak';
      } else {
        return 'shortBreak';
      }
    case 'shortBreak':
    case 'longBreak':
      TimerState.cycle++;
      return 'focus';
    default:
      return 'focus';
  }
}

function shouldAutoStart(mode) {
  return (mode === 'focus' && TimerState.settings.autoStartFocus) ||
         ((mode === 'shortBreak' || mode === 'longBreak') && TimerState.settings.autoStartBreaks);
}

function getModeDisplayName(mode = TimerState.mode) {
  const modeNames = {
    focus: 'Concentración',
    shortBreak: 'Descanso Corto',
    longBreak: 'Descanso Largo'
  };
  return modeNames[mode] || 'Concentración';
}

/**
 * ⚙️ Configuración de presets
 */
function setTimerPreset(minutes) {
  if (TimerState.isRunning) {
    if (!confirm('¿Detener el temporizador actual?')) {
      return;
    }
    resetTimer();
  }
  
  TimerState.currentTime = minutes * 60;
  TimerState.totalTime = minutes * 60;
  TimerState.settings.focusTime = minutes;
  
  updateTimerDisplay();
  updateTimerProgress();
  updatePresetButtons(minutes);
  
  logActivity(`⚙️ Preset configurado: ${minutes} minutos`);
  
  console.log(`⚙️ Preset configurado: ${minutes} minutos`);
}

function setTimerMode(mode) {
  TimerState.mode = mode;
  
  let duration;
  switch (mode) {
    case 'focus':
      duration = TimerState.settings.focusTime;
      break;
    case 'shortBreak':
      duration = TimerState.settings.shortBreakTime;
      break;
    case 'longBreak':
      duration = TimerState.settings.longBreakTime;
      break;
    default:
      duration = 25;
  }
  
  TimerState.currentTime = duration * 60;
  TimerState.totalTime = duration * 60;
  
  updateTimerDisplay();
  updateTimerLabel();
  updateTimerProgress();
  updateTimerButton();
}

/**
 * 📺 Actualizar interfaz
 */
function updateTimerDisplay() {
  const timeElement = document.getElementById('timerTime');
  if (timeElement) {
    timeElement.textContent = formatTime(TimerState.currentTime);
  }
}

function updateTimerLabel() {
  const labelElement = document.getElementById('timerLabel');
  if (labelElement) {
    labelElement.textContent = getModeDisplayName();
  }
}

function updateTimerProgress() {
  const progressBar = document.getElementById('timerProgress');
  if (progressBar) {
    const progress = ((TimerState.totalTime - TimerState.currentTime) / TimerState.totalTime) * 100;
    const circumference = 2 * Math.PI * 45; // radio = 45
    const offset = circumference - (progress / 100) * circumference;
    
    progressBar.style.strokeDashoffset = offset;
    
    // Cambiar color según el modo
    const colors = {
      focus: '#3b82f6',
      shortBreak: '#10b981',
      longBreak: '#8b5cf6'
    };
    progressBar.style.stroke = colors[TimerState.mode] || colors.focus;
  }
}

function updateTimerButton() {
  const button = document.getElementById('timerStartBtn');
  if (button) {
    if (TimerState.isRunning) {
      button.textContent = '⏸️ Pausar';
      button.classList.add('btn-warning');
      button.classList.remove('btn-primary');
    } else if (TimerState.isPaused) {
      button.textContent = '▶️ Continuar';
      button.classList.add('btn-primary');
      button.classList.remove('btn-warning');
    } else {
      button.textContent = '▶️ Iniciar';
      button.classList.add('btn-primary');
      button.classList.remove('btn-warning');
    }
  }
}

function updatePresetButtons(activeMinutes) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.textContent) === activeMinutes) {
      btn.classList.add('active');
    }
  });
}

/**
 * 🕐 Utilidades de tiempo
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 💾 Gestión de configuración
 */
function loadTimerSettings() {
  const savedSettings = localStorage.getItem('pomodoroSettings');
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      TimerState.settings = { ...TimerState.settings, ...settings };
    } catch (error) {
      console.error('Error al cargar configuración del temporizador:', error);
    }
  }
}

function saveTimerSettings() {
  localStorage.setItem('pomodoroSettings', JSON.stringify(TimerState.settings));
}

/**
 * 📊 Estadísticas del Pomodoro
 */
function getPomodoroStats() {
  return {
    totalSessions: Object.values(TimerState.sessions).reduce((a, b) => a + b, 0),
    focusSessions: TimerState.sessions.focus,
    breakSessions: TimerState.sessions.shortBreak + TimerState.sessions.longBreak,
    currentCycle: TimerState.cycle,
    currentMode: TimerState.mode,
    isActive: TimerState.isRunning
  };
}

function resetPomodoroStats() {
  TimerState.sessions = {
    focus: 0,
    shortBreak: 0,
    longBreak: 0
  };
  TimerState.cycle = 1;
  
  showNotification('Estadísticas', 'Estadísticas del Pomodoro reiniciadas', 'info');
}

/**
 * 🍅 Función específica para iniciar Pomodoro desde acciones rápidas
 */
function startPomodoro() {
  // Cambiar al tab de herramientas si no estamos ahí
  if (AppState.activeTab !== 'tools') {
    switchTab('tools');
  }
  
  // Si ya está corriendo, solo mostrar notificación
  if (TimerState.isRunning) {
    showNotification('Pomodoro', 'El temporizador ya está activo', 'warning');
    return;
  }
  
  // Configurar para sesión de concentración si es necesario
  if (TimerState.mode !== 'focus') {
    setTimerMode('focus');
  }
  
  // Iniciar temporizador
  startTimer();
  
  // Scroll hasta el temporizador
  const timerElement = document.querySelector('.pomodoro-timer');
  if (timerElement) {
    timerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  logActivity('🍅 Pomodoro iniciado desde acciones rápidas');
}

/**
 * 🔧 Utilidades públicas
 */
window.toggleTimer = toggleTimer;
window.resetTimer = resetTimer;
window.setTimerPreset = setTimerPreset;
window.startPomodoro = startPomodoro;
window.setTimerMode = setTimerMode;
window.getPomodoroStats = getPomodoroStats;
window.resetPomodoroStats = resetPomodoroStats;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTimer);
} else {
  initializeTimer();
}

console.log('🍅 Timer.js cargado - Temporizador Pomodoro listo');
