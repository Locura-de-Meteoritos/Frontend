# 🌍 Información de Texturas de la Tierra

## Fuente Actual (Sin CORS)
**Repositorio:** [webgl-earth by turban](https://github.com/turban/webgl-earth)  
**Ventajas:**
- ✅ Sin problemas de CORS
- ✅ Texturas 4K de alta calidad
- ✅ Servidor confiable (GitHub Raw)
- ✅ Gratuito y open-source

## Texturas Utilizadas

### 1. Textura Diurna (Day Map)
- **URL:** `https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg`
- **Resolución:** 4096 x 2048 px (4K)
- **Descripción:** Mapa de la Tierra sin nubes, muestra continentes, océanos y topografía
- **Uso:** `map` en MeshPhongMaterial

### 2. Textura Nocturna (Night Lights)
- **URL:** `https://raw.githubusercontent.com/turban/webgl-earth/master/images/5_night_4k.jpg`
- **Resolución:** 4096 x 2048 px (4K)
- **Descripción:** Luces de ciudades visibles desde el espacio
- **Uso:** `specularMap` en MeshPhongMaterial

### 3. Textura de Elevación (Bump/Normal Map)
- **URL:** `https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg`
- **Resolución:** 4096 x 2048 px (4K)
- **Descripción:** Mapa de elevación para crear relieve (montañas, valles)
- **Uso:** `normalMap` y `bumpMap` en MeshPhongMaterial

### 4. Textura de Nubes
- **URL:** `https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png`
- **Formato:** PNG con canal alpha
- **Resolución:** 4096 x 2048 px (4K)
- **Descripción:** Capa de nubes con transparencia
- **Uso:** `map` en MeshPhongMaterial de nubes

## Fuentes Alternativas (por si falla la principal)

### Opción 2: Three.js Examples
```javascript
// Texturas de ejemplo de Three.js
'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
'https://threejs.org/examples/textures/planets/earth_lights_2048.png'
'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'
'https://threejs.org/examples/textures/planets/earth_clouds_1024.png'
```
**Resolución:** 2K (2048 x 1024)

### Opción 3: NASA Visible Earth (requiere proxy CORS)
```javascript
// Texturas NASA de máxima calidad (requieren proxy)
'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg'
'https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg'
```
**Resolución:** 5400 x 2700 (8K) y 3600 x 1800
**Problema:** Bloqueadas por CORS

## Solución de Problemas CORS

Si las texturas no cargan por CORS, hay 3 opciones:

### 1. Usar Proxy CORS (Desarrollo)
```javascript
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const url = corsProxy + 'https://eoimages.gsfc.nasa.gov/images/...';
```

### 2. Descargar y Hospedar Localmente
```bash
# Descargar texturas al proyecto
mkdir public/textures
wget -O public/textures/earth_day_4k.jpg https://raw.githubusercontent.com/...
```

Luego usar rutas locales:
```javascript
loader.loadAsync('/textures/earth_day_4k.jpg')
```

### 3. Configurar Backend con CORS Headers
Si tienes un backend, puedes servir las texturas con headers CORS apropiados.

## Performance Tips

### Reducir Tamaño para Mejor Rendimiento
Si la app es lenta con texturas 4K, usa versiones 2K:
```javascript
// Cambiar 4k por 2k en las URLs
'2_no_clouds_2k.jpg' // En lugar de 4k
```

### Lazy Loading
Las texturas se cargan de forma asíncrona con `Promise.all()` para mejor UX.

### Compresión
Considera comprimir texturas con herramientas como:
- **Squoosh** (https://squoosh.app/)
- **TinyPNG** (https://tinypng.com/)
- **ImageMagick**

## Atribución

Las texturas actuales provienen del proyecto **webgl-earth** por Bjørn Sandvik.
- **Licencia:** Probablemente MIT/Creative Commons (verificar en el repo)
- **Autor:** Bjørn Sandvik (@turban)
- **Repo:** https://github.com/turban/webgl-earth

---

## Changelog

### v2.0 (Actual)
- ✅ Reemplazadas URLs de NASA por GitHub (sin CORS)
- ✅ Texturas 4K de alta calidad
- ✅ Todas las texturas funcionando correctamente

### v1.0 (Anterior)
- ❌ URLs de NASA bloqueadas por CORS
- ❌ Cesium Assets no resueltas
- ❌ Planeta no se visualizaba correctamente
