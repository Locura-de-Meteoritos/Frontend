/**
 * ============================================================================
 * SERVICIO DE API - SIMULACIÓN DE IMPACTOS DE ASTEROIDES
 * ============================================================================
 * 
 * Este módulo centraliza todas las llamadas al backend de simulación de impactos.
 * Backend URL: https://backend-ns-t0p7.onrender.com
 * 
 * Endpoints disponibles:
 * - GET  /health                              - Health check del servidor
 * - GET  /api/asteroids/near-earth            - Obtener asteroides cercanos NASA
 * - POST /api/impact/simulate                 - Simular impacto con parámetros
 * - POST /api/impact/simulate-asteroid/:id    - Simular impacto por ID de asteroide
 * 
 * @module impactAPI
 */

// URL base del backend (se puede configurar mediante variable de entorno)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-ns-t0p7.onrender.com';

/**
 * Wrapper genérico para fetch con manejo de errores
 * @param {string} endpoint - Endpoint relativo (ej: '/health')
 * @param {object} options - Opciones de fetch (method, headers, body, etc)
 * @returns {Promise<any>} - Respuesta parseada como JSON
 * @throws {Error} - Si la petición falla o el servidor devuelve error
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`[impactAPI] ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || 
        errorData.message || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`[impactAPI] ✅ Success:`, data);
    return data;
  } catch (error) {
    console.error(`[impactAPI] ❌ Error en ${endpoint}:`, error);
    throw error;
  }
}

/**
 * ============================================================================
 * HEALTH CHECK
 * ============================================================================
 */

/**
 * Verifica el estado del backend
 * @returns {Promise<{status: string, timestamp: string}>}
 */
export async function checkHealth() {
  return apiFetch('/health');
}

/**
 * ============================================================================
 * ASTEROIDES CERCANOS (NASA NEO API)
 * ============================================================================
 */

/**
 * Obtiene la lista de asteroides cercanos a la Tierra desde la API de NASA
 * El backend actúa como proxy y enriquece los datos
 * 
 * @param {object} options - Opciones de consulta
 * @param {string} options.startDate - Fecha inicio (formato YYYY-MM-DD)
 * @param {string} options.endDate - Fecha fin (formato YYYY-MM-DD)
 * @param {boolean} options.hazardousOnly - Solo asteroides peligrosos
 * @returns {Promise<Array>} - Array de asteroides con datos enriquecidos
 */
export async function getNearEarthAsteroids(options = {}) {
  const queryParams = new URLSearchParams();
  
  if (options.startDate) queryParams.append('start_date', options.startDate);
  if (options.endDate) queryParams.append('end_date', options.endDate);
  if (options.hazardousOnly) queryParams.append('hazardous_only', 'true');
  
  const endpoint = `/api/asteroids/near-earth${queryParams.toString() ? `?${queryParams}` : ''}`;
  return apiFetch(endpoint);
}

/**
 * ============================================================================
 * SIMULACIÓN DE IMPACTOS
 * ============================================================================
 */

/**
 * Simula un impacto de asteroide con parámetros específicos
 * Utiliza los modelos físicos del backend para cálculos precisos
 * 
 * @param {object} params - Parámetros del impacto
 * @param {number} params.diameter_m - Diámetro del asteroide en metros
 * @param {number} params.velocity_km_s - Velocidad de impacto en km/s
 * @param {object} params.impact_location - Ubicación del impacto
 * @param {number} params.impact_location.lat - Latitud (-90 a 90)
 * @param {number} params.impact_location.lon - Longitud (-180 a 180)
 * @param {string} params.target_type - Tipo de objetivo ('land' o 'water')
 * @param {number} [params.density] - Densidad del asteroide (kg/m³, opcional)
 * @param {number} [params.angle] - Ángulo de impacto en grados (opcional, default 45)
 * @returns {Promise<object>} - Resultados detallados de la simulación
 */
