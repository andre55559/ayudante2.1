const { app, BrowserWindow, ipcMain, dialog, screen } = require("electron");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

// Configuración de rutas
const CONFIG_DIR = path.join(app.getPath("userData"), "config");
const DATA_DIR = path.join(app.getPath("userData"), "data");
const LICENSE_FILE = path.join(CONFIG_DIR, "license.json");
const CONFIG_FILE = path.join(CONFIG_DIR, "app_config.json");
const PROGRESS_FILE = path.join(DATA_DIR, "user_progress.json");

// Configuración por defecto
const DEFAULT_CONFIG = {
  licenses: ["AI-2025", "ESCUELA-2025", "LICENSE-OK", "DEMO-2025"],
  theme: "dark",
  language: "es",
  autoSave: true,
  backupInterval: 300000 // 5 minutos
};

let mainWindow = null;

/**
 * Inicializar directorios de la aplicación
 */
async function initializeAppDirectories() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Crear configuración por defecto si no existe
    if (!fsSync.existsSync(CONFIG_FILE)) {
      await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
  } catch (error) {
    console.error("Error al inicializar directorios:", error);
  }
}

/**
 * Cargar configuración de la aplicación
 */
async function loadAppConfig() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
  } catch (error) {
    console.error("Error al cargar configuración:", error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Crear ventana principal con configuración optimizada
 */
async function createWindow() {
  // Obtener tamaño de pantalla para ventana responsive
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  const windowWidth = Math.min(1200, Math.floor(screenWidth * 0.8));
  const windowHeight = Math.min(800, Math.floor(screenHeight * 0.8));

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    center: true,
    show: false, // No mostrar hasta que esté listo
    icon: path.join(__dirname, "public/icons/icon.ico"),
    titleBarStyle: 'default',
    webPreferences: {
      // 🔒 Configuración de seguridad mejorada
      nodeIntegration: false,        // ✅ Seguro
      contextIsolation: true,        // ✅ Seguro
      enableRemoteModule: false,     // ✅ Seguro
      sandbox: false,                // Necesario para preload
      preload: path.join(__dirname, "src/preload.js"),
      webSecurity: true
    }
  });

  // Cargar archivo HTML
  await mainWindow.loadFile(path.join(__dirname, "src/index.html"));

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Verificar licencia al iniciar
    checkExistingLicense();
  });

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // DevTools solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

/**
 * Verificar licencia existente al iniciar
 */
async function checkExistingLicense() {
  try {
    if (fsSync.existsSync(LICENSE_FILE)) {
      const licenseData = await fs.readFile(LICENSE_FILE, "utf-8");
      const { code, date } = JSON.parse(licenseData);
      
      const config = await loadAppConfig();
      
      if (config.licenses.includes(code)) {
        // Verificar si la licencia no ha expirado (opcional)
        const licenseDate = new Date(date);
        const now = new Date();
        const daysDiff = (now - licenseDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 365) { // Licencia válida por 1 año
          mainWindow.webContents.send("license-status", { 
            valid: true, 
            code, 
            daysRemaining: Math.floor(365 - daysDiff)
          });
          return;
        }
      }
    }
    
    // Si llegamos aquí, la licencia no es válida
    mainWindow.webContents.send("license-status", { valid: false });
    
  } catch (error) {
    console.error("Error al verificar licencia:", error);
    mainWindow.webContents.send("license-status", { valid: false, error: error.message });
  }
}

/**
 * Inicialización de la aplicación
 */
app.whenReady().then(async () => {
  await initializeAppDirectories();
  await createWindow();
  
  // macOS: Re-crear ventana cuando se hace clic en el dock
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

// Cerrar aplicación cuando todas las ventanas se cierran (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// === 🔧 MANEJADORES IPC OPTIMIZADOS ===

/**
 * Validar y guardar licencia con manejo de errores robusto
 */
ipcMain.handle("validate-license", async (event, code) => {
  try {
    if (!code || typeof code !== 'string') {
      return { 
        success: false, 
        error: "Código de licencia inválido" 
      };
    }

    const config = await loadAppConfig();
    
    if (config.licenses.includes(code.trim().toUpperCase())) {
      // Crear objeto de licencia con metadatos
      const licenseData = {
        code: code.trim().toUpperCase(),
        date: new Date().toISOString(),
        deviceId: require('os').hostname(),
        version: app.getVersion()
      };

      await fs.writeFile(LICENSE_FILE, JSON.stringify(licenseData, null, 2));
      
      return { 
        success: true, 
        message: "Licencia activada correctamente",
        data: licenseData
      };
    } else {
      return { 
        success: false, 
        error: "Código de licencia no válido" 
      };
    }
  } catch (error) {
    console.error("Error al validar licencia:", error);
    return { 
      success: false, 
      error: "Error interno al procesar la licencia" 
    };
  }
});

/**
 * Obtener configuración de la aplicación
 */
ipcMain.handle("get-app-config", async () => {
  try {
    return await loadAppConfig();
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return DEFAULT_CONFIG;
  }
});

/**
 * Guardar configuración de la aplicación
 */
ipcMain.handle("save-app-config", async (event, newConfig) => {
  try {
    const currentConfig = await loadAppConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    await fs.writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    return { success: false, error: error.message };
  }
});

/**
 * Obtener progreso del usuario
 */
ipcMain.handle("get-user-progress", async () => {
  try {
    if (fsSync.existsSync(PROGRESS_FILE)) {
      const progressData = await fs.readFile(PROGRESS_FILE, "utf-8");
      return JSON.parse(progressData);
    }
    
    // Progreso por defecto
    const defaultProgress = {
      totalStudyTime: 0,
      exercisesCompleted: 0,
      lastSession: null,
      subjects: {
        matematicas: { time: 0, exercises: 0 },
        español: { time: 0, exercises: 0 },
        ciencias: { time: 0, exercises: 0 }
      }
    };
    
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(defaultProgress, null, 2));
    return defaultProgress;
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    return null;
  }
});

/**
 * Actualizar progreso del usuario
 */
ipcMain.handle("update-user-progress", async (event, progressUpdate) => {
  try {
    const currentProgress = await ipcMain.handle("get-user-progress");
    const updatedProgress = { ...currentProgress, ...progressUpdate };
    
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(updatedProgress, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar progreso:", error);
    return { success: false, error: error.message };
  }
});

/**
 * Mostrar diálogo de selección de archivos
 */
ipcMain.handle("show-file-dialog", async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] },
        { name: 'Todos los archivos', extensions: ['*'] }
      ],
      ...options
    });
    
    return result;
  } catch (error) {
    console.error("Error al mostrar diálogo:", error);
    return { canceled: true, error: error.message };
  }
});

/**
 * Crear backup de datos
 */
ipcMain.handle("create-backup", async () => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      config: await loadAppConfig(),
      progress: await fs.readFile(PROGRESS_FILE, "utf-8").catch(() => "{}"),
      license: await fs.readFile(LICENSE_FILE, "utf-8").catch(() => "{}")
    };
    
    const backupFile = path.join(DATA_DIR, `backup_${Date.now()}.json`);
    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
    
    return { success: true, file: backupFile };
  } catch (error) {
    console.error("Error al crear backup:", error);
    return { success: false, error: error.message };
  }
});

// Backup automático cada 5 minutos
setInterval(async () => {
  const config = await loadAppConfig();
  if (config.autoSave) {
    await ipcMain.handle("create-backup");
  }
}, DEFAULT_CONFIG.backupInterval);

console.log("🚀 AsistenteEscolarAI iniciado con optimizaciones de seguridad y funcionalidades avanzadas");
