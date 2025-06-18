// 🛠️ AsistenteEscolarAI - Utilidades Generales
// Archivo: scripts/utils.js

/**
 * 🎓 Generador de Ejercicios Educativos
 */
const ExerciseGenerator = {
  mathematics: {
    arithmetic: {
      easy: {
        addition: () => {
          const a = Math.floor(Math.random() * 20) + 1;
          const b = Math.floor(Math.random() * 20) + 1;
          return {
            question: `¿Cuánto es ${a} + ${b}?`,
            answer: a + b,
            type: 'suma',
            difficulty: 'fácil'
          };
        },
        subtraction: () => {
          const a = Math.floor(Math.random() * 50) + 20;
          const b = Math.floor(Math.random() * 20) + 1;
          return {
            question: `¿Cuánto es ${a} - ${b}?`,
            answer: a - b,
            type: 'resta',
            difficulty: 'fácil'
          };
        },
        multiplication: () => {
          const a = Math.floor(Math.random() * 10) + 1;
          const b = Math.floor(Math.random() * 10) + 1;
          return {
            question: `¿Cuánto es ${a} × ${b}?`,
            answer: a * b,
            type: 'multiplicación',
            difficulty: 'fácil'
          };
        }
      },
      medium: {
        addition: () => {
          const a = Math.floor(Math.random() * 500) + 50;
          const b = Math.floor(Math.random() * 500) + 50;
          return {
            question: `¿Cuánto es ${a} + ${b}?`,
            answer: a + b,
            type: 'suma',
            difficulty: 'medio'
          };
        },
        division: () => {
          const b = Math.floor(Math.random() * 9) + 2;
          const answer = Math.floor(Math.random() * 20) + 1;
          const a = b * answer;
          return {
            question: `¿Cuánto es ${a} ÷ ${b}?`,
            answer: answer,
            type: 'división',
            difficulty: 'medio'
          };
        },
        percentage: () => {
          const percentage = [10, 15, 20, 25, 30, 50, 75][Math.floor(Math.random() * 7)];
          const number = Math.floor(Math.random() * 200) + 50;
          return {
            question: `¿Cuánto es el ${percentage}% de ${number}?`,
            answer: (number * percentage) / 100,
            type: 'porcentaje',
            difficulty: 'medio'
          };
        }
      },
      hard: {
        quadratic: () => {
          const a = Math.floor(Math.random() * 3) + 1;
          const b = Math.floor(Math.random() * 10) - 5;
          const c = Math.floor(Math.random() * 10) - 5;
          return {
            question: `Resuelve: ${a}x² + ${b}x + ${c} = 0`,
            answer: `Use la fórmula cuadrática`,
            type: 'ecuación cuadrática',
            difficulty: 'difícil',
            hint: 'x = (-b ± √(b²-4ac)) / 2a'
          };
        },
        trigonometry: () => {
          const angles = [30, 45, 60, 90];
          const functions = ['sin', 'cos', 'tan'];
          const angle = angles[Math.floor(Math.random() * angles.length)];
          const func = functions[Math.floor(Math.random() * functions.length)];
          
          const answers = {
            'sin30': 0.5, 'sin45': Math.sqrt(2)/2, 'sin60': Math.sqrt(3)/2, 'sin90': 1,
            'cos30': Math.sqrt(3)/2, 'cos45': Math.sqrt(2)/2, 'cos60': 0.5, 'cos90': 0,
            'tan30': 1/Math.sqrt(3), 'tan45': 1, 'tan60': Math.sqrt(3), 'tan90': 'indefinido'
          };
          
          return {
            question: `¿Cuánto es ${func}(${angle}°)?`,
            answer: answers[func + angle],
            type: 'trigonometría',
            difficulty: 'difícil'
          };
        }
      }
    }
  },
  
  spanish: {
    grammar: {
      verbs: () => {
        const verbs = [
          { infinitive: 'comer', conjugated: 'comió', tense: 'pretérito' },
          { infinitive: 'vivir', conjugated: 'vivimos', tense: 'presente' },
          { infinitive: 'hablar', conjugated: 'hablarán', tense: 'futuro' },
          { infinitive: 'escribir', conjugated: 'escribía', tense: 'imperfecto' }
        ];
        
        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        return {
          question: `¿En qué tiempo verbal está "${verb.conjugated}"?`,
          answer: verb.tense,
          type: 'conjugación verbal',
          difficulty: 'medio',
          hint: `Del verbo "${verb.infinitive}"`
        };
      },
      
      synonyms: () => {
        const synonymPairs = [
          ['grande', 'enorme'], ['pequeño', 'diminuto'], ['bonito', 'hermoso'],
          ['rápido', 'veloz'], ['inteligente', 'listo'], ['triste', 'melancólico']
        ];
        
        const pair = synonymPairs[Math.floor(Math.random() * synonymPairs.length)];
        const [word, synonym] = Math.random() > 0.5 ? pair : [pair[1], pair[0]];
        
        return {
          question: `¿Cuál es un sinónimo de "${word}"?`,
          answer: synonym,
          type: 'sinónimos',
          difficulty: 'fácil'
        };
      }
    }
  }
};