export async function simulateImpact(params) {
  return apiFetch('/api/impact/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Simula un impacto usando datos directos de NASA
 * El backend extrae diámetro y velocidad de los datos NASA
 * 
 * @param {object} params - Parámetros del impacto
 * @param {object} params.nasa_data - Datos del asteroide de NASA
 * @param {number} params.nasa_data.diameter_max_m - Diámetro máximo estimado
 * @param {number} params.nasa_data.diameter_min_m - Diámetro mínimo estimado
 * @param {Array} params.nasa_data.close_approach_data - Datos de aproximación
 * @param {object} params.impact_location - Ubicación del impacto
 * @param {number} params.impact_location.lat - Latitud
 * @param {number} params.impact_location.lon - Longitud
 * @param {string} params.target_type - Tipo de objetivo ('land' o 'water')
 * @returns {Promise<object>} - Resultados detallados de la simulación
 */
export async function simulateImpactFromNASA(params) {
  return apiFetch('/api/impact/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Simula un impacto usando el ID de un asteroide de NASA
 * El backend obtiene los datos del asteroide automáticamente
 * 
 * @param {string} asteroidId - ID del asteroide en la base de datos NASA
 * @param {object} impactData - Datos del impacto
 * @param {object} impactData.impact_location - Ubicación del impacto
 * @param {number} impactData.impact_location.lat - Latitud
 * @param {number} impactData.impact_location.lon - Longitud
 * @param {string} impactData.target_type - Tipo de objetivo ('land' o 'water')
 * @returns {Promise<object>} - Resultados detallados de la simulación
 */
export async function simulateImpactByAsteroidId(asteroidId, impactData) {
  return apiFetch(`/api/impact/simulate-asteroid/${asteroidId}`, {
    method: 'POST',
    body: JSON.stringify(impactData),
  });
}

/**
 * ============================================================================
 * UTILIDADES Y HELPERS
 * ============================================================================
 */

/**
 * Convierte coordenadas lat/lng a un objeto válido para la API
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {object} - {lat, lon}
 */
export function createImpactLocation(lat, lng) {
  return {
    lat: Number(lat),
    lon: Number(lng),
  };
}

/**
 * Determina el tipo de objetivo basado en coordenadas (simplificado)
 * TODO: Implementar detección real usando un servicio de geocodificación
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {string} - 'land' o 'water'
 */
export function guessTargetType(lat, lng) {
  // Simplificación: océanos principales
  // Pacífico: lat entre -60 y 60, lon entre -180 y -70 o 120 y 180
  // Atlántico: lat entre -60 y 60, lon entre -70 y 20
  // Índico: lat entre -60 y 30, lon entre 20 y 120
  
  const isPacific = (lng < -70 || lng > 120);
  const isAtlantic = (lng >= -70 && lng <= 20);
  const isIndian = (lng > 20 && lng <= 120 && lat < 30);
  
  if (isPacific || isAtlantic || isIndian) {
    return 'water';
  }
  
  return 'land'; // Por defecto tierra
}

/**
 * Convierte los datos de un asteroide del catálogo NEO al formato
 * esperado por la API de simulación
 * @param {object} neoData - Datos del asteroide NASA
 * @returns {object} - Objeto listo para simulateImpactFromNASA
 */
export function convertNEOtoSimulationParams(neoData) {
  return {
    nasa_data: {
      diameter_max_m: neoData.estimated_diameter?.meters?.estimated_diameter_max || 100,
      diameter_min_m: neoData.estimated_diameter?.meters?.estimated_diameter_min || 50,
      close_approach_data: neoData.close_approach_data || [],
    },
    // La ubicación y tipo de objetivo se añadirán cuando el usuario haga clic
  };
}

/**
 * ============================================================================
 * EXPORTACIÓN DEFAULT
 * ============================================================================
 */
export default {
  checkHealth,
  getNearEarthAsteroids,
  simulateImpact,
  simulateImpactFromNASA,
  simulateImpactByAsteroidId,
  createImpactLocation,
  guessTargetType,
  convertNEOtoSimulationParams,
};
