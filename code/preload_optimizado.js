const { contextBridge, ipcRenderer } = require("electron");

/**
 * 🔒 API Segura de Electron expuesta al renderer
 * Todas las comunicaciones pasan por contextBridge para mayor seguridad
 */
contextBridge.exposeInMainWorld("electronAPI", {
  
  // === 📋 LICENCIAS Y CONFIGURACIÓN ===
  
  /**
   * Validar código de licencia
   * @param {string} code - Código de licencia a validar
   * @returns {Promise<{success: boolean, error?: string, message?: string, data?: object}>}
   */
  validateLicense: (code) => ipcRenderer.invoke("validate-license", code),
  
  /**
   * Obtener configuración de la aplicación
   * @returns {Promise<object>} Configuración actual
   */
  getAppConfig: () => ipcRenderer.invoke("get-app-config"),
  
  /**
   * Guardar configuración de la aplicación
   * @param {object} config - Nueva configuración
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  saveAppConfig: (config) => ipcRenderer.invoke("save-app-config", config),

  // === 📊 PROGRESO Y DATOS DEL USUARIO ===
  
  /**
   * Obtener progreso del usuario
   * @returns {Promise<object>} Datos de progreso
   */
  getUserProgress: () => ipcRenderer.invoke("get-user-progress"),
  
  /**
   * Actualizar progreso del usuario
   * @param {object} progressUpdate - Datos de progreso a actualizar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  updateUserProgress: (progressUpdate) => ipcRenderer.invoke("update-user-progress", progressUpdate),

  // === 📁 MANEJO DE ARCHIVOS ===
  
  /**
   * Mostrar diálogo de selección de archivos
   * @param {object} options - Opciones del diálogo
   * @returns {Promise<{canceled: boolean, filePaths?: string[], error?: string}>}
   */
  showFileDialog: (options = {}) => ipcRenderer.invoke("show-file-dialog", options),
  
  /**
   * Crear backup de datos
   * @returns {Promise<{success: boolean, file?: string, error?: string}>}
   */
  createBackup: () => ipcRenderer.invoke("create-backup"),

  // === 📡 EVENTOS Y LISTENERS ===
  
  /**
   * Escuchar estado de licencia al iniciar
   * @param {function} callback - Función a ejecutar cuando se recibe el estado
   */
  onLicenseStatus: (callback) => {
    ipcRenderer.on("license-status", (event, data) => callback(data));
  },
  
  /**
   * Remover listener de estado de licencia
   */
  removeLicenseStatusListener: () => {
    ipcRenderer.removeAllListeners("license-status");
  },

  // === 🛠️ UTILIDADES DEL SISTEMA ===
  
  /**
   * Obtener información del sistema
   * @returns {object} Información básica del sistema
   */
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
  
  /**
   * Log seguro para debugging (solo en desarrollo)
   * @param {any} data - Datos a logear
   */
  devLog: (data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV]', data);
    }
  }
});

/**
 * 🎯 API específica para funcionalidades educativas
 */
