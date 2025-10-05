# 🚀 Quick Start - API Backend Integration

## ✅ Ya está todo integrado!

La integración con la API backend ya está funcionando en tu proyecto. No necesitas hacer nada más.

---

## 🎮 Cómo probarlo

### 1. Inicia el proyecto
```bash
npm run dev
```

### 2. Abre la aplicación
Ve a `http://localhost:5173` (o el puerto que uses)

### 3. Simula un impacto
1. Haz clic en "Simular impacto"
2. Haz clic en cualquier parte del planeta
3. ¡El asteroide impactará y verás los resultados del backend!

---

## 🔍 Ver los datos del backend

Abre la **Consola del Navegador** (F12) y busca estos mensajes:

```
[simulacion] 🚀 Solicitando simulación de impacto al backend...
[impactAPI] POST https://backend-ns-t0p7.onrender.com/api/impact/simulate
[impactAPI] ✅ Success: { impact_effects: { ... } }
[simulacion] ✅ Simulación backend exitosa
```

---

## 🧪 Probar la API manualmente

### Opción 1: Usar el Panel de Pruebas

1. Abre `src/components/simulacion.jsx`
2. Agrega al final del archivo (antes del `export default`):

```javascript
import APITestPanel from './APITestPanel';
```

3. Dentro del JSX de retorno, agrega:

```jsx
<APITestPanel />
```

4. Verás un panel en la esquina inferior izquierda con botones de prueba

### Opción 2: Consola del Navegador

```javascript
// En la consola del navegador:
const api = await import('./src/services/impactAPI.js');

// Probar health check
await api.checkHealth();

// Obtener asteroides
const neos = await api.getNearEarthAsteroids();
console.table(neos.slice(0, 10));

// Simular impacto
const result = await api.simulateImpact({
  diameter_m: 100,
  velocity_km_s: 20,
  impact_location: { lat: -16.4897, lon: -68.1193 }, // La Paz
  target_type: 'land'
});
console.log(result);
```

---

## 📊 Qué cambió

### Archivos Nuevos
- ✅ `src/services/impactAPI.js` - Servicio principal de la API
- ✅ `src/components/APITestPanel.jsx` - Panel de pruebas (opcional)
- ✅ `src/examples/apiExamples.js` - Ejemplos de uso
- ✅ `.env.example` - Template de configuración
- ✅ `API_INTEGRATION.md` - Documentación completa

### Archivos Modificados
- ✅ `src/components/simulacion.jsx` - Ahora usa la API backend

---

## 🔄 Flujo Automático

1. **Cargar NEOs**: Intenta backend → si falla, usa NASA directamente
2. **Simular Impacto**: Intenta backend → si falla, usa cálculo local
3. **Todo es transparente**: El usuario no nota si usa backend o local

---

## 🌐 Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Estado del servidor |
| `/api/asteroids/near-earth` | GET | Asteroides cercanos |
| `/api/impact/simulate` | POST | Simular impacto |
| `/api/impact/simulate-asteroid/:id` | POST | Simular por ID |

**Base URL:** `https://backend-ns-t0p7.onrender.com`

---

## 🎯 Próximos Pasos (Opcional)

### Activar el Panel de Pruebas
```jsx
// En simulacion.jsx, añade al final:
import APITestPanel from './APITestPanel';

// Dentro del return, al final:
{showHelpers && <APITestPanel />}
```

Ahora cuando actives "Mostrar helpers", verás el panel de pruebas.

### Ejecutar Ejemplos
```javascript
// En la consola del navegador:
const examples = await import('./src/examples/apiExamples.js');

// Ejecutar un ejemplo específico:
await examples.example3_simulateBasicImpact();

// Ejecutar TODOS los ejemplos:
await examples.runAllExamples();
```

---

## ❓ FAQ

**Q: ¿Necesito configurar algo?**  
A: No, todo ya está configurado por defecto.

**Q: ¿Funciona sin internet?**  
A: Sí, automáticamente usa cálculos locales si el backend no está disponible.

**Q: ¿Cómo sé si está usando el backend?**  
A: Mira la consola del navegador (F12) y busca mensajes `[impactAPI]`.

**Q: ¿Puedo usar mi propio backend?**  
A: Sí, crea un archivo `.env` y cambia `VITE_BACKEND_URL=http://localhost:5000`

**Q: El backend es muy lento**  
A: Es normal la primera vez (cold start). Las siguientes llamadas son más rápidas.

---

## 🐛 Solución de Problemas

### Error en consola: "Failed to fetch"
✅ **Normal**: Significa que el backend no está disponible.  
✅ **Acción**: La app usa cálculos locales automáticamente.

### No veo diferencia en los resultados
✅ **Normal**: Los cálculos locales son bastante precisos.  
✅ **Diferencia**: El backend añade tsunamis, ondas sísmicas, etc.

### Quiero forzar el uso del backend
```javascript
// Modifica simulacion.jsx, línea ~150:
// Quita el try/catch para que falle si el backend no responde
const backendSimulation = await simulateImpact({ ... });
```

---

## 📚 Documentación Completa

Lee `API_INTEGRATION.md` para documentación detallada con:
- Todos los endpoints disponibles
- Parámetros y respuestas
- Ejemplos de código
- Comparación backend vs local
- Troubleshooting avanzado

---

**¡Ya está listo para usar! 🎉**

Simplemente inicia el proyecto y haz click en el planeta.
