// 🧮 AsistenteEscolarAI - Calculadora Científica
// Archivo: scripts/calculator.js

/**
 * 🔢 Estado de la Calculadora
 */
const CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForNewValue: false,
  memory: 0,
  history: [],
  angleMode: 'deg' // 'deg' o 'rad'
};

/**
 * 🏗️ Inicialización de la Calculadora
 */
function initializeCalculator() {
  const calcDisplay = document.getElementById('calcDisplay');
  if (calcDisplay) {
    calcDisplay.value = CalculatorState.display;
    
    // Configurar eventos de teclado para la calculadora
    document.addEventListener('keydown', handleCalculatorKeys);
    
    console.log('🧮 Calculadora científica inicializada');
  }
}

/**
 * ⌨️ Manejo de teclas para la calculadora
 */
function handleCalculatorKeys(event) {
  // Solo procesar si estamos en el tab de herramientas
  if (AppState.activeTab !== 'tools') return;
  
  const key = event.key;
  
  // Números
  if (key >= '0' && key <= '9') {
    event.preventDefault();
    addToCalculator(key);
  }
  
  // Operadores
  const operatorMap = {
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    'Enter': '=',
    '=': '=',
    '.': '.',
    'Escape': 'C',
    'Backspace': 'backspace'
  };
  
  if (operatorMap[key]) {
    event.preventDefault();
    
    if (key === 'Backspace') {
      deleteLast();
    } else if (key === 'Escape') {
      clearCalculator();
    } else if (key === 'Enter' || key === '=') {
      calculateResult();
    } else {
      addToCalculator(operatorMap[key]);
    }
  }
}

/**
 * ➕ Agregar valor o operador a la calculadora
 */
function addToCalculator(value) {
  const display = document.getElementById('calcDisplay');
  if (!display) return;
  
  if (isNumber(value) || value === '.') {
    addNumber(value);
  } else {
    addOperator(value);
  }
  
  updateDisplay();
  logCalculatorHistory('add', value);
}

/**
 * 🔢 Agregar número al display
 */
function addNumber(num) {
  if (CalculatorState.waitingForNewValue) {
    CalculatorState.display = num;
    CalculatorState.waitingForNewValue = false;
  } else {
    if (CalculatorState.display === '0' && num !== '.') {
      CalculatorState.display = num;
    } else {
      // Evitar múltiples puntos decimales
      if (num === '.' && CalculatorState.display.includes('.')) {
        return;
      }
      CalculatorState.display += num;
    }
  }
}

/**
 * ➕ Agregar operador
 */
function addOperator(op) {
  const current = parseFloat(CalculatorState.display);
  
  if (CalculatorState.previousValue === null) {
    CalculatorState.previousValue = current;
  } else if (CalculatorState.operation && !CalculatorState.waitingForNewValue) {
    const result = performCalculation();
    CalculatorState.display = String(result);
    CalculatorState.previousValue = result;
  }
  
  CalculatorState.operation = op;
  CalculatorState.waitingForNewValue = true;
}

/**
 * 🔄 Realizar cálculo
 */
function performCalculation() {
  const prev = CalculatorState.previousValue;
  const current = parseFloat(CalculatorState.display);
  
  if (prev === null || isNaN(current)) return current;
  
  let result;
  
  try {
    switch (CalculatorState.operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          showNotification('Error', 'División por cero no permitida', 'error');
          return 0;
        }
        result = prev / current;
        break;
      case '^':
        result = Math.pow(prev, current);
        break;
      case '%':
        result = prev % current;
        break;
      default:
        return current;
    }
    
    // Redondear para evitar errores de punto flotante
    result = Math.round(result * 1e10) / 1e10;
    
    return result;
  } catch (error) {
    console.error('Error en cálculo:', error);
    showNotification('Error', 'Error en el cálculo', 'error');
    return 0;
  }
}

/**
 * 🎯 Calcular resultado final
 */
function calculateResult() {
  if (CalculatorState.operation && CalculatorState.previousValue !== null) {
    const result = performCalculation();
    
    // Guardar en historial
    const expression = `${CalculatorState.previousValue} ${CalculatorState.operation} ${CalculatorState.display} = ${result}`;
    CalculatorState.history.push(expression);
    
    // Actualizar estado
    CalculatorState.display = String(result);
    CalculatorState.previousValue = null;
    CalculatorState.operation = null;
    CalculatorState.waitingForNewValue = true;
    
    updateDisplay();
    
    // Log de actividad
    logActivity(`🧮 Calculó: ${expression}`);
    
    console.log('📊 Cálculo realizado:', expression);
  }
}

