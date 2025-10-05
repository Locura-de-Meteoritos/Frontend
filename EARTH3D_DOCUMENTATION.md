# 🌍 Documentación Earth3D - Modelo Ultra-Realista

## Descripción General

`Earth3D.jsx` es un componente avanzado de React Three Fiber que renderiza un modelo 3D ultra-realista de la Tierra con dos modos de operación:

1. **Modo NASA**: Usa texturas reales de alta resolución de la NASA
2. **Modo Procedimental**: Genera el planeta completamente mediante código (sin archivos externos)

---

## 🎯 Características Principales

### Sistema Multi-Capa (4 capas)
- ✅ **Océanos**: Base azul brillante con propiedades reflectantes
- ✅ **Continentes**: Relieve detallado con bump mapping (512x512 en modo procedimental)
- ✅ **Nubes**: Capa independiente con alpha mapping y rotación diferencial
- ✅ **Atmósfera**: Glow azul con Rayleigh scattering y viewVector dinámico

### Geometría Avanzada
- Radio configurable (por defecto 100 unidades)
- Alta resolución: hasta 512x512 vértices
- Bump mapping automático
- Normal maps calculados

### Sistema de Iluminación Profesional
- **DirectionalLight** (Sol): Simula iluminación solar desde (500, 200, 500)
- **AmbientLight**: Iluminación global tenue (0.15)
- **HemisphereLight**: Diferencia cielo/tierra
- **PointLight**: Luz de relleno azul
- **SpotLight**: Luz adicional para detalles

---

## 📝 Uso Básico

### Modo Procedimental (por defecto)
```jsx
import Earth3D from './components/Earth3D';

function App() {
  const earthRef = useRef();
  
  return (
    <Canvas>
      <Earth3D 
        earthRef={earthRef}
        planetRadius={100}
        showAtmosphere={true}
        showClouds={true}
      />
    </Canvas>
  );
}
```

### Modo NASA (con texturas reales)
```jsx
<Earth3D 
  earthRef={earthRef}
  planetRadius={100}
  useRealTextures={true}  // ⭐ Activar texturas NASA
  showAtmosphere={true}
  showClouds={true}
/>
```

---

## ⚙️ Props Configurables

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `earthRef` | Ref | - | Referencia al grupo del planeta |
| `planetRadius` | Number | 100 | Radio del planeta en unidades |
| `planetOffsetY` | Number | -0.4 | Desplazamiento vertical |
| `paused` | Boolean | false | Pausar animaciones |
| `onPointerDown` | Function | - | Manejador de clicks |
| `craters` | Array | [] | Array de cráteres para renderizar |
| `useRealTextures` | Boolean | false | **NUEVO**: Usar texturas NASA |
| `showAtmosphere` | Boolean | true | Mostrar capa de atmósfera |
| `showClouds` | Boolean | true | Mostrar capa de nubes |
| `earthTilt` | Number | 23.5 | Inclinación axial en grados |
| `rotationSpeed` | Number | 0.01 | Velocidad de rotación (rad/s) |
| `cloudRotationSpeed` | Number | 0.008 | Velocidad de nubes (rad/s) |
| `enableAutoRotate` | Boolean | false | Auto-rotación de cámara |

---

## 🎨 Sistema de Colorización Geográfica (Modo Procedimental)

### Zonas Climáticas
- **Polar** (>75°): Hielo y tundra (blanco-azulado)
- **Templado** (40-75°): Bosques y praderas verdes
- **Tropical** (0-40°): 
  - Selvas (verde intenso)
  - Desiertos (beige/arena)
  - Sabanas (verde-amarillento)

### Elevación
- **Montañas altas**: Rocas grises con línea de nieve
- **Tierras medias**: Verde/marrón variado
- **Costas**: Tierras bajas verdes

---

## 🌐 Texturas NASA Utilizadas

Cuando `useRealTextures={true}`, el componente carga:

1. **Day Texture**: Mapa de color de la superficie terrestre
   - URL: NASA Earth Observatory (world.topo.bathy)
   
