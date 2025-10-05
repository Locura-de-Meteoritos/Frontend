const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.nasa.gov/neo/rest/v1';

// Log para verificar que la API key se carga correctamente
console.log('🔑 NASA API Key cargada:', API_KEY ? `${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}` : 'NO ENCONTRADA');

// Datos de ejemplo para fallback cuando la API falla
const FALLBACK_ASTEROIDS = [
  {
    id: '2000433',
    name: '433 Eros',
    is_potentially_hazardous_asteroid: false,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: 13.4, estimated_diameter_max: 22.1 }
    },
    close_approach_data: [{
      close_approach_date: new Date().toISOString().split('T')[0],
      miss_distance: { astronomical: '1.78' },
      relative_velocity: { kilometers_per_hour: '85320' }
    }]
  },
  {
    id: '2099942',
    name: '99942 Apophis',
    is_potentially_hazardous_asteroid: true,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: 0.31, estimated_diameter_max: 0.70 }
    },
    close_approach_data: [{
      close_approach_date: new Date().toISOString().split('T')[0],
      miss_distance: { astronomical: '0.098' },
      relative_velocity: { kilometers_per_hour: '30720' }
    }]
  },
  {
    id: '2001866',
    name: '1866 Sisyphus',
    is_potentially_hazardous_asteroid: false,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: 6.2, estimated_diameter_max: 8.9 }
    },
    close_approach_data: [{
      close_approach_date: new Date().toISOString().split('T')[0],
      miss_distance: { astronomical: '1.45' },
      relative_velocity: { kilometers_per_hour: '72450' }
    }]
  },
  {
    id: '2162173',
    name: '162173 Ryugu',
    is_potentially_hazardous_asteroid: true,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: 0.87, estimated_diameter_max: 1.02 }
    },
    close_approach_data: [{
      close_approach_date: new Date().toISOString().split('T')[0],
      miss_distance: { astronomical: '0.234' },
      relative_velocity: { kilometers_per_hour: '45600' }
    }]
  },
  {
    id: '2101955',
    name: '101955 Bennu',
    is_potentially_hazardous_asteroid: true,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: 0.45, estimated_diameter_max: 0.56 }
    },
    close_approach_data: [{
      close_approach_date: new Date().toISOString().split('T')[0],
      miss_distance: { astronomical: '0.18' },
      relative_velocity: { kilometers_per_hour: '38880' }
    }]
  }
];

// Genera asteroides adicionales para simular un cinturón
const generateMockAsteroids = (count = 20) => {
  const asteroids = [...FALLBACK_ASTEROIDS];
  
  for (let i = 0; i < count; i++) {
    asteroids.push({
      id: `mock_${Date.now()}_${i}`,
      name: `Asteroid ${1000 + i}`,
      is_potentially_hazardous_asteroid: Math.random() > 0.85,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: Math.random() * 2,
          estimated_diameter_max: Math.random() * 2 + 1
        }
      },
      close_approach_data: [{
        close_approach_date: new Date().toISOString().split('T')[0],
        miss_distance: { astronomical: (0.5 + Math.random() * 2).toFixed(3) },
        relative_velocity: { kilometers_per_hour: (20000 + Math.random() * 80000).toFixed(0) }
      }]
    });
  }
  
  return asteroids;
};

/**
 * Obtiene asteroides cercanos a la Tierra en un rango de fechas
 */
export const getAsteroidFeed = async (startDate, endDate) => {
  try {
    const url = `${BASE_URL}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;
    console.log(`🚀 Llamando NASA API: ${url.replace(API_KEY, 'API_KEY')}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // Si la API falla, usar datos de ejemplo
      const errorText = await response.text();
      console.error(`❌ NASA API error ${response.status}:`, errorText);
      throw new Error(`API_FALLBACK: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ NASA API respondió con datos reales`);
    return data.near_earth_objects;
  } catch (error) {
    // Fallback a datos de ejemplo si hay cualquier error
    console.warn('⚠️ Usando datos de asteroides de ejemplo (NASA API no disponible)');
    
    // Retornar en el formato esperado
    const today = new Date().toISOString().split('T')[0];
    return {
      [today]: generateMockAsteroids(25)
    };
  }
};

