# 🎓 Asistente Escolar AI - Versión 2.0 Optimizada

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/tu-usuario/asistente-escolar-ai)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/electron-29.1.0-9feaf9.svg)](https://electronjs.org)
[![Security](https://img.shields.io/badge/security-enhanced-brightgreen.svg)](#seguridad)

> **Una aplicación educativa completa y segura diseñada para potenciar el aprendizaje estudiantil con herramientas inteligentes y seguimiento de progreso.**

## ✨ Nuevas Características v2.0

### 🔒 **Seguridad Mejorada**
- **Context Isolation**: Aislamiento completo entre procesos
- **IPC Segura**: Comunicación controlada vía contextBridge
- **APIs Expuestas**: Solo funciones necesarias accesibles al renderer
- **Validación Robusta**: Manejo de errores en todas las operaciones

### 🎯 **Funcionalidades Educativas Avanzadas**
- **🧮 Calculadora Científica**: Funciones trigonométricas, logarítmicas, y memoria
- **🍅 Temporizador Pomodoro**: Gestión inteligente del tiempo de estudio
- **📐 Conversor de Unidades**: 7 categorías con 40+ unidades diferentes
- **📝 Analizador de Texto**: Estadísticas avanzadas y análisis de legibilidad
- **🎲 Generador de Ejercicios**: Matemáticas y español con múltiples dificultades
- **📷 OCR**: Extracción de texto desde imágenes (integración con tesseract.js)

### 🎨 **Interfaz Moderna**
- **Diseño Responsive**: Adaptable a cualquier tamaño de pantalla
- **4 Temas**: Oscuro, claro, azul, y verde
- **Animaciones Suaves**: Transiciones fluidas y efectos visuales
- **Atajos de Teclado**: Navegación rápida con Ctrl+1-4

### 📊 **Sistema de Progreso**
- **Seguimiento Automático**: Tiempo de estudio y ejercicios completados
- **Estadísticas Detalladas**: Por asignatura y sesión
- **Sistema de Logros**: Gamificación para motivar el aprendizaje
- **Respaldos Automáticos**: Protección de datos cada 5 minutos

## 🚀 Instalación Rápida

### 📥 Descarga Directa
1. Ve a [Releases](https://github.com/tu-usuario/asistente-escolar-ai/releases)
2. Descarga la versión para tu sistema operativo:
   - **Windows**: `AsistenteEscolarAI-2.0.0-x64.exe`
   - **macOS**: `AsistenteEscolarAI-2.0.0-x64.dmg`
   - **Linux**: `AsistenteEscolarAI-2.0.0-x64.AppImage`

### 🛠️ Instalación desde Código Fuente

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/asistente-escolar-ai.git
cd asistente-escolar-ai

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🔐 Códigos de Licencia

### 🎯 **Licencias Disponibles**

| Código | Tipo | Descripción | Funcionalidades |
|--------|------|-------------|-----------------|
| `AI-2025` | Completa | Todas las funcionalidades | 🧮📊🍅📐📝📷 |
| `ESCUELA-2025` | Educativa | Para instituciones | 🧮📊🍅📐📝 |
| `STUDENT-2025` | Estudiante | Descuento estudiantil | 🧮📊🍅📐📝 |
| `DEMO-2025` | Demostración | Funciones básicas | 🧮🍅📐 |
| `LICENSE-OK` | Desarrollo | Para pruebas | 🧮📊🍅📐📝📷 |

### 🎫 **Activación**
1. Inicia la aplicación
2. Ingresa uno de los códigos de licencia
3. ¡Disfruta de todas las funcionalidades!

## 🎮 Guía de Uso

### 📊 **Panel Principal**
- **Estadísticas en Tiempo Real**: Tiempo de estudio hoy, ejercicios completados
- **Acciones Rápidas**: Botones para iniciar funciones principales
- **Actividad Reciente**: Historial de acciones realizadas

### 🛠️ **Herramientas Disponibles**

#### 🧮 **Calculadora Científica**
```
Funciones básicas: +, -, ×, ÷
Funciones científicas: sin, cos, tan, log, ln, √, x²
Memoria: MS, MR, MC, M+, M-
Atajos: Teclado numérico completo
```

#### 🍅 **Temporizador Pomodoro**
```
Modos: Concentración (25min), Descanso Corto (5min), Descanso Largo (15min)
Presets: 25min, 15min, 5min personalizables
Auto-avance: Configuración automática entre sesiones
Notificaciones: Visuales y sonoras
```

#### 📐 **Conversor de Unidades**
```
Categorías: Longitud, Peso, Temperatura, Volumen, Área, Velocidad, Energía
Unidades: 40+ unidades en total
Historial: Últimas 50 conversiones
Precisión: Hasta 10 decimales
```

#### 📝 **Analizador de Texto**
```
Estadísticas: Palabras, caracteres, oraciones, párrafos
Análisis: Tiempo de lectura estimado, complejidad
Funciones: Conteo en tiempo real, análisis de legibilidad
```

#### 🎲 **Generador de Ejercicios**
```
Matemáticas: Aritmética, álgebra, trigonometría
Español: Gramática, sinónimos, conjugación
Dificultades: Fácil, medio, difícil
Verificación: Respuestas automáticas
```

### ⌨️ **Atajos de Teclado**

| Atajo | Función |
|-------|---------|
| `Ctrl + 1` | Panel Principal |
| `Ctrl + 2` | Herramientas |
| `Ctrl + 3` | Progreso |
| `Ctrl + 4` | Configuración |
| `Escape` | Cerrar modales |
| `F11` | Pantalla completa |

## 🏗️ Arquitectura Técnica

### 🔧 **Tecnologías Principales**
- **Electron 29.1.0**: Framework de aplicaciones de escritorio
- **Node.js 18+**: Runtime de JavaScript
- **HTML5/CSS3**: Interfaz moderna y responsive
- **Vanilla JavaScript**: Sin frameworks pesados para mejor rendimiento

### 🔒 **Seguridad Implementada**
```javascript
// Configuración segura de Electron
{
  nodeIntegration: false,        // ✅ Seguro
  contextIsolation: true,        // ✅ Seguro  
  enableRemoteModule: false,     // ✅ Seguro
  webSecurity: true,             // ✅ Activado
  preload: 'preload.js'         // ✅ APIs controladas
}
```

### 📁 **Estructura Optimizada**
```
AsistenteEscolarAI/
├── 📁 src/                    # Código fuente
│   ├── 📄 index.html         # Interfaz principal
│   ├── 📄 preload.js         # APIs seguras
│   ├── 📁 styles/            # Estilos CSS
│   └── 📁 scripts/           # Lógica JavaScript
├── 📁 config/                # Configuraciones
├── 📁 public/                # Recursos estáticos
├── 📄 main.js               # Proceso principal
└── 📄 package.json          # Dependencias
```

## 🧪 Testing y Calidad

### ✅ **Pruebas Implementadas**
- **Validación de Entrada**: Sanitización de todos los inputs
- **Manejo de Errores**: Try-catch en operaciones críticas
- **Memoria**: Gestión automática de recursos
- **Rendimiento**: Operaciones asíncronas optimizadas

### 📊 **Métricas de Calidad**
- **Tiempo de Inicio**: < 3 segundos
- **Uso de Memoria**: < 150MB en promedio
- **Compatibilidad**: Windows 10+, macOS 10.14+, Ubuntu 18+

## 🤝 Contribución

### 🛠️ **Desarrollo Local**
```bash
# Fork del repositorio
git clone https://github.com/tu-usuario/asistente-escolar-ai.git
cd asistente-escolar-ai

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Linting
npm run lint
```

### 📋 **Guías de Contribución**
1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### 🐛 **Reportar Bugs**
Usa el [issue tracker](https://github.com/tu-usuario/asistente-escolar-ai/issues) para reportar bugs. Incluye:
- Versión del sistema operativo
- Pasos para reproducir el error
- Capturas de pantalla si aplica
- Logs de la aplicación

## 📈 Roadmap v2.1

### 🎯 **Próximas Funcionalidades**
- [ ] **🤖 IA Integrada**: Asistente de chat para resolver dudas
- [ ] **☁️ Sincronización**: Backup en la nube
- [ ] **👥 Modo Colaborativo**: Compartir progreso con profesores
- [ ] **📚 Biblioteca**: Recursos educativos integrados
- [ ] **🎨 Editor de Notas**: Tomar apuntes con formato rico
- [ ] **📊 Gráficos Avanzados**: Visualización de progreso mejorada

### 🔄 **Mejoras Planificadas**
- [ ] **Performance**: Optimización de carga inicial
- [ ] **Accesibilidad**: Soporte para lectores de pantalla
- [ ] **Internacionalización**: Soporte multi-idioma
- [ ] **Plugins**: Sistema de extensiones

## 📞 Soporte

### 💬 **Canales de Ayuda**
- **📧 Email**: soporte@asistenteescolar.ai
- **💬 Discord**: [Servidor de la Comunidad](https://discord.gg/asistenteescolar)
- **📖 Wiki**: [Documentación Completa](https://github.com/tu-usuario/asistente-escolar-ai/wiki)
- **❓ FAQ**: [Preguntas Frecuentes](https://github.com/tu-usuario/asistente-escolar-ai/wiki/FAQ)

### 🆘 **Problemas Comunes**

<details>
<summary>🔐 La aplicación no acepta mi código de licencia</summary>

1. Verifica que hayas escrito el código exactamente como se proporciona
2. Asegúrate de incluir guiones (ej: `AI-2025`, no `AI2025`)
3. El código distingue entre mayúsculas y minúsculas
4. Intenta reiniciar la aplicación
</details>

<details>
<summary>🐌 La aplicación funciona lenta</summary>

1. Cierra otras aplicaciones pesadas
2. Verifica que tengas al menos 4GB de RAM disponible
3. Actualiza a la última versión
4. Reinicia tu computadora
</details>

<details>
<summary>💾 Perdí mi progreso</summary>

1. Busca archivos de backup en: `%APPDATA%/asistente-escolar-ai/data/`
2. Los backups se crean automáticamente cada 5 minutos
3. Usa la función "Restaurar desde backup" en Configuración
</details>

## 📜 Licencia

```
MIT License

Copyright (c) 2025 AsistenteEscolarAI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Agradecimientos

- **Electron Team**: Por el excelente framework
- **Tesseract.js**: Por el OCR de código abierto
- **Inter Font**: Por la tipografía moderna
- **Comunidad de Desarrolladores**: Por feedback y contribuciones
- **Educadores**: Por las sugerencias pedagógicas

---

<div align="center">

**🎓 Asistente Escolar AI - Potenciando el Aprendizaje del Siglo XXI**

[![GitHub stars](https://img.shields.io/github/stars/tu-usuario/asistente-escolar-ai.svg?style=social&label=Star)](https://github.com/tu-usuario/asistente-escolar-ai)
[![GitHub forks](https://img.shields.io/github/forks/tu-usuario/asistente-escolar-ai.svg?style=social&label=Fork)](https://github.com/tu-usuario/asistente-escolar-ai/fork)

Made with ❤️ for Students Everywhere

</div>
