const { app, BrowserWindow, ipcMain, dialog, screen, globalShortcut, clipboard } = require("electron");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const Store = require('electron-store');
const { OpenAI } = require("openai");
const robot = require("robotjs");

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
let store;

async function initializeAppDirectories() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.mkdir(DATA_DIR, { recursive: true });
    if (!fsSync.existsSync(CONFIG_FILE)) {
      await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
  } catch (error) {
    console.error("Error al inicializar directorios:", error);
  }
}

async function loadAppConfig() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
  } catch (error) {
    console.error("Error al cargar configuración:", error);
    return DEFAULT_CONFIG;
  }
}

async function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = Math.min(1200, Math.floor(screenWidth * 0.8));
  const windowHeight = Math.min(800, Math.floor(screenHeight * 0.8));

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    center: true,
    show: false,
    icon: path.join(__dirname, "public/icons/icon.ico"),
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false,
      preload: path.join(__dirname, "src/preload.js"),
      webSecurity: true
    }
  });

  await mainWindow.loadFile(path.join(__dirname, "src/index.html"));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    checkExistingLicense();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

async function checkExistingLicense() {
  try {
    if (fsSync.existsSync(LICENSE_FILE)) {
      const licenseData = await fs.readFile(LICENSE_FILE, "utf-8");
      const { code, date } = JSON.parse(licenseData);
      const config = await loadAppConfig();
      if (config.licenses.includes(code)) {
        const licenseDate = new Date(date);
        const now = new Date();
        const daysDiff = (now - licenseDate) / (1000 * 60 * 60 * 24);
        if (daysDiff < 365) {
          mainWindow.webContents.send("license-status", {
            valid: true,
            code,
            daysRemaining: Math.floor(365 - daysDiff)
          });
          return;
        }
      }
    }
    mainWindow.webContents.send("license-status", { valid: false });
  } catch (error) {
    console.error("Error al verificar licencia:", error);
    mainWindow.webContents.send("license-status", { valid: false, error: error.message });
  }
}

app.whenReady().then(async () => {
  store = new Store();
  await initializeAppDirectories();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });

  // Register global shortcut for capturing text
  const captureShortcutRet = globalShortcut.register('CommandOrControl+Shift+Q', async () => {
    console.log('Global shortcut CommandOrControl+Shift+Q pressed. Attempting to capture highlighted text.');
    let selectedText = '';
    const originalClipboardText = clipboard.readText();
    const originalClipboardHTML = clipboard.readHTML();
    clipboard.clear();
    try {
      const modifier = process.platform === 'darwin' ? 'command' : 'control';
      robot.keyTap('c', modifier);
      await new Promise(resolve => setTimeout(resolve, 200));
      selectedText = clipboard.readText();
      if (originalClipboardHTML && originalClipboardHTML.length > 0) {
          clipboard.write({ text: originalClipboardText, html: originalClipboardHTML });
      } else if (originalClipboardText && originalClipboardText.length > 0) {
          clipboard.writeText(originalClipboardText);
      } else {
          clipboard.clear();
      }
    } catch (error) {
      console.error('Error during robotjs copy or clipboard operations:', error);
      if (originalClipboardHTML && originalClipboardHTML.length > 0) {
          clipboard.write({ text: originalClipboardText, html: originalClipboardHTML });
      } else if (originalClipboardText && originalClipboardText.length > 0) {
          clipboard.writeText(originalClipboardText);
      } else {
          clipboard.clear();
      }
    }

    if (selectedText && selectedText.trim().length > 0) {
      console.log('Captured text:', selectedText);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('captured-text-for-ai', selectedText);
      }
    } else {
      console.log('No text captured or selection was empty.');
      if (mainWindow && mainWindow.webContents) {
         mainWindow.webContents.send('no-text-captured-for-ai');
      }
    }
  });

  if (!captureShortcutRet) {
    console.error('Failed to register global shortcut CommandOrControl+Shift+Q');
  }

  // Register global shortcut for typing the answer
  const typeShortcutRet = globalShortcut.register('CommandOrControl+Shift+T', () => {
    console.log('Global shortcut CommandOrControl+Shift+T pressed (for typing answer)');
    if (mainWindow && mainWindow.webContents) {
      // Send a message to the renderer to trigger the typing action
      mainWindow.webContents.send('trigger-type-answer-hotkey');
    }
  });

  if (!typeShortcutRet) {
    console.error('Failed to register global shortcut CommandOrControl+Shift+T');
  }
  // console.log('Is CommandOrControl+Shift+Q registered?', globalShortcut.isRegistered('CommandOrControl+Shift+Q'));
  // console.log('Is CommandOrControl+Shift+T registered?', globalShortcut.isRegistered('CommandOrControl+Shift+T'));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  console.log('Global shortcuts unregistered.');
});

// === 🔧 MANEJADORES IPC OPTIMIZADOS ===
ipcMain.handle("validate-license", async (event, code) => {
  try {
    if (!code || typeof code !== 'string') { return { success: false, error: "Código de licencia inválido" }; }
    const config = await loadAppConfig();
    if (config.licenses.includes(code.trim().toUpperCase())) {
      const licenseData = { code: code.trim().toUpperCase(), date: new Date().toISOString(), deviceId: require('os').hostname(), version: app.getVersion() };
      await fs.writeFile(LICENSE_FILE, JSON.stringify(licenseData, null, 2));
      return { success: true, message: "Licencia activada correctamente", data: licenseData };
    } else { return { success: false, error: "Código de licencia no válido" }; }
  } catch (error) { console.error("Error al validar licencia:", error); return { success: false, error: "Error interno al procesar la licencia" }; }
});