2. **Night Texture**: Luces nocturnas (usado como specular map)
   - URL: NASA Black Marble (dnb_land_ocean_ice)
   
3. **Normal Map**: Mapa de normales para relieve
   - URL: Cesium Assets (World_Normal)
   
4. **Clouds Texture**: Mapa de nubes con transparencia
   - URL: Cesium Assets (World_Clouds)

### Manejo de Errores
Si las texturas no se pueden cargar (CORS, red, etc.), el sistema automáticamente:
1. Muestra una esfera azul simple durante la carga
2. Cambia al modo procedimental si la carga falla
3. Registra advertencias en la consola

---

## 🔧 API Pública (earthRef)

```javascript
earthRef.current.getLatLng(worldPoint)
// Convierte coordenadas 3D a latitud/longitud

earthRef.current.getLatLngFromEvent(event)
// Obtiene lat/lng desde un evento de click

earthRef.current.getEarthMesh()
// Acceso al mesh principal de la Tierra

earthRef.current.getOceanMesh()
// Acceso al mesh de océanos (solo modo procedimental)

earthRef.current.getCloudsMesh()
// Acceso a la capa de nubes

earthRef.current.getAtmosphereMesh()
// Acceso a la atmósfera
```

---

## 🎭 Shaders Personalizados

### Shader de Nubes (Modo Procedimental)
- 6 octavas de ruido FBM
- Turbulencia animada con `uTime`
- Efecto fresnel para bordes difusos
- Variación por latitud (más nubes en ecuador)

### Shader de Atmósfera
- **viewVector dinámico** (inspirado en código NASA)
- Efecto fresnel combinado
- Glow azul con additive blending
- Opacidad gradiente

---

## 🚀 Optimizaciones

1. **Geometrías precalculadas**: Todos los buffers se generan una sola vez
2. **Cleanup automático**: Dispose de texturas y geometrías al desmontar
3. **Vertex shader optimization**: Cálculos intensivos en GPU
4. **Renderizado condicional**: Solo renderiza capas activas

---

## 🎯 Casos de Uso

### Simulador de Impactos de Asteroides
```jsx
const handleAsteroidImpact = (event) => {
  const coords = earthRef.current.getLatLngFromEvent(event);
  console.log(`Impacto en: ${coords.lat}°, ${coords.lng}°`);
};

<Earth3D 
  earthRef={earthRef}
  onPointerDown={handleAsteroidImpact}
  craters={impactCraters}
/>
```

### Visualización Educativa
```jsx
<Earth3D 
  planetRadius={150}
  rotationSpeed={0.02}
  enableAutoRotate={true}
  useRealTextures={true}
/>
```

### Demo Interactiva
```jsx
<Earth3D 
  planetRadius={100}
  showAtmosphere={showAtmo}
  showClouds={showClouds}
  paused={isPaused}
/>
```

---

## ⚠️ Consideraciones

### CORS y Texturas Externas
Las texturas de la NASA pueden tener restricciones CORS. Si las texturas no cargan:
- El componente automáticamente usa modo procedimental
- Considera usar un proxy CORS
- O descarga las texturas y sírvelas localmente

### Rendimiento
- Modo NASA: Más rápido de inicializar, pero depende de red
- Modo Procedimental: Más lento inicialmente (512x512 vértices), pero sin dependencias externas

### Compatibilidad
- Requiere WebGL 2.0
- Probado en Chrome, Firefox, Edge, Safari

---

## 🛠️ Próximas Mejoras Posibles

- [ ] Soporte para texturas locales (sin URLs externas)
- [ ] Modo híbrido: texturas + generación procedimental combinados
- [ ] Shader de océano con olas animadas
- [ ] Sistema de clima dinámico
- [ ] Integración con APIs meteorológicas en tiempo real

---

## 📚 Referencias

- [NASA Earth Observatory](https://earthobservatory.nasa.gov/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Cesium Assets](https://cesium.com/)

---

**Autor**: Sistema de IA avanzado  
**Versión**: 2.0 (Sistema Híbrido)  
**Fecha**: Octubre 2025
