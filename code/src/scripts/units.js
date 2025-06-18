// 📐 AsistenteEscolarAI - Conversor de Unidades
// Archivo: scripts/units.js

/**
 * 📏 Definiciones de Unidades
 */
const UnitDefinitions = {
  length: {
    name: 'Longitud',
    icon: '📏',
    baseUnit: 'm',
    units: {
      'mm': { name: 'Milímetros', symbol: 'mm', factor: 0.001 },
      'cm': { name: 'Centímetros', symbol: 'cm', factor: 0.01 },
      'm': { name: 'Metros', symbol: 'm', factor: 1 },
      'km': { name: 'Kilómetros', symbol: 'km', factor: 1000 },
      'in': { name: 'Pulgadas', symbol: 'in', factor: 0.0254 },
      'ft': { name: 'Pies', symbol: 'ft', factor: 0.3048 },
      'yd': { name: 'Yardas', symbol: 'yd', factor: 0.9144 },
      'mi': { name: 'Millas', symbol: 'mi', factor: 1609.34 }
    }
  },
  
  weight: {
    name: 'Peso/Masa',
    icon: '⚖️',
    baseUnit: 'g',
    units: {
      'mg': { name: 'Miligramos', symbol: 'mg', factor: 0.001 },
      'g': { name: 'Gramos', symbol: 'g', factor: 1 },
      'kg': { name: 'Kilogramos', symbol: 'kg', factor: 1000 },
      't': { name: 'Toneladas', symbol: 't', factor: 1000000 },
      'oz': { name: 'Onzas', symbol: 'oz', factor: 28.3495 },
      'lb': { name: 'Libras', symbol: 'lb', factor: 453.592 },
      'st': { name: 'Stones', symbol: 'st', factor: 6350.29 }
    }
  },
  
  temperature: {
    name: 'Temperatura',
    icon: '🌡️',
    baseUnit: 'C',
    units: {
      'C': { name: 'Celsius', symbol: '°C' },
      'F': { name: 'Fahrenheit', symbol: '°F' },
      'K': { name: 'Kelvin', symbol: 'K' },
      'R': { name: 'Rankine', symbol: '°R' }
    }
  },
  
  volume: {
    name: 'Volumen',
    icon: '🪣',
    baseUnit: 'L',
    units: {
      'ml': { name: 'Mililitros', symbol: 'ml', factor: 0.001 },
      'L': { name: 'Litros', symbol: 'L', factor: 1 },
      'gal': { name: 'Galones (US)', symbol: 'gal', factor: 3.78541 },
      'qt': { name: 'Cuartos (US)', symbol: 'qt', factor: 0.946353 },
      'pt': { name: 'Pintas (US)', symbol: 'pt', factor: 0.473176 },
      'cup': { name: 'Tazas (US)', symbol: 'cup', factor: 0.236588 },
      'fl_oz': { name: 'Onzas Fluidas (US)', symbol: 'fl oz', factor: 0.0295735 }
    }
  },
  
  area: {
    name: 'Área',
    icon: '📐',
    baseUnit: 'm2',
    units: {
      'mm2': { name: 'Milímetros²', symbol: 'mm²', factor: 0.000001 },
      'cm2': { name: 'Centímetros²', symbol: 'cm²', factor: 0.0001 },
      'm2': { name: 'Metros²', symbol: 'm²', factor: 1 },
      'km2': { name: 'Kilómetros²', symbol: 'km²', factor: 1000000 },
      'in2': { name: 'Pulgadas²', symbol: 'in²', factor: 0.00064516 },
      'ft2': { name: 'Pies²', symbol: 'ft²', factor: 0.092903 },
      'acre': { name: 'Acres', symbol: 'ac', factor: 4046.86 },
      'ha': { name: 'Hectáreas', symbol: 'ha', factor: 10000 }
    }
  },
  
  speed: {
    name: 'Velocidad',
    icon: '🏃',
    baseUnit: 'ms',
    units: {
      'ms': { name: 'Metros/segundo', symbol: 'm/s', factor: 1 },
      'kmh': { name: 'Kilómetros/hora', symbol: 'km/h', factor: 0.277778 },
      'mph': { name: 'Millas/hora', symbol: 'mph', factor: 0.44704 },
      'knot': { name: 'Nudos', symbol: 'kn', factor: 0.514444 },
      'fts': { name: 'Pies/segundo', symbol: 'ft/s', factor: 0.3048 }
    }
  },
  
  energy: {
    name: 'Energía',
    icon: '⚡',
    baseUnit: 'J',
    units: {
      'J': { name: 'Julios', symbol: 'J', factor: 1 },
      'kJ': { name: 'Kilojulios', symbol: 'kJ', factor: 1000 },
      'cal': { name: 'Calorías', symbol: 'cal', factor: 4.184 },
      'kcal': { name: 'Kilocalorías', symbol: 'kcal', factor: 4184 },
      'Wh': { name: 'Vatios-hora', symbol: 'Wh', factor: 3600 },
      'kWh': { name: 'Kilovatios-hora', symbol: 'kWh', factor: 3600000 },
      'BTU': { name: 'BTU', symbol: 'BTU', factor: 1055.06 }
    }
  }
};

