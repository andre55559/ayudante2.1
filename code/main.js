const { app, BrowserWindow, ipcMain, dialog, screen, globalShortcut, clipboard } = require("electron");
const fs = require("fs").promises;
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
let fieldDetectorScriptContent = '';

async function initializeAppDirectories() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(CONFIG_FILE);
    } catch (error) {
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
    let licenseDataJson;
    try {
        licenseDataJson = await fs.readFile(LICENSE_FILE, "utf-8");
    } catch (readError) {
        mainWindow.webContents.send("license-status", { valid: false });
        return;
    }
    const { code, date } = JSON.parse(licenseDataJson);
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
    mainWindow.webContents.send("license-status", { valid: false });
  } catch (error) {
    console.error("Error al verificar licencia:", error);
    mainWindow.webContents.send("license-status", { valid: false, error: error.message });
  }
}

app.whenReady().then(async () => {
  store = new Store();
  await initializeAppDirectories();

  try {
    fieldDetectorScriptContent = await fs.readFile(path.join(__dirname, 'src/scripts/field_detector.js'), 'utf-8');
    console.log('field_detector.js script loaded successfully.');
  } catch (err) {
    console.error('Failed to load field_detector.js script at startup:', err);
  }

  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });

  const captureShortcutRet = globalShortcut.register('CommandOrControl+Shift+Q', async () => {
    console.log('Global shortcut CommandOrControl+Shift+Q pressed. Attempting to capture highlighted text.');
    let selectedText = '';
    let targetFieldInfo = null;
    const webInteractionEnabled = store.get('enable_web_interaction', false);

    if (webInteractionEnabled && mainWindow && mainWindow.webContents && fieldDetectorScriptContent) {
      try {
        console.log('Executing field_detector.js content script...');
        const detectionResult = await mainWindow.webContents.executeJavaScript(fieldDetectorScriptContent);
        if (detectionResult && detectionResult.success) {
          targetFieldInfo = detectionResult;
          console.log('Field detector script succeeded:', targetFieldInfo);
        } else if (detectionResult && detectionResult.error) {
          console.log('Field detector script reported an error:', detectionResult.error);
        }
      } catch (err) {
        console.error('Error executing field_detector.js script:', err);
      }
    }

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
        mainWindow.webContents.send('captured-text-for-ai', {
          text: selectedText,
          targetField: targetFieldInfo
        });
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

  const typeShortcutRet = globalShortcut.register('CommandOrControl+Shift+T', () => {
    console.log('Global shortcut CommandOrControl+Shift+T pressed (for typing answer)');
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('trigger-type-answer-hotkey');
    }
  });

  if (!typeShortcutRet) {
    console.error('Failed to register global shortcut CommandOrControl+Shift+T');
  }
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
    await fs.access(PROGRESS_FILE);
    const progressData = await fs.readFile(PROGRESS_FILE, "utf-8");
    return JSON.parse(progressData);
  } catch (error) {
    const defaultProgress = { totalStudyTime: 0, exercisesCompleted: 0, lastSession: null, subjects: { matematicas: { time: 0, exercises: 0 }, español: { time: 0, exercises: 0 }, ciencias: { time: 0, exercises: 0 } } };
    try {
        await fs.writeFile(PROGRESS_FILE, JSON.stringify(defaultProgress, null, 2));
    } catch (writeError) {
        console.error("Error writing default progress file:", writeError);
    }
    return defaultProgress;
  }
});

ipcMain.handle("update-user-progress", async (event, progressUpdate) => {
  try {
    const currentProgress = await ipcMain.handle("get-user-progress");
    const updatedProgress = { ...currentProgress, ...progressUpdate };
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(updatedProgress, null, 2));
    return { success: true };
  } catch (error) { console.error("Error al actualizar progreso:", error); return { success: false, error: error.message }; }
});

// === OPEN EPUB FILE HANDLER ===
ipcMain.handle('open-epub-file', async () => {
  if (!mainWindow) {
    return { success: false, error: 'Main window not available.', filePaths: null };
  }
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open EPUB File',
      properties: ['openFile'],
      filters: [
        { name: 'EPUB Files', extensions: ['epub'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      console.log('EPUB file selection was canceled.');
      return { success: false, error: 'File selection canceled.', filePaths: null };
    } else {
      console.log('EPUB file selected:', result.filePaths[0]);
      return { success: true, filePath: result.filePaths[0] };
    }
  } catch (error) {
    console.error('Error showing open EPUB dialog:', error);
    return { success: false, error: `Error opening file dialog: ${error.message}`, filePaths: null };
  }
});

ipcMain.handle("show-file-dialog", async (event, options) => { // This was an older generic one, ensure it's distinct or integrated if needed.
                                                              // For EPUB, the new one is specific. This one might be for OCR or other purposes.
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

// === WEB INTERACTION SETTING HANDLERS ===
ipcMain.handle('save-web-interaction-setting', async (event, isEnabled) => {
  try {
    if (typeof isEnabled !== 'boolean') { return { success: false, error: 'Invalid value for setting.' }; }
    store.set('enable_web_interaction', isEnabled);
    console.log('Web interaction setting saved:', isEnabled);
    return { success: true };
  } catch (error) { console.error('Error saving web interaction setting:', error); return { success: false, error: error.message }; }
});

ipcMain.handle('load-web-interaction-setting', async () => {
  try {
    const isEnabled = store.get('enable_web_interaction', false);
    return { success: true, isEnabled: isEnabled };
  } catch (error) { console.error('Error loading web interaction setting:', error); return { success: false, error: error.message, isEnabled: false }; }
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

// === TYPE INTO WEB CONTENT FIELD HANDLER ===
ipcMain.handle('type-into-web-content-field', async (event, { selector, textToType }) => {
  if (!mainWindow || !mainWindow.webContents) {
    return { success: false, error: 'Main window not available.' };
  }
  if (typeof selector !== 'string' || typeof textToType !== 'string') {
    return { success: false, error: 'Invalid selector or text format.' };
  }

  try {
    console.log(`Attempting to type into web field with selector: ${selector}`);
    const script = `
      (() => {
        const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
        if (element) {
          element.focus();
          if (typeof element.value !== 'undefined') {
            element.value = '${textToType.replace(/'/g, "\\'").replace(/\n/g, '\\n')}';
          } else if (element.isContentEditable) {
            element.textContent = '${textToType.replace(/'/g, "\\'").replace(/\n/g, '\\n')}';
          } else {
            return { success: false, error: 'Element is not an input, textarea, or contenteditable.' };
          }
          return { success: true, message: 'Text set in web field.' };
        } else {
          return { success: false, error: 'Element with selector "${selector.replace(/'/g, "\\'")}" not found in web page.' };
        }
      })();
    `;
    const result = await mainWindow.webContents.executeJavaScript(script);
    return result;
  } catch (error) {
    console.error('Error executing script to type into web field:', error);
    return { success: false, error: `Failed to type into web field: ${error.message}` };
  }
});

console.log("🚀 AsistenteEscolarAI iniciado con optimizaciones de seguridad y funcionalidades avanzadas");