/**
 * 📝 Analizador de Texto Avanzado
 */
function analyzeText() {
  const textInput = document.getElementById('textInput');
  if (!textInput) return;
  
  const text = textInput.value;
  
  // Usar la API del preload si está disponible
  let analysis;
  if (window.educationalAPI && window.educationalAPI.analyzeText) {
    analysis = window.educationalAPI.analyzeText(text);
  } else {
    // Fallback analysis
    analysis = performBasicTextAnalysis(text);
  }
  
  // Actualizar display de estadísticas
  updateTextStats(analysis);
  
  // Log de actividad si hay texto
  if (text.trim().length > 0) {
    logActivity(`📝 Texto analizado: ${analysis.words} palabras, ${analysis.sentences} oraciones`);
  }
}

function performBasicTextAnalysis(text) {
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
    averageWordsPerSentence: sentences > 0 ? Math.round(words.length / sentences) : 0,
    readingTime: Math.ceil(words.length / 200), // 200 palabras por minuto
    complexity: calculateTextComplexity(words, sentences)
  };
}

function calculateTextComplexity(words, sentences) {
  if (sentences === 0 || words.length === 0) return 'Sin datos';
  
  const avgWordsPerSentence = words.length / sentences;
  const avgSyllablesPerWord = words.reduce((sum, word) => sum + countSyllables(word), 0) / words.length;
  
  // Fórmula simplificada de legibilidad
  const complexity = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;
  
  if (complexity <= 30) return 'Muy fácil';
  if (complexity <= 50) return 'Fácil';
  if (complexity <= 60) return 'Medio';
  if (complexity <= 70) return 'Difícil';
  return 'Muy difícil';
}

function countSyllables(word) {
  // Aproximación simple para contar sílabas en español
  const vowels = word.toLowerCase().match(/[aeiouáéíóúü]/g);
  return vowels ? vowels.length : 1;
}

function updateTextStats(analysis) {
  const elements = {
    wordCount: 'words',
    charCount: 'characters',
    sentenceCount: 'sentences',
    paragraphCount: 'paragraphs'
  };
  
  Object.keys(elements).forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = analysis[elements[elementId]] || 0;
    }
  });
  
  // Mostrar información adicional si existe
  if (analysis.readingTime) {
    console.log(`📖 Tiempo de lectura estimado: ${analysis.readingTime} minutos`);
  }
  
  if (analysis.complexity) {
    console.log(`🎯 Complejidad del texto: ${analysis.complexity}`);
  }
}

/**
 * 🎲 Generador de Ejercicios
 */
function generateExercise(subject = 'mathematics', difficulty = 'medium') {
  try {
    let exercise;
    
    if (subject === 'mathematics') {
      const types = Object.keys(ExerciseGenerator.mathematics.arithmetic[difficulty]);
      const randomType = types[Math.floor(Math.random() * types.length)];
      exercise = ExerciseGenerator.mathematics.arithmetic[difficulty][randomType]();
    } else if (subject === 'spanish') {
      const types = Object.keys(ExerciseGenerator.spanish.grammar);
      const randomType = types[Math.floor(Math.random() * types.length)];
      exercise = ExerciseGenerator.spanish.grammar[randomType]();
    } else {
      // Ejercicio por defecto
      exercise = ExerciseGenerator.mathematics.arithmetic.medium.addition();
    }
    
    // Añadir ID único y timestamp
    exercise.id = Date.now();
    exercise.timestamp = new Date().toISOString();
    exercise.subject = subject;
    
    // Mostrar ejercicio
    displayExercise(exercise);
    
    // Log de actividad
    logActivity(`📚 Ejercicio generado: ${exercise.type} (${exercise.difficulty})`);
    
    return exercise;
  } catch (error) {
    console.error('Error al generar ejercicio:', error);
    showNotification('Error', 'No se pudo generar el ejercicio', 'error');
    return null;
  }
}

