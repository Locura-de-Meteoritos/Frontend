# 🌍 Meteor Madness - Simulador de Impactos de Asteroides

Aplicación web interactiva para simular impactos de asteroides en la Tierra con visualización 3D realista y cálculos físicos precisos.

![Meteor Madness](./public/LOGO%20METEOR%20MADNESS.png)

---

## ✨ Características

- 🌎 **Modelo 3D realista** de la Tierra con texturas NASA optimizadas
- 🪨 **Asteroides procedurales** con geometría irregular y texturas realistas
- 💥 **Simulación de impactos** con efectos visuales (fuego, humo, partículas)
- 📊 **Cálculos físicos precisos** de energía, cráteres y radios de destrucción
- 🛰️ **Integración con NASA NEO API** para datos reales de asteroides cercanos
- 🔥 **Efectos especiales** en cráteres (fuego, humo, iluminación dinámica)
- 📡 **API Backend** para simulaciones avanzadas con modelos NASA

---

## 🚀 Quick Start

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Locura-de-Meteoritos/Frontend.git
cd Frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Usar la API Backend (Opcional)

La aplicación ya está integrada con un backend potente. Para más información:

- 📖 **Guía rápida:** [`QUICK_START_API.md`](./QUICK_START_API.md)
- 📚 **Documentación completa:** [`API_INTEGRATION.md`](./API_INTEGRATION.md)

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool ultra-rápido
- **Three.js** - Renderizado 3D
- **react-three-fiber** - React renderer para Three.js
- **Tailwind CSS** - Estilos utility-first

### Backend (Integrado)
- **API REST** - Simulaciones de impactos
- **NASA NEO API** - Datos de asteroides en tiempo real
- **Modelos físicos NASA** - Cálculos precisos de impactos

---

## 📦 Scripts Disponibles

```bash
npm run dev        # Desarrollo (con HMR)
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Ejecutar ESLint
```

---

## 🎮 Cómo Usar

1. **Configura el asteroide**: Ajusta masa, velocidad, densidad y tipo
2. **Selecciona la ubicación**: Haz clic en "Simular impacto" y luego en el planeta
3. **Observa el impacto**: El asteroide viaja y genera un cráter realista
4. **Analiza los resultados**: Revisa energía, radios de destrucción y efectos

### Catálogo NEO

- **📡 Todos (7d)**: Asteroides cercanos de la última semana
- **⚠️ Peligrosos**: Solo asteroides potencialmente peligrosos
- **📜 Históricos**: Eventos históricos reales (Tunguska, Chelyabinsk, etc.)

---

## 🧪 Probar la API Backend

### Opción 1: Consola del Navegador

```javascript
// Abrir consola (F12) y ejecutar:
const api = await import('./src/services/impactAPI.js');

// Health check
await api.checkHealth();

// Obtener asteroides
const neos = await api.getNearEarthAsteroids();
console.table(neos);

// Simular impacto
const result = await api.simulateImpact({
  diameter_m: 100,
  velocity_km_s: 20,
  impact_location: { lat: -16.4897, lon: -68.1193 },
  target_type: 'land'
});
console.log(result);
```

### Opción 2: Panel de Pruebas

Importa `<APITestPanel />` en `simulacion.jsx` para un panel visual de pruebas.

---

## 📁 Estructura del Proyecto

```
Frontend/
├── src/
│   ├── components/           # Componentes React
│   │   ├── Earth3D.jsx       # Modelo 3D de la Tierra
│   │   ├── Asteroid.jsx      # Asteroide con física
│   │   ├── Crater.jsx        # Cráter con efectos especiales
│   │   ├── simulacion.jsx    # Componente principal
│   │   └── APITestPanel.jsx  # Panel de pruebas API
│   ├── services/             # Servicios y APIs
│   │   └── impactAPI.js      # Cliente API Backend
│   ├── utils/                # Utilidades
│   │   └── impactCalculations.js  # Cálculos físicos
│   └── examples/             # Ejemplos de uso
│       └── apiExamples.js    # Ejemplos API
├── public/                   # Recursos estáticos
├── .env.example              # Variables de entorno
├── API_INTEGRATION.md        # Documentación API
├── QUICK_START_API.md        # Guía rápida API
└── README.md                 # Este archivo
```

---

## 🌐 API Backend

**Base URL:** `https://backend-ns-t0p7.onrender.com`

### Endpoints Principales

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Estado del servidor |
| `/api/asteroids/near-earth` | GET | Asteroides cercanos NASA |
| `/api/impact/simulate` | POST | Simular impacto personalizado |
| `/api/impact/simulate-asteroid/:id` | POST | Simular por ID NASA |

**Documentación completa:** Ver [`API_INTEGRATION.md`](./API_INTEGRATION.md)

---

## 🎨 Optimizaciones

Este proyecto ha sido optimizado para renderizado web:

- ✅ Texturas 2K en lugar de 4K (reduce peso ~75%)
- ✅ Geometrías simplificadas (menos polígonos)
- ✅ Shaders optimizados para mejor FPS
- ✅ Sistema de partículas eficiente
- ✅ Lazy loading y fallbacks

Ver [`OPTIMIZACIONES.md`](./OPTIMIZACIONES.md) para detalles.

---

## 🔧 Configuración Avanzada

### Variables de Entorno

Crea un archivo `.env` (ver `.env.example`):

```env
VITE_BACKEND_URL=https://backend-ns-t0p7.onrender.com
VITE_NASA_API_KEY=tu_api_key_aqui
```

### Cambiar Backend

```env
# Desarrollo local
VITE_BACKEND_URL=http://localhost:5000

# Producción
VITE_BACKEND_URL=https://backend-ns-t0p7.onrender.com
```

---

## 🐛 Troubleshooting

### Backend no responde
✅ **Normal**: La app usa cálculos locales automáticamente  
✅ **Cold start**: El backend puede tardar ~10-30s en la primera llamada

### Performance bajo
- Reduce la cantidad de estrellas en `Earth3D.jsx`
- Desactiva efectos especiales (fuego/humo en cráteres)
- Ajusta calidad de texturas en el código

### Asteroides invisibles
- Verifica que `FORCE_FIXED_SIZE` esté en `false` (Asteroid.jsx)
- Ajusta `FIXED_ASTEROID_RADIUS_UNITS` si es necesario

---

## 📝 Licencia

Este proyecto fue creado para el **Hackathon UMSA 2025** - Equipo "Locura de Meteoritos"

---

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 👥 Equipo

**Locura de Meteoritos** - Hackathon UMSA 2025

---

## 🔗 Enlaces

- **Backend API:** https://backend-ns-t0p7.onrender.com
- **NASA NEO API:** https://api.nasa.gov/
- **Three.js:** https://threejs.org/
- **React Three Fiber:** https://docs.pmnd.rs/react-three-fiber/

---

**¡Gracias por usar Meteor Madness! 🌠**
