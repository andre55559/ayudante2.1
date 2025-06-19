const { contextBridge, ipcRenderer } = require("electron");

/**
 * 🔒 API Segura de Electron expuesta al renderer
 * Todas las comunicaciones pasan por contextBridge para mayor seguridad
 */
contextBridge.exposeInMainWorld("electronAPI", {

  // === 📋 LICENCIAS Y CONFIGURACIÓN ===
  validateLicense: (code) => ipcRenderer.invoke("validate-license", code),
  getAppConfig: () => ipcRenderer.invoke("get-app-config"),
  saveAppConfig: (config) => ipcRenderer.invoke("save-app-config", config),

  // === 📊 PROGRESO Y DATOS DEL USUARIO ===
  getUserProgress: () => ipcRenderer.invoke("get-user-progress"),
  updateUserProgress: (progressUpdate) => ipcRenderer.invoke("update-user-progress", progressUpdate),

  // === 📁 MANEJO DE ARCHIVOS ===
  showFileDialog: (options = {}) => ipcRenderer.invoke("show-file-dialog", options), // Generic file dialog
  createBackup: () => ipcRenderer.invoke("create-backup"),

  // === OPEN EPUB FILE FUNCTION ===
  /**
   * Shows a dialog to select an EPUB file.
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  openEpubFile: () => ipcRenderer.invoke('open-epub-file'),

  // === 📡 EVENTOS Y LISTENERS ===
  onLicenseStatus: (callback) => {
    ipcRenderer.on("license-status", (event, data) => callback(data));
  },
  removeLicenseStatusListener: () => {
    ipcRenderer.removeAllListeners("license-status");
  },

  // === 🛠️ UTILIDADES DEL SISTEMA ===
  getSystemInfo: () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome
    };
  },

  // === 🔧 FUNCIONES DE DESARROLLO ===
  devLog: (data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV]', data);
    }
  },

  // === API KEY MANAGEMENT ===
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  loadApiKey: () => ipcRenderer.invoke('load-api-key'),

  // === WEB INTERACTION SETTINGS ===
  saveWebInteractionSetting: (isEnabled) => ipcRenderer.invoke('save-web-interaction-setting', isEnabled),
  loadWebInteractionSetting: () => ipcRenderer.invoke('load-web-interaction-setting'),

  // === OPENAI COMPLETION FUNCTION ===
  getOpenAICompletion: (prompt) => ipcRenderer.invoke('get-openai-completion', prompt),

  // === AI HELPER EVENT LISTENERS ===
  onCapturedTextForAI: (callback) => ipcRenderer.on('captured-text-for-ai', (event, data) => callback(data)),
  onNoTextCapturedForAI: (callback) => ipcRenderer.on('no-text-captured-for-ai', (event) => callback()),
  onGlobalShortcutTriggered: (callback) => ipcRenderer.on('global-shortcut-triggered', (event, data) => callback(data)),

  // === TYPE TEXT AT CURSOR FUNCTION ===
  typeText: (text) => ipcRenderer.invoke('type-text-at-cursor', text),

  // === TRIGGER TYPE ANSWER LISTENER ===
  onTriggerTypeAnswerHotkey: (callback) => ipcRenderer.on('trigger-type-answer-hotkey', () => callback()),

  // === TYPE INTO WEB CONTENT FIELD FUNCTION ===
  typeIntoWebContentField: (selector, text) => ipcRenderer.invoke('type-into-web-content-field', { selector, text })
});

/**
 * 🎯 API específica para funcionalidades educativas
 */
contextBridge.exposeInMainWorld("educationalAPI", {

  // === 📚 GENERACIÓN DE EJERCICIOS ===
  generateMathExercises: async (options = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: Date.now(),
            type: options.type || 'suma',
            difficulty: options.difficulty || 'medio',
            question: '¿Cuánto es 15 + 27?',
            answer: 42,
            options: [40, 42, 44, 46]
          }
        ]);
      }, 100);
    });
  },

  // === 🧮 CALCULADORA CIENTÍFICA ===
  evaluateMathExpression: (expression) => {
    try {
      const allowedFunctions = [
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'sinh', 'cosh', 'tanh', 'log', 'log10', 'log2',
        'exp', 'sqrt', 'abs', 'ceil', 'floor', 'round',
        'pow', 'max', 'min'
      ];
      const sanitized = expression
        .replace(/[^0-9+\-*/().,\s]/g, '')
        .replace(/\s+/g, '');
      const result = new Function('Math', `return ${sanitized}`)(Math);
      return isNaN(result) ? 'Error' : result;
    } catch (error) {
      return 'Error de sintaxis';
    }
  },

  // === ⏱️ TEMPORIZADOR POMODORO ===
  startTimer: (minutes, callback) => {
    let seconds = minutes * 60;
    const timer = setInterval(() => {
      seconds--;
      callback({
        minutes: Math.floor(seconds / 60),
        seconds: seconds % 60,
        total: seconds
      });
      if (seconds <= 0) {
        clearInterval(timer);
        callback({ finished: true });
      }
    }, 1000);
    return timer;
  },
  stopTimer: (timerId) => {
    clearInterval(timerId);
  },

  // === 📐 CONVERSOR DE UNIDADES ===
  convertUnits: (value, fromUnit, toUnit) => {
    const conversions = {
      'mm': 0.001, 'cm': 0.01, 'm': 1, 'km': 1000,
      'in': 0.0254, 'ft': 0.3048, 'yd': 0.9144, 'mi': 1609.34,
      'mg': 0.001, 'g': 1, 'kg': 1000,
      'oz': 28.3495, 'lb': 453.592,
      'C': (val, to) => (to === 'F' ? (val * 9/5) + 32 : (to === 'K' ? val + 273.15 : val)),
      'F': (val, to) => (to === 'C' ? (val - 32) * 5/9 : (to === 'K' ? ((val - 32) * 5/9) + 273.15 : val)),
      'K': (val, to) => (to === 'C' ? val - 273.15 : (to === 'F' ? ((val - 273.15) * 9/5) + 32 : val))
    };
    if (['C', 'F', 'K'].includes(fromUnit)) return conversions[fromUnit](value, toUnit);
    if (conversions[fromUnit] && conversions[toUnit]) return (value * conversions[fromUnit]) / conversions[toUnit];
    return NaN;
  },

  // === 📝 UTILIDADES DE TEXTO ===
  analyzeText: (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    return {
      words: words.length, characters, charactersNoSpaces, sentences, paragraphs,
      averageWordsPerSentence: sentences > 0 ? Math.round(words.length / sentences) : 0
    };
  }
});