function displayExercise(exercise) {
  const exerciseHtml = `
    <div class="exercise-card" data-exercise-id="${exercise.id}">
      <div class="exercise-header">
        <span class="exercise-type">${exercise.type}</span>
        <span class="exercise-difficulty">${exercise.difficulty}</span>
      </div>
      <div class="exercise-question">
        ${exercise.question}
      </div>
      ${exercise.hint ? `<div class="exercise-hint">💡 ${exercise.hint}</div>` : ''}
      <div class="exercise-controls">
        <input type="text" class="exercise-answer" placeholder="Tu respuesta...">
        <button onclick="checkExerciseAnswer(${exercise.id}, '${exercise.answer}')" class="btn btn-primary">
          Verificar
        </button>
      </div>
    </div>
  `;
  
  // Buscar contenedor de ejercicios o crear notificación
  let exerciseContainer = document.getElementById('exerciseContainer');
  if (!exerciseContainer) {
    // Si no hay contenedor, mostrar en notificación
    showNotification('Ejercicio Generado', exercise.question, 'info');
    console.log('📚 Ejercicio:', exercise.question, 'Respuesta:', exercise.answer);
  } else {
    exerciseContainer.innerHTML = exerciseHtml;
  }
}

function checkExerciseAnswer(exerciseId, correctAnswer) {
  const exerciseCard = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
  if (!exerciseCard) return;
  
  const answerInput = exerciseCard.querySelector('.exercise-answer');
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correct = userAnswer === String(correctAnswer).toLowerCase();
  
  // Mostrar resultado
  const resultClass = correct ? 'correct' : 'incorrect';
  const resultMessage = correct ? '✅ ¡Correcto!' : `❌ Incorrecto. La respuesta es: ${correctAnswer}`;
  
  answerInput.classList.add(resultClass);
  showNotification('Resultado', resultMessage, correct ? 'success' : 'error');
  
  // Actualizar progreso si es correcto
  if (correct) {
    updateExerciseProgress();
  }
  
  // Log de actividad
  logActivity(`📝 Ejercicio ${correct ? 'correcto' : 'incorrecto'}: ${userAnswer}`);
}

async function updateExerciseProgress() {
  try {
    const currentProgress = AppState.progress || {};
    const newProgress = {
      exercisesCompleted: (currentProgress.exercisesCompleted || 0) + 1,
      lastExerciseDate: new Date().toISOString()
    };
    
    if (window.updateUserProgress) {
      await window.updateUserProgress(newProgress);
    }
    
    // Actualizar display del dashboard
    if (window.updateDashboardStats) {
      window.updateDashboardStats();
    }
  } catch (error) {
    console.error('Error al actualizar progreso de ejercicios:', error);
  }
}

/**
 * 📷 Funcionalidad OCR (Placeholder)
 */
async function openOCR() {
  try {
    // Mostrar diálogo de selección de archivo
    if (window.electronAPI && window.electronAPI.showFileDialog) {
      const result = await window.electronAPI.showFileDialog({
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] }
        ]
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        const imagePath = result.filePaths[0];
        await processImageOCR(imagePath);
      }
    } else {
      // Fallback: mostrar instrucciones
      showNotification(
        'OCR - Escanear Texto',
        'Función OCR disponible. Selecciona una imagen para extraer texto.',
        'info'
      );
    }
    
    logActivity('📷 OCR activado');
  } catch (error) {
    console.error('Error al abrir OCR:', error);
    showNotification('Error', 'No se pudo activar la función OCR', 'error');
  }
}

async function processImageOCR(imagePath) {
  try {
    showNotification('OCR', 'Procesando imagen... Esto puede tomar unos momentos.', 'info');
    
    // Aquí se integraría tesseract.js si está disponible
    // Por ahora, simulamos el proceso
    setTimeout(() => {
      showNotification(
        'OCR Completado',
        'Texto extraído de la imagen (función en desarrollo)',
        'success'
      );
      logActivity(`📷 OCR procesado: ${imagePath}`);
    }, 2000);
    
  } catch (error) {
    console.error('Error en OCR:', error);
    showNotification('Error OCR', 'No se pudo procesar la imagen', 'error');
  }
}

/**
 * 🔧 Utilidades de Herramientas
 */
function initializeTools() {
  // Inicializar calculadora
  if (typeof initializeCalculator === 'function') {
    initializeCalculator();
  }
  
  // Inicializar temporizador
  if (typeof initializeTimer === 'function') {
    initializeTimer();
  }
  
  // Inicializar conversor
  if (typeof initializeUnitConverter === 'function') {
    initializeUnitConverter();
  }
  
  console.log('🛠️ Herramientas inicializadas');
}