contextBridge.exposeInMainWorld("educationalAPI", {
  
  // === 📚 GENERACIÓN DE EJERCICIOS ===
  
  /**
   * Generar ejercicios de matemáticas
   * @param {object} options - Opciones para la generación
   * @returns {Promise<Array>} Array de ejercicios generados
   */
  generateMathExercises: async (options = {}) => {
    // Esta función se implementará en el renderer con lógica local
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
  
  /**
   * Evaluar expresión matemática de forma segura
   * @param {string} expression - Expresión a evaluar
   * @returns {number|string} Resultado o error
   */
  evaluateMathExpression: (expression) => {
    try {
      // Lista de funciones matemáticas permitidas
      const allowedFunctions = [
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'sinh', 'cosh', 'tanh', 'log', 'log10', 'log2',
        'exp', 'sqrt', 'abs', 'ceil', 'floor', 'round',
        'pow', 'max', 'min'
      ];
      
      // Sanitizar expresión (eliminar caracteres peligrosos)
      const sanitized = expression
        .replace(/[^0-9+\-*/().,\s]/g, '')
        .replace(/\s+/g, '');
      
      // Usar Function constructor para evaluación segura
      const result = new Function('Math', `return ${sanitized}`)(Math);
      
      return isNaN(result) ? 'Error' : result;
    } catch (error) {
      return 'Error de sintaxis';
    }
  },

  // === ⏱️ TEMPORIZADOR POMODORO ===
  
  /**
   * Iniciar temporizador
   * @param {number} minutes - Minutos del temporizador
   * @param {function} callback - Función a ejecutar cada segundo
   * @returns {number} ID del temporizador
   */
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
  
  /**
   * Detener temporizador
   * @param {number} timerId - ID del temporizador a detener
   */
  stopTimer: (timerId) => {
    clearInterval(timerId);
  },

  // === 📐 CONVERSOR DE UNIDADES ===
  
  /**
   * Convertir unidades
   * @param {number} value - Valor a convertir
   * @param {string} fromUnit - Unidad origen
   * @param {string} toUnit - Unidad destino
   * @returns {number} Valor convertido
   */
  convertUnits: (value, fromUnit, toUnit) => {
    const conversions = {
      // Longitud (metros como base)
      'mm': 0.001, 'cm': 0.01, 'm': 1, 'km': 1000,
      'in': 0.0254, 'ft': 0.3048, 'yd': 0.9144, 'mi': 1609.34,
      
      // Peso (gramos como base)
      'mg': 0.001, 'g': 1, 'kg': 1000,
      'oz': 28.3495, 'lb': 453.592,
      
      // Temperatura (conversiones especiales)
      'C': (val, to) => {
        if (to === 'F') return (val * 9/5) + 32;
        if (to === 'K') return val + 273.15;
        return val;
      },
      'F': (val, to) => {
        if (to === 'C') return (val - 32) * 5/9;
        if (to === 'K') return ((val - 32) * 5/9) + 273.15;
        return val;
      },
      'K': (val, to) => {
        if (to === 'C') return val - 273.15;
        if (to === 'F') return ((val - 273.15) * 9/5) + 32;
        return val;
      }
    };
    
    // Manejar temperaturas
    if (['C', 'F', 'K'].includes(fromUnit)) {
      return conversions[fromUnit](value, toUnit);
    }
    
    // Conversiones estándar
    if (conversions[fromUnit] && conversions[toUnit]) {
      return (value * conversions[fromUnit]) / conversions[toUnit];
    }
    
    return NaN;
  },

  // === 📝 UTILIDADES DE TEXTO ===
  
  /**
   * Contar palabras en un texto
   * @param {string} text - Texto a analizar
   * @returns {object} Estadísticas del texto
   */
  analyzeText: (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      averageWordsPerSentence: sentences > 0 ? Math.round(words.length / sentences) : 0
    };
  }
});

/**
 * 🎨 API para temas y personalización
 */
contextBridge.exposeInMainWorld("themeAPI", {
  
  /**
   * Aplicar tema a la aplicación
   * @param {string} themeName - Nombre del tema ('light', 'dark', 'blue', etc.)
   */
  applyTheme: (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('selectedTheme', themeName);
  },
  
  /**
   * Obtener tema actual
   * @returns {string} Tema actual
   */
  getCurrentTheme: () => {
    return localStorage.getItem('selectedTheme') || 'dark';
  },
  
  /**
   * Obtener temas disponibles
   * @returns {Array} Lista de temas disponibles
   */
  getAvailableThemes: () => {
    return [
      { id: 'dark', name: 'Oscuro', description: 'Tema oscuro para menor fatiga visual' },
      { id: 'light', name: 'Claro', description: 'Tema claro tradicional' },
      { id: 'blue', name: 'Azul', description: 'Tema azul profesional' },
      { id: 'green', name: 'Verde', description: 'Tema verde relajante' }
    ];
  }
});

// === 🔊 NOTIFICACIONES Y FEEDBACK ===

/**
 * Sistema de notificaciones locales
 */
contextBridge.exposeInMainWorld("notificationAPI", {
  
  /**
   * Mostrar notificación
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   * @param {string} type - Tipo ('success', 'error', 'warning', 'info')
   */
  showNotification: (title, message, type = 'info') => {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <h4>${title}</h4>
        <p>${message}</p>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    // Manejar clic en cerrar
    notification.querySelector('.notification-close').onclick = () => {
      notification.parentNode.removeChild(notification);
    };
  },
  
  /**
   * Reproducir sonido de notificación
   * @param {string} type - Tipo de sonido ('success', 'error', 'warning')
   */
  playNotificationSound: (type = 'info') => {
    // Crear contexto de audio para reproducir tonos
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      const AudioCtx = AudioContext || webkitAudioContext;
      const audioContext = new AudioCtx();
      
      const frequencies = {
        success: [523.25, 659.25, 783.99], // Do, Mi, Sol
        error: [220, 185], // La, Fa#
        warning: [440, 554.37], // La, Do#
        info: [440] // La
      };
      
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