/**
 * 🔧 Estado del Conversor
 */
const ConverterState = {
  currentCategory: 'length',
  fromUnit: 'm',
  toUnit: 'km',
  fromValue: 0,
  toValue: 0,
  history: []
};

/**
 * 🏗️ Inicialización del Conversor
 */
function initializeUnitConverter() {
  setupCategorySelector();
  updateUnitOptions();
  setupEventListeners();
  
  console.log('📐 Conversor de unidades inicializado');
}

/**
 * 📋 Configurar selector de categorías
 */
function setupCategorySelector() {
  const categorySelect = document.getElementById('unitCategory');
  if (!categorySelect) return;
  
  // Limpiar opciones existentes
  categorySelect.innerHTML = '';
  
  // Agregar todas las categorías
  Object.keys(UnitDefinitions).forEach(categoryKey => {
    const category = UnitDefinitions[categoryKey];
    const option = document.createElement('option');
    option.value = categoryKey;
    option.textContent = `${category.icon} ${category.name}`;
    categorySelect.appendChild(option);
  });
  
  // Establecer categoría por defecto
  categorySelect.value = ConverterState.currentCategory;
}

/**
 * 🔄 Actualizar opciones de unidades
 */
function updateUnitOptions() {
  const category = UnitDefinitions[ConverterState.currentCategory];
  if (!category) return;
  
  const fromSelect = document.getElementById('fromUnit');
  const toSelect = document.getElementById('toUnit');
  
  if (!fromSelect || !toSelect) return;
  
  // Limpiar opciones
  fromSelect.innerHTML = '';
  toSelect.innerHTML = '';
  
  // Agregar unidades de la categoría actual
  Object.keys(category.units).forEach(unitKey => {
    const unit = category.units[unitKey];
    
    // Opción para selector "desde"
    const fromOption = document.createElement('option');
    fromOption.value = unitKey;
    fromOption.textContent = `${unit.name} (${unit.symbol})`;
    fromSelect.appendChild(fromOption);
    
    // Opción para selector "hacia"
    const toOption = document.createElement('option');
    toOption.value = unitKey;
    toOption.textContent = `${unit.name} (${unit.symbol})`;
    toSelect.appendChild(toOption);
  });
  
  // Establecer valores por defecto
  const unitKeys = Object.keys(category.units);
  ConverterState.fromUnit = unitKeys[0];
  ConverterState.toUnit = unitKeys[Math.min(1, unitKeys.length - 1)];
  
  fromSelect.value = ConverterState.fromUnit;
  toSelect.value = ConverterState.toUnit;
  
  // Convertir valor actual
  convertUnits();
}

/**
 * 🔄 Convertir unidades
 */
