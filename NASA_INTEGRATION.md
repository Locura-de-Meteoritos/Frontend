# 🌌 Integración NASA NeoWs API - Sistema Solar

## 📋 Descripción

Este sistema integra la **NASA Near Earth Object Web Service (NeoWs)** para mostrar asteroides reales que se acercan a la Tierra en el sistema solar 3D.

## 🚀 Características

### ✅ Funcionalidades Implementadas

1. **Asteroides Reales de NASA**
   - Obtiene datos de asteroides de la última semana
   - Muestra hasta 50 asteroides simultáneamente
   - Renderiza asteroides con texturas realistas

2. **Información Orbital**
   - Distancia en Unidades Astronómicas (AU)
   - Diámetro estimado en kilómetros
   - Velocidad relativa
   - Clasificación de peligrosidad

3. **Visualización 3D**
   - Asteroides con forma irregular (icosaedro)
   - Órbitas dinámicas basadas en datos reales
   - Indicador visual para asteroides potencialmente peligrosos (halo rojo)
   - Cinturón de asteroides decorativo entre Marte y Júpiter

4. **Panel de Información**
   - Lista de los 10 asteroides más cercanos
   - Detalles: nombre, distancia, diámetro, velocidad
   - Contador de asteroides peligrosos
   - Interfaz interactiva (mostrar/ocultar)

## 🔧 Archivos Creados/Modificados

### Nuevos Archivos

1. **`src/services/nasaAPI.js`**
   - Servicio para consumir la API de NASA
   - Funciones principales:
     - `getAsteroidFeed(startDate, endDate)` - Asteroides en rango de fechas
     - `getAsteroidById(id)` - Detalles de asteroide específico
     - `browseAsteroids(page, size)` - Navegar catálogo
     - `getTodayAsteroids()` - Asteroides de hoy
     - `getWeekAsteroids()` - Asteroides de la última semana
     - `processAsteroidsForRender()` - Procesa datos para 3D

2. **`src/components/sistemaSolar/Asteroids.jsx`**
   - Componente para renderizar asteroides en 3D
   - `AsteroidMesh` - Asteroide individual con órbita
   - `AsteroidBelt` - Cinturón decorativo (200 asteroides estáticos)

3. **`src/components/sistemaSolar/AsteroidInfo.jsx`**
   - Panel de información lateral
   - Lista ordenada por distancia
   - Indicadores visuales de peligrosidad

### Archivos Modificados

1. **`.env`**
   ```env
   VITE_NASA_API_KEY=q7Qn3tPoD9ck5fVhjDtveCAbtXTzhU2CYeNcne5s
   ```

2. **`src/components/sistemaSolar/SolarSystem3D.jsx`**
   - Integra asteroides de NASA
   - Maneja estados de carga y error
   - Renderiza panel de información

## 📡 API Endpoints Utilizados

### 1. Feed de Asteroides
```javascript
GET https://api.nasa.gov/neo/rest/v1/feed?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&api_key=API_KEY
```
**Uso**: Obtener asteroides que se acercan a la Tierra en un rango de fechas

### 2. Búsqueda por ID
```javascript
GET https://api.nasa.gov/neo/rest/v1/neo/{asteroid_id}?api_key=API_KEY
```
**Uso**: Detalles de un asteroide específico (no usado actualmente)

### 3. Navegación de Catálogo
```javascript
GET https://api.nasa.gov/neo/rest/v1/neo/browse?page=0&size=20&api_key=API_KEY
```
**Uso**: Explorar el catálogo completo de NEOs (no usado actualmente)

## 🎨 Representación Visual

### Asteroides Normales
- **Color**: Gris (#8b8b8b)
- **Forma**: Icosaedro irregular
- **Textura**: `asteroide.jpg`

### Asteroides Potencialmente Peligrosos
- **Color**: Rojo (#ff6b6b)
- **Forma**: Icosaedro + halo rojo wireframe
- **Indicador**: ⚠️ en panel de información

### Cinturón de Asteroides
- **Posición**: Entre Marte (7.5 AU) y Júpiter (11 AU)
- **Cantidad**: 150 asteroides estáticos
- **Radio**: 8.5 - 10.5 AU

## 📊 Datos Procesados

Para cada asteroide se extrae:

```javascript
{
  id: string,              // ID único de NASA
  name: string,            // Nombre del asteroide
  isPotentiallyHazardous: boolean,
  distance: number,        // Distancia en AU
  diameter: number,        // Diámetro promedio en km
  visualSize: number,      // Tamaño para renderizado 3D
  velocity: number,        // Velocidad en km/h
  closeApproachDate: string,
  orbitalData: {
    semiMajorAxis: number,
    eccentricity: number,
    inclination: number
  }
}
```

## 🎮 Controles de Usuario

### Visualización 3D
- **Ratón izquierdo + arrastrar**: Rotar cámara
- **Scroll**: Zoom in/out
- **Botón "🌠 X Asteroides"**: Mostrar panel de información

### Panel de Información
- **Botón "✕ Cerrar"**: Ocultar panel
- **Scroll dentro del panel**: Ver más asteroides

## ⚡ Optimizaciones

1. **Límite de renderizado**: Máximo 50 asteroides simultáneos
2. **Caché de texturas**: Three.js cachea automáticamente
3. **Geometría compartida**: Icosaedros reutilizan geometría
4. **Renderizado condicional**: Solo carga si hay asteroides

## 🔮 Mejoras Futuras Posibles

1. **Filtros interactivos**
   - Mostrar solo asteroides peligrosos
   - Filtrar por tamaño o distancia
   - Búsqueda por nombre

2. **Animación de trayectorias**
   - Líneas de órbita completa
   - Predicción de aproximación futura

3. **Detalles al hacer clic**
   - Modal con información completa
   - Gráficos de órbita 2D
   - Enlaces a NASA JPL

4. **Sincronización en tiempo real**
   - Actualización automática cada X minutos
   - Notificaciones de nuevos acercamientos

5. **Más endpoints**
   - Integrar `/neo/browse` para explorar catálogo completo
   - `/neo/lookup/{id}` para detalles expandidos

## 🐛 Manejo de Errores

- **API no disponible**: Muestra mensaje de error, sistema solar sigue funcionando
- **Sin asteroides**: Muestra solo el cinturón decorativo
- **Datos incompletos**: Filtra asteroides sin información orbital válida

## 📝 Notas Técnicas

- **Framework**: React 18 + Vite
- **3D**: Three.js + React Three Fiber
- **API**: NASA NeoWs REST API
- **Rate Limit**: API_KEY permite ~1000 requests/hora
- **Fallback**: Usa DEMO_KEY si no se configura API_KEY

## 🌐 Variables de Entorno

Asegúrate de tener en `.env`:

```env
VITE_NASA_API_KEY=tu_api_key_aqui
```

Para obtener tu propia API KEY:
1. Visita: https://api.nasa.gov/
2. Completa el formulario
3. Copia la API KEY al archivo `.env`

---

**Desarrollado con datos de NASA NeoWs API** 🛰️