/**
 * 📊 Funciones de Estadísticas
 */
function getUsageStatistics() {
  const stats = {
    totalSessions: parseInt(localStorage.getItem('totalSessions') || '0'),
    totalStudyTime: parseInt(localStorage.getItem('totalStudyTime') || '0'),
    exercisesCompleted: parseInt(localStorage.getItem('exercisesCompleted') || '0'),
    calculatorUsage: parseInt(localStorage.getItem('calculatorUsage') || '0'),
    timerUsage: parseInt(localStorage.getItem('timerUsage') || '0'),
    converterUsage: parseInt(localStorage.getItem('converterUsage') || '0')
  };
  
  return stats;
}

function incrementUsageCounter(tool) {
  const key = `${tool}Usage`;
  const currentCount = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, String(currentCount + 1));
}

/**
 * 🎯 Funciones de Acceso Rápido
 */
function openCalculator() {
  switchTab('tools');
  
  // Scroll a la calculadora
  setTimeout(() => {
    const calculator = document.querySelector('.calculator');
    if (calculator) {
      calculator.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Enfocar display
      const display = document.getElementById('calcDisplay');
      if (display) {
        display.focus();
      }
    }
  }, 300);
  
  incrementUsageCounter('calculator');
  logActivity('🧮 Calculadora abierta');
}

/**
 * 🎲 Funciones de Gamificación
 */
const AchievementSystem = {
  achievements: {
    firstExercise: { name: 'Primer Ejercicio', description: 'Completa tu primer ejercicio', icon: '🎯' },
    mathWiz: { name: 'Mago de las Matemáticas', description: 'Completa 10 ejercicios de matemáticas', icon: '🧙' },
    timeManager: { name: 'Gestor del Tiempo', description: 'Usa el temporizador Pomodoro 5 veces', icon: '⏰' },
    converter: { name: 'Conversor Experto', description: 'Realiza 20 conversiones de unidades', icon: '📐' }
  },
  
  checkAchievements() {
    const stats = getUsageStatistics();
    const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    
    // Verificar logros
    if (stats.exercisesCompleted >= 1 && !unlockedAchievements.includes('firstExercise')) {
      this.unlockAchievement('firstExercise');
    }
    
    if (stats.exercisesCompleted >= 10 && !unlockedAchievements.includes('mathWiz')) {
      this.unlockAchievement('mathWiz');
    }
    
    if (stats.timerUsage >= 5 && !unlockedAchievements.includes('timeManager')) {
      this.unlockAchievement('timeManager');
    }
    
    if (stats.converterUsage >= 20 && !unlockedAchievements.includes('converter')) {
      this.unlockAchievement('converter');
    }
  },
  
  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return;
    
    // Guardar logro
    const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    unlockedAchievements.push(achievementId);
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    
    // Mostrar notificación
    showNotification(
      'Logro Desbloqueado',
      `${achievement.icon} ${achievement.name}: ${achievement.description}`,
      'success'
    );
    
    // Sonido de logro
    if (AppState.sounds && window.notificationAPI) {
      window.notificationAPI.playNotificationSound('success');
    }
    
    logActivity(`🏆 Logro desbloqueado: ${achievement.name}`);
  }
};

/**
 * 🎪 Efectos Visuales y Animaciones
 */
function addVisualFeedback(element, type = 'success') {
  if (!element) return;
  
  const effectClass = type === 'success' ? 'success-flash' : 'error-flash';
  element.classList.add(effectClass);
  
  setTimeout(() => {
    element.classList.remove(effectClass);
  }, 600);
}

function showLoadingIndicator(show = true) {
  let indicator = document.getElementById('globalLoadingIndicator');
  
  if (show) {
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'globalLoadingIndicator';
      indicator.className = 'loading-indicator';
      indicator.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(indicator);
    }
    indicator.style.display = 'flex';
  } else {
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
}

/**
 * 🔧 Utilidades Globales
 */
window.generateExercise = generateExercise;
window.openCalculator = openCalculator;
window.openOCR = openOCR;
window.analyzeText = analyzeText;
window.initializeTools = initializeTools;
window.checkExerciseAnswer = checkExerciseAnswer;
window.AchievementSystem = AchievementSystem;
window.addVisualFeedback = addVisualFeedback;
window.showLoadingIndicator = showLoadingIndicator;

// Verificar logros periódicamente
setInterval(() => {
  AchievementSystem.checkAchievements();
}, 30000); // Cada 30 segundos

console.log('🛠️ Utils.js cargado - Utilidades educativas listas');