/**
 * 🎨 API para temas y personalización
 */
contextBridge.exposeInMainWorld("themeAPI", {
  applyTheme: (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('selectedTheme', themeName);
  },
  getCurrentTheme: () => localStorage.getItem('selectedTheme') || 'dark',
  getAvailableThemes: () => [
    { id: 'dark', name: 'Oscuro', description: 'Tema oscuro para menor fatiga visual' },
    { id: 'light', name: 'Claro', description: 'Tema claro tradicional' },
    { id: 'blue', name: 'Azul', description: 'Tema azul profesional' },
    { id: 'green', name: 'Verde', description: 'Tema verde relajante' }
  ]
});

// === 🔊 NOTIFICACIONES Y FEEDBACK ===
contextBridge.exposeInMainWorld("notificationAPI", {
  showNotification: (title, message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<div class="notification-content"><h4>${title}</h4><p>${message}</p><button class="notification-close">&times;</button></div>`;
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 5000);
    notification.querySelector('.notification-close').onclick = () => notification.parentNode.removeChild(notification);
  },
  playNotificationSound: (type = 'info') => {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioCtx();
      const frequencies = { success: [523.25, 659.25, 783.99], error: [220, 185], warning: [440, 554.37], info: [440] };
      const freq = frequencies[type] || frequencies.info;
      freq.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime + (index * 0.1));
        oscillator.stop(audioContext.currentTime + 0.3 + (index * 0.1));
      });
    }
  }
});

console.log("🔒 Preload.js cargado - APIs seguras disponibles");