function convertUnits() {
  const fromValueInput = document.getElementById('fromValue');
  const toValueInput = document.getElementById('toValue');
  const fromUnitSelect = document.getElementById('fromUnit');
  const toUnitSelect = document.getElementById('toUnit');
  
  if (!fromValueInput || !toValueInput || !fromUnitSelect || !toUnitSelect) return;
  
  // Obtener valores actuales
  const fromValue = parseFloat(fromValueInput.value) || 0;
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  
  // Actualizar estado
  ConverterState.fromValue = fromValue;
  ConverterState.fromUnit = fromUnit;
  ConverterState.toUnit = toUnit;
  
  // Realizar conversión
  let result;
  
  if (ConverterState.currentCategory === 'temperature') {
    result = convertTemperature(fromValue, fromUnit, toUnit);
  } else {
    result = convertStandardUnits(fromValue, fromUnit, toUnit);
  }
  
  // Actualizar display
  ConverterState.toValue = result;
  toValueInput.value = formatConversionResult(result);
  
  // Registrar en historial
  addToConversionHistory(fromValue, fromUnit, result, toUnit);
  
  console.log(`📐 Conversión: ${fromValue} ${fromUnit} = ${result} ${toUnit}`);
}

/**
 * 🌡️ Conversión de temperatura (casos especiales)
 */
function convertTemperature(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;
  
  // Convertir a Celsius primero
  let celsius;
  switch (fromUnit) {
    case 'C':
      celsius = value;
      break;
    case 'F':
      celsius = (value - 32) * 5/9;
      break;
    case 'K':
      celsius = value - 273.15;
      break;
    case 'R':
      celsius = (value - 491.67) * 5/9;
      break;
    default:
      return NaN;
  }
  
  // Convertir de Celsius a la unidad destino
  switch (toUnit) {
    case 'C':
      return celsius;
    case 'F':
      return (celsius * 9/5) + 32;
    case 'K':
      return celsius + 273.15;
    case 'R':
      return (celsius * 9/5) + 491.67;
    default:
      return NaN;
  }
}

/**
 * 📏 Conversión de unidades estándar (con factores)
 */
function convertStandardUnits(value, fromUnit, toUnit) {
  const category = UnitDefinitions[ConverterState.currentCategory];
  if (!category || !category.units[fromUnit] || !category.units[toUnit]) {
    return NaN;
  }
  
  if (fromUnit === toUnit) return value;
  
  // Usar la API del preload si está disponible
  if (window.educationalAPI && window.educationalAPI.convertUnits) {
    return window.educationalAPI.convertUnits(value, fromUnit, toUnit);
  }
  
  // Fallback: conversión manual
  const fromFactor = category.units[fromUnit].factor;
  const toFactor = category.units[toUnit].factor;
  
  // Convertir a unidad base, luego a unidad destino
  const baseValue = value * fromFactor;
  const result = baseValue / toFactor;
  
  return result;
}

/**
 * 🔢 Formatear resultado de conversión
 */
function formatConversionResult(value) {
  if (isNaN(value) || !isFinite(value)) {
    return 'Error';
  }
  
  // Formatear según la magnitud del número
  if (Math.abs(value) >= 1e6) {
    return value.toExponential(3);
  } else if (Math.abs(value) >= 1000) {
    return value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  } else if (Math.abs(value) >= 1) {
    return parseFloat(value.toFixed(6)).toString();
  } else if (Math.abs(value) >= 0.001) {
    return parseFloat(value.toFixed(9)).toString();
  } else if (value === 0) {
    return '0';
  } else {
    return value.toExponential(3);
  }
}

/**
 * 📋 Gestión de historial
 */