/**
 * 🗑️ Limpiar calculadora
 */
function clearCalculator() {
  CalculatorState.display = '0';
  CalculatorState.previousValue = null;
  CalculatorState.operation = null;
  CalculatorState.waitingForNewValue = false;
  
  updateDisplay();
  logCalculatorHistory('clear');
  
  console.log('🧹 Calculadora limpiada');
}

/**
 * ⌫ Borrar último dígito
 */
function deleteLast() {
  if (CalculatorState.display.length > 1) {
    CalculatorState.display = CalculatorState.display.slice(0, -1);
  } else {
    CalculatorState.display = '0';
  }
  
  updateDisplay();
  logCalculatorHistory('delete');
}

/**
 * 📺 Actualizar display
 */
function updateDisplay() {
  const display = document.getElementById('calcDisplay');
  if (display) {
    display.value = CalculatorState.display;
  }
}

/**
 * 📐 Funciones Científicas
 */
function calculateScientific(func) {
  const current = parseFloat(CalculatorState.display);
  
  if (isNaN(current)) {
    showNotification('Error', 'Valor inválido para función científica', 'error');
    return;
  }
  
  let result;
  
  try {
    switch (func) {
      case 'sin':
        result = Math.sin(CalculatorState.angleMode === 'deg' ? toRadians(current) : current);
        break;
      case 'cos':
        result = Math.cos(CalculatorState.angleMode === 'deg' ? toRadians(current) : current);
        break;
      case 'tan':
        result = Math.tan(CalculatorState.angleMode === 'deg' ? toRadians(current) : current);
        break;
      case 'asin':
        result = CalculatorState.angleMode === 'deg' ? toDegrees(Math.asin(current)) : Math.asin(current);
        break;
      case 'acos':
        result = CalculatorState.angleMode === 'deg' ? toDegrees(Math.acos(current)) : Math.acos(current);
        break;
      case 'atan':
        result = CalculatorState.angleMode === 'deg' ? toDegrees(Math.atan(current)) : Math.atan(current);
        break;
      case 'log':
        result = Math.log10(current);
        break;
      case 'ln':
        result = Math.log(current);
        break;
      case 'sqrt':
        result = Math.sqrt(current);
        break;
      case 'square':
        result = current * current;
        break;
      case 'cube':
        result = current * current * current;
        break;
      case 'factorial':
        result = factorial(current);
        break;
      case 'abs':
        result = Math.abs(current);
        break;
      case 'reciprocal':
        if (current === 0) {
          showNotification('Error', 'División por cero no permitida', 'error');
          return;
        }
        result = 1 / current;
        break;
      default:
        return;
    }
    
    // Redondear resultado
    result = Math.round(result * 1e10) / 1e10;
    
    // Actualizar display
    CalculatorState.display = String(result);
    CalculatorState.waitingForNewValue = true;
    updateDisplay();
    
    // Log de actividad
    logActivity(`🧮 Función científica: ${func}(${current}) = ${result}`);
    
  } catch (error) {
    console.error('Error en función científica:', error);
    showNotification('Error', `Error en función ${func}`, 'error');
  }
}

/**
 * 🔢 Funciones auxiliares matemáticas
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('El factorial solo está definido para enteros no negativos');
  }
  if (n > 170) {
    throw new Error('Número demasiado grande para calcular factorial');
  }
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function isNumber(value) {
  return !isNaN(value) && value !== '' && /^[0-9]$/.test(value);
}

/**
 * 💾 Gestión de memoria de la calculadora
 */
function memoryStore() {
  CalculatorState.memory = parseFloat(CalculatorState.display) || 0;
  showNotification('Memoria', `Valor ${CalculatorState.memory} guardado en memoria`, 'info');
  logCalculatorHistory('memory_store', CalculatorState.memory);
}

function memoryRecall() {
  CalculatorState.display = String(CalculatorState.memory);
  CalculatorState.waitingForNewValue = true;
  updateDisplay();
  logCalculatorHistory('memory_recall', CalculatorState.memory);
}

function memoryClear() {
  CalculatorState.memory = 0;
  showNotification('Memoria', 'Memoria limpiada', 'info');
  logCalculatorHistory('memory_clear');
}

