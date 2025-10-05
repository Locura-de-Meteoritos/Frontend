# 🚀 Integración con API Backend - Guía de Uso

## 📋 Descripción General

Este proyecto ahora está integrado con un backend potente que proporciona:
- 🌍 **Datos en tiempo real** de asteroides cercanos a la Tierra (NASA NEO API)
- 💥 **Simulaciones precisas** de impactos de asteroides
- 🧮 **Cálculos físicos avanzados** de energía, radios de destrucción y efectos

**Backend URL:** `https://backend-ns-t0p7.onrender.com`

---

## 🔧 Configuración Inicial

### 1. Crear archivo de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 2. Configurar variables (opcional)

El archivo `.env` contiene:

```env
# URL del backend (ya configurada por defecto)
VITE_BACKEND_URL=https://backend-ns-t0p7.onrender.com

# API Key de NASA (fallback)
VITE_NASA_API_KEY=4XTNhkIbujuES0LnRkxyO5v5HI96OqklU3ELcEDB
```

⚠️ **Nota:** Las variables con prefijo `VITE_` están disponibles en el cliente.

---

## 📡 Endpoints Disponibles

### 1. Health Check
**Endpoint:** `GET /health`

Verifica que el backend esté funcionando.

```javascript
import { checkHealth } from '../services/impactAPI';

const health = await checkHealth();
// { status: "ok", timestamp: "2025-10-05T..." }
```

---

### 2. Asteroides Cercanos (NEO)
**Endpoint:** `GET /api/asteroids/near-earth`

Obtiene asteroides cercanos a la Tierra.

```javascript
import { getNearEarthAsteroids } from '../services/impactAPI';

// Todos los asteroides (últimos 7 días)
const neos = await getNearEarthAsteroids();

// Solo peligrosos
const hazardous = await getNearEarthAsteroids({ 
  hazardousOnly: true 
});

// Rango de fechas específico
const filtered = await getNearEarthAsteroids({
  startDate: '2025-10-01',
  endDate: '2025-10-08'
});
```

**Respuesta:**
```json
[
  {
    "id": "2247517",
    "name": "(2001 SL9)",
    "estimated_diameter": {
      "meters": {
        "estimated_diameter_max": 701.52,
        "estimated_diameter_min": 313.73
      }
    },
    "close_approach_data": [{
      "relative_velocity": {
        "kilometers_per_second": "18.29"
      }
    }],
    "is_potentially_hazardous_asteroid": false
  }
]
```

---

### 3. Simular Impacto (Parámetros Específicos)
**Endpoint:** `POST /api/impact/simulate`

Simula un impacto con parámetros personalizados.

```javascript
import { simulateImpact, createImpactLocation } from '../services/impactAPI';

const result = await simulateImpact({
  diameter_m: 507,              // Diámetro del asteroide (metros)
  velocity_km_s: 18.29,         // Velocidad de impacto (km/s)
  impact_location: createImpactLocation(-23.5505, -46.6333), // São Paulo
  target_type: 'land',          // 'land' o 'water'
  density: 3000,                // Densidad (kg/m³) - opcional
  angle: 45                     // Ángulo de impacto (grados) - opcional
});
```

**Respuesta:**
```json
{
  "impact_effects": {
    "energy": {
      "joules": 1.234e15,
      "kilotons": 295.0,
      "megatons": 0.295
    },
    "crater": {
      "transient_diameter_km": 2.5,
      "final_diameter_km": 3.25,
      "depth_km": 0.65
    },
    "radii": {
      "total": 12.5,      // Radio de destrucción total (km)
      "moderate": 25.0,   // Radio de daño moderado (km)
      "light": 50.0       // Radio de daño leve (km)
    }
  }
}
```

---

### 4. Simular Impacto (Datos NASA)
**Endpoint:** `POST /api/impact/simulate`

Simula usando datos directos de la API de NASA.

```javascript
import { simulateImpactFromNASA } from '../services/impactAPI';

const result = await simulateImpactFromNASA({
  nasa_data: {
    diameter_max_m: 701.52,
    diameter_min_m: 313.73,
    close_approach_data: [{
      velocity_km_s: 18.29
    }]
  },
  impact_location: { lat: -23.5505, lon: -46.6333 },
  target_type: 'land'
});
```

---

### 5. Simular por ID de Asteroide
**Endpoint:** `POST /api/impact/simulate-asteroid/:id`

Simula usando el ID de un asteroide NASA (el backend obtiene los datos automáticamente).

```javascript
import { simulateImpactByAsteroidId } from '../services/impactAPI';

const result = await simulateImpactByAsteroidId('2247517', {
  impact_location: { lat: -23.5505, lon: -46.6333 },
  target_type: 'land'
});
```

---

## 🧪 Probar la Integración

### Opción 1: Panel de Pruebas (UI)

Importa y usa el componente `APITestPanel`:

```jsx
import APITestPanel from './components/APITestPanel';

function App() {
  return (
    <>
      {/* Tu contenido normal */}
      
      {/* Panel de pruebas (solo desarrollo) */}
      <APITestPanel />
    </>
  );
}
```