function addToConversionHistory(fromValue, fromUnit, toValue, toUnit) {
  const category = UnitDefinitions[ConverterState.currentCategory];
  const fromUnitData = category.units[fromUnit];
  const toUnitData = category.units[toUnit];
  
  const historyEntry = {
    timestamp: new Date(),
    category: ConverterState.currentCategory,
    fromValue,
    fromUnit: fromUnitData.symbol,
    toValue,
    toUnit: toUnitData.symbol,
    expression: `${fromValue} ${fromUnitData.symbol} = ${formatConversionResult(toValue)} ${toUnitData.symbol}`
  };
  
  ConverterState.history.unshift(historyEntry);
  
  // Mantener solo los últimos 50 entries
  if (ConverterState.history.length > 50) {
    ConverterState.history = ConverterState.history.slice(0, 50);
  }
  
  // Log de actividad
  if (fromValue !== 0) {
    logActivity(`📐 Conversión: ${historyEntry.expression}`);
  }
}

/**
 * 📊 Mostrar historial de conversiones
 */
function showConversionHistory() {
  if (ConverterState.history.length === 0) {
    showNotification('Historial', 'No hay conversiones en el historial', 'info');
    return;
  }
  
  const recentHistory = ConverterState.history.slice(0, 10);
  const historyText = recentHistory.map(entry => entry.expression).join('\n');
  
  console.log('📋 Historial de conversiones:', historyText);
  showNotification('Historial', `Últimas ${recentHistory.length} conversiones en consola`, 'info');
}

/**
 * 🔄 Intercambiar unidades
 */
function swapUnits() {
  const fromSelect = document.getElementById('fromUnit');
  const toSelect = document.getElementById('toUnit');
  const fromValueInput = document.getElementById('fromValue');
  const toValueInput = document.getElementById('toValue');
  
  if (!fromSelect || !toSelect || !fromValueInput || !toValueInput) return;
  
  // Intercambiar selecciones
  const tempUnit = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = tempUnit;
  
  // Intercambiar valores
  const tempValue = fromValueInput.value;
  fromValueInput.value = toValueInput.value;
  toValueInput.value = tempValue;
  
  // Actualizar estado y reconvertir
  ConverterState.fromUnit = fromSelect.value;
  ConverterState.toUnit = toSelect.value;
  
  convertUnits();
  
  logActivity('🔄 Unidades intercambiadas');
}

/**
 * 🎯 Conversiones rápidas predefinidas
 */
const QuickConversions = {
  length: [
    { from: { value: 1, unit: 'm' }, to: { unit: 'ft' }, name: '1 metro a pies' },
    { from: { value: 1, unit: 'km' }, to: { unit: 'mi' }, name: '1 km a millas' },
    { from: { value: 1, unit: 'in' }, to: { unit: 'cm' }, name: '1 pulgada a cm' }
  ],
  weight: [
    { from: { value: 1, unit: 'kg' }, to: { unit: 'lb' }, name: '1 kg a libras' },
    { from: { value: 1, unit: 'lb' }, to: { unit: 'kg' }, name: '1 libra a kg' },
    { from: { value: 1, unit: 'oz' }, to: { unit: 'g' }, name: '1 onza a gramos' }
  ],
  temperature: [
    { from: { value: 0, unit: 'C' }, to: { unit: 'F' }, name: '0°C a °F' },
    { from: { value: 100, unit: 'C' }, to: { unit: 'F' }, name: '100°C a °F' },
    { from: { value: 32, unit: 'F' }, to: { unit: 'C' }, name: '32°F a °C' }
  ]
};

function performQuickConversion(conversionData) {
  const { from, to } = conversionData;
  
  // Configurar la conversión
  document.getElementById('fromValue').value = from.value;
  document.getElementById('fromUnit').value = from.unit;
  document.getElementById('toUnit').value = to.unit;
  
  // Realizar conversión
  convertUnits();
  
  logActivity(`⚡ Conversión rápida: ${conversionData.name}`);
}

/**
 * 🔧 Event Listeners
 */