function memoryAdd() {
  CalculatorState.memory += parseFloat(CalculatorState.display) || 0;
  showNotification('Memoria', `Sumado a memoria. Total: ${CalculatorState.memory}`, 'info');
  logCalculatorHistory('memory_add', CalculatorState.memory);
}

function memorySubtract() {
  CalculatorState.memory -= parseFloat(CalculatorState.display) || 0;
  showNotification('Memoria', `Restado de memoria. Total: ${CalculatorState.memory}`, 'info');
  logCalculatorHistory('memory_subtract', CalculatorState.memory);
}

/**
 * 📜 Historial de calculadora
 */
function logCalculatorHistory(action, value = null) {
  const timestamp = new Date().toLocaleTimeString();
  const historyEntry = {
    timestamp,
    action,
    value,
    display: CalculatorState.display
  };
  
  // Mantener solo los últimos 50 entries
  if (CalculatorState.history.length > 50) {
    CalculatorState.history = CalculatorState.history.slice(-50);
  }
}

function showCalculatorHistory() {
  if (CalculatorState.history.length === 0) {
    showNotification('Historial', 'No hay cálculos en el historial', 'info');
    return;
  }
  
  const historyText = CalculatorState.history.slice(-10).join('\n');
  console.log('📜 Historial de calculadora:', historyText);
  
  // En una implementación más completa, esto abriría un modal con el historial
  showNotification('Historial', `Últimos ${Math.min(10, CalculatorState.history.length)} cálculos en consola`, 'info');
}

/**
 * 🔧 Configuración de la calculadora
 */
function toggleAngleMode() {
  CalculatorState.angleMode = CalculatorState.angleMode === 'deg' ? 'rad' : 'deg';
  showNotification('Configuración', `Modo de ángulo: ${CalculatorState.angleMode.toUpperCase()}`, 'info');
  
  // Actualizar indicador visual si existe
  const angleModeIndicator = document.getElementById('angleModeIndicator');
  if (angleModeIndicator) {
    angleModeIndicator.textContent = CalculatorState.angleMode.toUpperCase();
  }
}

/**
 * 🎯 Evaluación segura de expresiones
 */
function evaluateExpression(expression) {
  try {
    // Usar la API segura del preload si está disponible
    if (window.educationalAPI && window.educationalAPI.evaluateMathExpression) {
      return window.educationalAPI.evaluateMathExpression(expression);
    }
    
    // Fallback básico
    const sanitized = expression.replace(/[^0-9+\-*/().,\s]/g, '');
    const result = new Function('return ' + sanitized)();
    
    return isNaN(result) ? 'Error' : result;
  } catch (error) {
    console.error('Error al evaluar expresión:', error);
    return 'Error de sintaxis';
  }
}

/**
 * 🌟 Funciones avanzadas
 */
function calculateAdvanced(operation) {
  const current = parseFloat(CalculatorState.display);
  
  switch (operation) {
    case 'percent':
      if (CalculatorState.previousValue !== null) {
        const result = (CalculatorState.previousValue * current) / 100;
        CalculatorState.display = String(result);
        updateDisplay();
      }
      break;
      
    case 'pi':
      CalculatorState.display = String(Math.PI);
      CalculatorState.waitingForNewValue = true;
      updateDisplay();
      break;
      
    case 'e':
      CalculatorState.display = String(Math.E);
      CalculatorState.waitingForNewValue = true;
      updateDisplay();
      break;
      
    case 'random':
      CalculatorState.display = String(Math.random());
      CalculatorState.waitingForNewValue = true;
      updateDisplay();
      break;
  }
  
  logActivity(`🧮 Función avanzada: ${operation}`);
}

/**
 * 🔧 Utilidades públicas
 */
window.addToCalculator = addToCalculator;
window.calculateResult = calculateResult;
window.clearCalculator = clearCalculator;
window.deleteLast = deleteLast;
window.calculateScientific = calculateScientific;
window.memoryStore = memoryStore;
window.memoryRecall = memoryRecall;
window.memoryClear = memoryClear;
window.memoryAdd = memoryAdd;
window.memorySubtract = memorySubtract;
window.toggleAngleMode = toggleAngleMode;
window.calculateAdvanced = calculateAdvanced;
window.showCalculatorHistory = showCalculatorHistory;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCalculator);
} else {
  initializeCalculator();
}

console.log('🧮 Calculator.js cargado - Calculadora científica lista');