ipcMain.handle("get-app-config", async () => {
  try { return await loadAppConfig(); } catch (error) { console.error("Error al obtener configuración:", error); return DEFAULT_CONFIG; }
});

ipcMain.handle("save-app-config", async (event, newConfig) => {
  try {
    const currentConfig = await loadAppConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    return { success: true };
  } catch (error) { console.error("Error al guardar configuración:", error); return { success: false, error: error.message }; }
});

ipcMain.handle("get-user-progress", async () => {
  try {
    if (fsSync.existsSync(PROGRESS_FILE)) {
      const progressData = await fs.readFile(PROGRESS_FILE, "utf-8");
      return JSON.parse(progressData);
    }
    const defaultProgress = { totalStudyTime: 0, exercisesCompleted: 0, lastSession: null, subjects: { matematicas: { time: 0, exercises: 0 }, español: { time: 0, exercises: 0 }, ciencias: { time: 0, exercises: 0 } } };
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(defaultProgress, null, 2));
    return defaultProgress;
  } catch (error) { console.error("Error al obtener progreso:", error); return null; }
});

ipcMain.handle("update-user-progress", async (event, progressUpdate) => {
  try {
    const currentProgress = await ipcMain.handle("get-user-progress");
    const updatedProgress = { ...currentProgress, ...progressUpdate };
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(updatedProgress, null, 2));
    return { success: true };
  } catch (error) { console.error("Error al actualizar progreso:", error); return { success: false, error: error.message }; }
});

ipcMain.handle("show-file-dialog", async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [ { name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] }, { name: 'Todos los archivos', extensions: ['*'] } ], ...options });
    return result;
  } catch (error) { console.error("Error al mostrar diálogo:", error); return { canceled: true, error: error.message }; }
});

ipcMain.handle("create-backup", async () => {
  try {
    const backupData = { timestamp: new Date().toISOString(), config: await loadAppConfig(), progress: await fs.readFile(PROGRESS_FILE, "utf-8").catch(() => "{}"), license: await fs.readFile(LICENSE_FILE, "utf-8").catch(() => "{}") };
    const backupFile = path.join(DATA_DIR, `backup_${Date.now()}.json`);
    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
    return { success: true, file: backupFile };
  } catch (error) { console.error("Error al crear backup:", error); return { success: false, error: error.message }; }
});

setInterval(async () => {
  const config = await loadAppConfig();
  if (config.autoSave) {
    await ipcMain.handle("create-backup");
  }
}, DEFAULT_CONFIG.backupInterval);

// === API KEY HANDLERS ===
ipcMain.handle('save-api-key', async (event, apiKey) => {
  try {
    if (typeof apiKey !== 'string') { return { success: false, error: 'Invalid API Key format' }; }
    store.set('openai_api_key', apiKey);
    return { success: true };
  } catch (error) { console.error("Error saving API key:", error); return { success: false, error: error.message }; }
});

ipcMain.handle('load-api-key', async () => {
  try {
    const apiKey = store.get('openai_api_key');
    return { success: true, apiKey: apiKey || '' };
  } catch (error) { console.error("Error loading API key:", error); return { success: false, error: error.message, apiKey: '' }; }
});

// === OPENAI COMPLETION HANDLER ===
ipcMain.handle('get-openai-completion', async (event, userPrompt) => {
  console.log(`OpenAI completion request received for prompt: "${userPrompt.substring(0, 50)}..."`);
  const retrievedApiKey = store.get('openai_api_key');
  if (!retrievedApiKey) {
    console.warn('OpenAI API key not found in store.');
    return { success: false, error: 'OpenAI API key not set. Please set it in settings.' };
  }
  const openai = new OpenAI({ apiKey: retrievedApiKey });
  try {
    console.log('Sending request to OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userPrompt }],
    });
    const assistantResponse = completion.choices[0]?.message?.content?.trim();
    if (assistantResponse) {
      console.log('OpenAI response received successfully.');
      return { success: true, response: assistantResponse };
    } else {
      console.warn('No response content from OpenAI.');
      return { success: false, error: 'No response content from OpenAI.' };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error.message, error.status ? `Status: ${error.status}` : '');
    if (error.status === 401) {
        return { success: false, error: 'OpenAI API key is invalid or has insufficient credits.' };
    }
    return { success: false, error: `OpenAI API error: ${error.message}` };
  }
});

// === TYPE TEXT AT CURSOR HANDLER ===
ipcMain.handle('type-text-at-cursor', async (event, textToType) => {
  if (typeof textToType !== 'string') {
    console.error('Invalid textToType received:', textToType);
    return { success: false, error: 'Invalid text format received.' };
  }
  try {
    console.log(`Attempting to type text: "${textToType.substring(0, 30)}..."`);
    robot.typeString(textToType);
    return { success: true };
  } catch (error) {
    console.error('Error during robot.typeString:', error);
    return { success: false, error: `Failed to type text: ${error.message}` };
  }
});

console.log("🚀 AsistenteEscolarAI iniciado con optimizaciones de seguridad y funcionalidades avanzadas");