function setupEventListeners() {
  // Cambio de categoría
  const categorySelect = document.getElementById('unitCategory');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      ConverterState.currentCategory = e.target.value;
      updateUnitOptions();
    });
  }
  
  // Entrada de valor
  const fromValueInput = document.getElementById('fromValue');
  if (fromValueInput) {
    fromValueInput.addEventListener('input', convertUnits);
    fromValueInput.addEventListener('keypress', (e) => {
      // Solo permitir números, punto decimal y teclas de control
      const allowedKeys = /[0-9.\-eE]/;
      if (!allowedKeys.test(e.key) && !e.ctrlKey && !e.metaKey && 
          e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && 
          e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        e.preventDefault();
      }
    });
  }
  
  // Cambio de unidades
  const fromUnitSelect = document.getElementById('fromUnit');
  const toUnitSelect = document.getElementById('toUnit');
  
  if (fromUnitSelect) {
    fromUnitSelect.addEventListener('change', convertUnits);
  }
  
  if (toUnitSelect) {
    toUnitSelect.addEventListener('change', convertUnits);
  }
}

/**
 * 🎨 Utilidades de formato
 */
function getUnitDisplayName(unitKey, categoryKey = ConverterState.currentCategory) {
  const category = UnitDefinitions[categoryKey];
  const unit = category?.units[unitKey];
  return unit ? `${unit.name} (${unit.symbol})` : unitKey;
}

function getCategoryIcon(categoryKey = ConverterState.currentCategory) {
  const category = UnitDefinitions[categoryKey];
  return category?.icon || '📐';
}

/**
 * 📱 Funciones de utilidad móvil
 */
function clearConverterInputs() {
  document.getElementById('fromValue').value = '';
  document.getElementById('toValue').value = '';
  ConverterState.fromValue = 0;
  ConverterState.toValue = 0;
  
  logActivity('🧹 Conversor limpiado');
}

function copyConversionResult() {
  const toValueInput = document.getElementById('toValue');
  if (toValueInput && toValueInput.value) {
    // Intentar copiar al portapapeles
    try {
      toValueInput.select();
      document.execCommand('copy');
      showNotification('Copiado', 'Resultado copiado al portapapeles', 'success');
    } catch (error) {
      console.log('No se pudo copiar automáticamente');
      showNotification('Resultado', `Valor: ${toValueInput.value}`, 'info');
    }
  }
}

/**
 * 📚 Información educativa sobre unidades
 */
const UnitEducationalInfo = {
  length: {
    facts: [
      'Un metro se define como la distancia que viaja la luz en el vacío en 1/299,792,458 segundos',
      'Una milla terrestre equivale a 5,280 pies',
      'Un año luz equivale aproximadamente a 9.46 trillones de kilómetros'
    ],
    tips: [
      'Para conversiones rápidas: 1 metro ≈ 3.3 pies',
      'Para conversiones rápidas: 1 kilómetro ≈ 0.62 millas',
      'Un campo de fútbol americano mide aproximadamente 100 yardas'
    ]
  },
  weight: {
    facts: [
      'El kilogramo se define por la constante de Planck',
      'Una libra equivale exactamente a 453.592 gramos',
      'El peso varía según la gravedad, pero la masa permanece constante'
    ],
    tips: [
      'Para conversiones rápidas: 1 kg ≈ 2.2 libras',
      'Una onza equivale aproximadamente a 28 gramos',
      'Un galón de agua pesa aproximadamente 8.34 libras'
    ]
  }
};

function showUnitInfo(categoryKey = ConverterState.currentCategory) {
  const info = UnitEducationalInfo[categoryKey];
  if (info && info.facts.length > 0) {
    const randomFact = info.facts[Math.floor(Math.random() * info.facts.length)];
    showNotification('¿Sabías qué?', randomFact, 'info');
  }
}

/**
 * 🔧 Utilidades públicas
 */
window.updateUnitOptions = updateUnitOptions;
window.convertUnits = convertUnits;
window.swapUnits = swapUnits;
window.showConversionHistory = showConversionHistory;
window.clearConverterInputs = clearConverterInputs;
window.copyConversionResult = copyConversionResult;
window.showUnitInfo = showUnitInfo;
window.performQuickConversion = performQuickConversion;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUnitConverter);
} else {
  initializeUnitConverter();
}

console.log('📐 Units.js cargado - Conversor de unidades listo');