### Opción 2: Consola del Navegador

```javascript
// Importar servicio en la consola
const api = await import('./services/impactAPI.js');

// Probar health check
await api.checkHealth();

// Obtener asteroides
const neos = await api.getNearEarthAsteroids();
console.table(neos);

// Simular impacto
const impact = await api.simulateImpact({
  diameter_m: 100,
  velocity_km_s: 20,
  impact_location: { lat: 0, lon: 0 },
  target_type: 'water'
});
console.log(impact);
```

---

## 🔄 Flujo de Integración en `simulacion.jsx`

El componente `simulacion.jsx` ahora usa la API automáticamente:

### 1. Carga de NEOs

```javascript
useEffect(() => {
  // Intenta cargar desde el backend primero
  const neos = await getNearEarthAsteroids();
  setNeos(neos);
  
  // Si falla, usa NASA directamente (fallback)
}, []);
```

### 2. Simulación de Impacto

```javascript
const handleAsteroidHit = async (target, data) => {
  // Convertir coordenadas 3D a lat/lng
  const { lat, lng } = convertTo3DToLatLng(target);
  
  // Llamar al backend
  const simulation = await simulateImpact({
    diameter_m: craterDiameter,
    velocity_km_s: velocity,
    impact_location: { lat, lng },
    target_type: guessTargetType(lat, lng)
  });
  
  // Usar resultados del backend
  setFullImpactAnalysis(simulation.impact_effects);
};
```

---

## 🛠️ Utilidades Incluidas

### `guessTargetType(lat, lng)`
Determina si las coordenadas están en tierra o agua (simplificado).

```javascript
import { guessTargetType } from '../services/impactAPI';

const type = guessTargetType(-23.5505, -46.6333);
// "land"

const oceanType = guessTargetType(0, -150);
// "water"
```

### `createImpactLocation(lat, lng)`
Crea un objeto de ubicación válido para la API.

```javascript
import { createImpactLocation } from '../services/impactAPI';

const location = createImpactLocation(-23.5505, -46.6333);
// { lat: -23.5505, lon: -46.6333 }
```

---

## 🚨 Manejo de Errores

Todas las funciones lanzan excepciones que puedes capturar:

```javascript
try {
  const result = await simulateImpact({ ... });
  console.log('✅ Simulación exitosa:', result);
} catch (error) {
  console.error('❌ Error en simulación:', error.message);
  
  // Fallback a cálculo local
  const localResult = calculateFullImpact({ ... });
}
```

---

## 📊 Comparación: Backend vs Local

| Característica | Backend API | Cálculo Local |
|---------------|-------------|---------------|
| Precisión física | ⭐⭐⭐⭐⭐ Alta | ⭐⭐⭐ Media |
| Modelos NASA | ✅ Sí | ❌ No |
| Efectos atmosféricos | ✅ Sí | ❌ No |
| Ondas sísmicas | ✅ Sí | ❌ No |
| Tsunamis (agua) | ✅ Sí | ❌ No |
| Velocidad | 🐢 ~500-1000ms | 🚀 <10ms |
| Offline | ❌ Requiere conexión | ✅ Funciona offline |

**Recomendación:** Usar backend con fallback a local.

---

## 🔗 Recursos Adicionales

- **Backend Repository:** (Añade el link si existe)
- **NASA NEO API:** https://api.nasa.gov/
- **Purdue Impact Calculator:** https://impact.ese.ic.ac.uk/ImpactEarth/

---

## 🐛 Solución de Problemas

### Error: "Failed to fetch"
**Causa:** El backend no está accesible.

**Solución:**
1. Verifica que el backend esté corriendo: https://backend-ns-t0p7.onrender.com/health
2. Revisa la consola del navegador para errores CORS
3. Usa el fallback local (automático en `simulacion.jsx`)

### Error: "Network request failed"
**Causa:** Problema de conectividad o CORS.

**Solución:**
1. Verifica tu conexión a internet
2. Comprueba que `VITE_BACKEND_URL` esté configurada correctamente
3. El backend debe tener CORS habilitado para tu dominio

### Asteroides no se cargan
**Causa:** Fallo en ambas APIs (backend y NASA).

**Solución:**
1. Revisa la consola: `[simulacion] ❌ También falló NASA directa`
2. Verifica tu API key de NASA en `.env`
3. Usa datos históricos como alternativa (botón "📜 Históricos")

---

## 📝 Notas de Desarrollo

- ✅ La integración ya está implementada en `simulacion.jsx`
- ✅ Sistema de fallback automático a cálculos locales
- ✅ Manejo de errores robusto con logging detallado
- ✅ Compatible con todos los flujos existentes
- 🚧 TODO: Implementar cache local para reducir llamadas a la API
- 🚧 TODO: Añadir indicador visual de "usando backend" vs "cálculo local"

---

**¿Preguntas?** Revisa la consola del navegador — todos los logs tienen prefijo `[impactAPI]` o `[simulacion]`.