/**
 * Busca información detallada de un asteroide específico por su ID
 */
export const getAsteroidById = async (asteroidId) => {
  try {
    const url = `${BASE_URL}/neo/${asteroidId}?api_key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching asteroid ${asteroidId}:`, error);
    throw error;
  }
};

/**
 * Navega por el catálogo completo de asteroides
 */
export const browseAsteroids = async (page = 0, size = 20) => {
  try {
    const url = `${BASE_URL}/neo/browse?page=${page}&size=${size}&api_key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error browsing asteroids:', error);
    throw error;
  }
};

/**
 * Obtiene asteroides de hoy
 */
export const getTodayAsteroids = async () => {
  const today = new Date().toISOString().split('T')[0];
  return getAsteroidFeed(today, today);
};

/**
 * Obtiene asteroides de la última semana (con fallback a datos de ejemplo)
 */
export const getWeekAsteroids = async () => {
  try {
    // Usar fecha reciente pero no futura (la API solo tiene datos hasta cierto punto)
    // Usamos una semana que sabemos tiene datos
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Ayer (para evitar problemas con zona horaria)
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // 6 días antes = 7 días total (incluyendo el día final)
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log(`📡 Consultando NASA API: ${startDateStr} a ${endDateStr}`);
    
    return await getAsteroidFeed(startDateStr, endDateStr);
  } catch (error) {
    // Si todo falla, retornar datos de ejemplo
    console.warn('⚠️ Usando datos simulados de asteroides');
    const today = new Date().toISOString().split('T')[0];
    return {
      [today]: generateMockAsteroids(30)
    };
  }
};

/**
 * Convierte datos de asteroide de NASA a formato para renderizado 3D
 */
export const asteroidToRenderData = (asteroid) => {
  const closeApproach = asteroid.close_approach_data?.[0];
  
  if (!closeApproach) return null;
  
  // Distancia en AU (Unidades Astronómicas)
  const distanceAU = parseFloat(closeApproach.miss_distance?.astronomical || 1);
  
  // Tamaño estimado en kilómetros (promedio entre min y max)
  const diameterMin = asteroid.estimated_diameter?.kilometers?.estimated_diameter_min || 0.1;
  const diameterMax = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0.2;
  const diameterKm = (diameterMin + diameterMax) / 2;
  
  // Escala para visualización 3D (ajustado para que sea visible)
  const visualSize = Math.min(Math.max(diameterKm * 0.001, 0.05), 0.3);
  
  // Velocidad relativa
  const velocity = parseFloat(closeApproach.relative_velocity?.kilometers_per_hour || 0);
  
  return {
    id: asteroid.id,
    name: asteroid.name,
    isPotentiallyHazardous: asteroid.is_potentially_hazardous_asteroid,
    distance: distanceAU,
    diameter: diameterKm,
    visualSize,
    velocity,
    closeApproachDate: closeApproach.close_approach_date,
    // Posición orbital simplificada (usaremos distancia y un ángulo aleatorio)
    orbitalData: {
      semiMajorAxis: distanceAU,
      eccentricity: Math.random() * 0.2, // Simplificado
      inclination: (Math.random() - 0.5) * 0.3, // Simplificado
    }
  };
};

/**
 * Procesa múltiples asteroides para renderizado
 */
export const processAsteroidsForRender = (asteroidsData) => {
  const asteroids = [];
  
  // asteroidsData es un objeto con fechas como keys
  Object.values(asteroidsData).forEach(dayAsteroids => {
    dayAsteroids.forEach(asteroid => {
      const renderData = asteroidToRenderData(asteroid);
      if (renderData) {
        asteroids.push(renderData);
      }
    });
  });
  
  return asteroids;
};
