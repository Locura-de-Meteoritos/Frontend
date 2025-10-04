/**
 * =============================================================================
 * MÓDULO DE CÁLCULOS AVANZADOS DE IMPACTO DE ASTEROIDES
 * =============================================================================
 * 
 * Este módulo centraliza todas las fórmulas y cálculos relacionados con
 * impactos de asteroides, basado en el sistema IMPACTUS de NASA.
 * 
 * Fuentes:
 * - NASA NEO API
 * - CNEOS JPL (Jet Propulsion Laboratory)
 * - Fórmulas de explosiones nucleares (para radios de daño)
 * - Datos históricos de impactos reales
 * 
 * Conversiones importantes:
 * - 1 kilotón de TNT = 4.184 × 10^12 Joules
 * - Densidad asteroide típica: 2000-3000 kg/m³
 * - Velocidad impacto típica: 11-70 km/s
 */

// =============================================================================
// EVENTOS HISTÓRICOS DE REFERENCIA
// =============================================================================
export const HISTORICAL_EVENTS = [
  {
    name: "Cheliábinsk (2013)",
    diameter: 20, // metros
    velocity: 19, // km/s
    energy: 500, // kilotones
    location: "Rusia",
    casualties: "1,500+ heridos",
    description: "Meteorito que explotó sobre Rusia causando daños generalizados",
    lat: 54.8,
    lng: 61.1
  },
  {
    name: "Tunguska (1908)",
    diameter: 60, // metros
    velocity: 15, // km/s
    energy: 15000, // kilotones (15 megatones)
    location: "Siberia, Rusia",
    casualties: "2,000 km² de bosque devastado",
    description: "Explosión aérea que destruyó 80 millones de árboles",
    lat: 60.9,
    lng: 101.9
  },
  {
    name: "Chicxulub - Extinción K-T (66M años)",
    diameter: 10000, // metros (10 km)
    velocity: 20, // km/s
    energy: 100000000, // kilotones (100,000 megatones)
    location: "Península de Yucatán, México",
    casualties: "Extinción masiva (75% de especies)",
    description: "Impacto que causó la extinción de los dinosaurios",
    lat: 21.4,
    lng: -89.5
  },
  {
    name: "Barringer Crater (50,000 años)",
    diameter: 50, // metros
    velocity: 12.8, // km/s
    energy: 2500, // kilotones (2.5 megatones)
    location: "Arizona, EE.UU.",
    casualties: "Cráter de 1.2 km de diámetro",
    description: "Uno de los cráteres mejor preservados en la Tierra",
    lat: 35.0,
    lng: -111.0
  }
];

// =============================================================================
// CÁLCULO DE ENERGÍA DE IMPACTO
// =============================================================================

/**
 * Calcula la energía de impacto en kilotones de TNT
 * 
 * @param {number} diameter - Diámetro del asteroide en metros
 * @param {number} velocity - Velocidad de impacto en km/s
 * @param {number} density - Densidad en kg/m³ (por defecto 2500)
 * @returns {number} Energía en kilotones de TNT
 */
export function calculateImpactEnergy(diameter, velocity, density = 2500) {
  // Calcular volumen de la esfera (4/3 * π * r³)
  const radius = diameter / 2; // metros
  const volume = (4/3) * Math.PI * Math.pow(radius, 3); // m³
  
  // Calcular masa (volumen * densidad)
  const mass = volume * density; // kg
  
  // Calcular energía cinética: E = 0.5 * m * v²
  const velocityMs = velocity * 1000; // convertir km/s a m/s
  const energyJoules = 0.5 * mass * Math.pow(velocityMs, 2); // Joules
  
  // Convertir a kilotones de TNT (1 kilotón = 4.184 × 10^12 J)
  const kilotons = energyJoules / (4.184 * Math.pow(10, 12));
  
  return kilotons;
}

/**
 * Calcula la energía en diferentes unidades
 * 
 * @param {number} kilotons - Energía en kilotones
 * @returns {object} Objeto con energía en diferentes unidades
 */
export function convertEnergy(kilotons) {
  return {
    kilotons: kilotons,
    megatons: kilotons / 1000,
    joules: kilotons * 4.184 * Math.pow(10, 12),
    terajoules: (kilotons * 4.184 * Math.pow(10, 12)) / Math.pow(10, 12),
    hiroshimasEquivalent: kilotons / 15 // Bomba de Hiroshima ≈ 15 kt
  };
}

// =============================================================================
// CÁLCULO DE RADIOS DE DAÑO
// =============================================================================

/**
 * Calcula los radios de daño basados en fórmulas de explosiones nucleares
 * 
 * La fórmula básica es: R = C * E^(1/3)
 * donde R es el radio, C es una constante y E es la energía
 * 
 * @param {number} energyKilotons - Energía en kilotones
 * @returns {object} Radios de daño en km
 */
export function calculateDamageRadii(energyKilotons) {
  // Fórmulas basadas en escala cúbica (típica de explosiones)
  const cbrt = Math.pow(energyKilotons, 1/3);
  
  return {
    // Radio de destrucción total (sobrepresión > 20 psi)
    total: cbrt * 0.5, // km
    
    // Radio de daño estructural severo (sobrepresión 5-20 psi)
    severe: cbrt * 1.0, // km
    
    // Radio de daño moderado (sobrepresión 1-5 psi)
    moderate: cbrt * 1.5, // km
    
    // Radio de daño leve (vidrios rotos, heridos leves)
    light: cbrt * 3.0, // km
    
    // Radio de radiación térmica (quemaduras de 3er grado)
    thermal: cbrt * 2.5, // km
    
    // Radio de incendios masivos
    fireball: cbrt * 0.8 // km
  };
}

// =============================================================================
// CÁLCULO DE CONSECUENCIAS
// =============================================================================

/**
 * Detecta si el punto de impacto está en océano o tierra
 * Simplificación: asume que latitudes cerca del ecuador y longitudes
 * específicas son océano (Pacífico, Atlántico, Índico)
 * 
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} true si es océano, false si es tierra
 */
export function isOceanImpact(lat, lng) {
  // Océano Pacífico (aproximadamente)
  if (lat > -60 && lat < 60 && lng > 120 && lng < -70) return true;
  if (lat > -60 && lat < 60 && lng > -180 && lng < -70) return true;
  
  // Océano Atlántico
  if (lat > -60 && lat < 60 && lng > -70 && lng < 20) return true;
  
  // Océano Índico
  if (lat > -60 && lat < 30 && lng > 20 && lng < 120) return true;
  
  // Por defecto, cerca del ecuador suele ser océano
  return Math.abs(lat) < 60 && (lng < -30 || lng > 120);
}

/**
 * Calcula el riesgo de tsunami
 * 
 * @param {number} energyKilotons - Energía del impacto
 * @param {boolean} ocean - Si el impacto es en océano
 * @returns {object} Información sobre riesgo de tsunami
 */
export function calculateTsunamiRisk(energyKilotons, ocean) {
  if (!ocean) {
    return {
      risk: 'BAJO',
      waveHeight: 0,
      affectedCoastline: 0,
      description: 'Impacto en tierra - sin riesgo de tsunami'
    };
  }
  
  // Fórmula simplificada: altura de ola proporcional a E^0.4
  const waveHeight = Math.pow(energyKilotons / 100, 0.4) * 10; // metros
  const affectedCoastline = Math.pow(energyKilotons, 0.5) * 5; // km
  
  let risk = 'BAJO';
  if (energyKilotons > 10000) risk = 'CATASTRÓFICO';
  else if (energyKilotons > 1000) risk = 'MUY ALTO';
  else if (energyKilotons > 100) risk = 'ALTO';
  else if (energyKilotons > 10) risk = 'MODERADO';
  
  return {
    risk,
    waveHeight: Math.round(waveHeight),
    affectedCoastline: Math.round(affectedCoastline),
    description: `Olas de ~${Math.round(waveHeight)}m afectando ${Math.round(affectedCoastline)}km de costa`
  };
}

/**
 * Estima la magnitud sísmica (escala Richter)
 * 
 * @param {number} energyKilotons - Energía del impacto
 * @returns {object} Información sísmica
 */
export function calculateSeismicActivity(energyKilotons) {
  // Conversión aproximada: log10(E_TNT) ≈ 1.5 * M + 4.8
  // donde E_TNT está en kg de TNT
  const energyKgTNT = energyKilotons * 1e6; // convertir kt a kg
  const magnitude = (Math.log10(energyKgTNT) - 4.8) / 1.5;
  
  let description = '';
  if (magnitude >= 9) description = 'Terremoto mega-masivo, devastación continental';
  else if (magnitude >= 8) description = 'Terremoto masivo, destrucción regional';
  else if (magnitude >= 7) description = 'Terremoto mayor, daños extensos';
  else if (magnitude >= 6) description = 'Terremoto fuerte, daños estructurales';
  else if (magnitude >= 5) description = 'Terremoto moderado, daños menores';
  else description = 'Actividad sísmica leve';
  
  return {
    magnitude: Math.max(0, magnitude).toFixed(1),
    description,
    felt: magnitude > 4 ? `Sentido hasta ${Math.pow(10, magnitude - 3).toFixed(0)} km` : 'Impacto local'
  };
}

/**
 * Evalúa el cambio atmosférico y clima
 * 
 * @param {number} energyKilotons - Energía del impacto
 * @param {number} diameter - Diámetro del asteroide en metros
 * @returns {object} Efectos atmosféricos
 */
export function calculateAtmosphericEffects(energyKilotons, diameter) {
  let risk = 'MÍNIMO';
  let description = 'Sin efectos significativos en la atmósfera';
  let dustTons = diameter * 10; // estimación muy simple
  let coolingYears = 0;
  
  if (energyKilotons > 100000000) {
    risk = 'EXTINCIÓN MASIVA';
    description = 'Invierno de impacto, oscuridad global por décadas';
    coolingYears = 10;
    dustTons = diameter * 1000000;
  } else if (energyKilotons > 1000000) {
    risk = 'INVIERNO NUCLEAR';
    description = 'Enfriamiento global severo por años';
    coolingYears = 5;
    dustTons = diameter * 100000;
  } else if (energyKilotons > 100000) {
    risk = 'ALTO';
    description = 'Nube de polvo global, enfriamiento temporal';
    coolingYears = 2;
    dustTons = diameter * 10000;
  } else if (energyKilotons > 10000) {
    risk = 'MODERADO';
    description = 'Nube regional de polvo, efectos climáticos locales';
    coolingYears = 0.5;
    dustTons = diameter * 1000;
  }
  
  return {
    risk,
    description,
    dustTons: Math.round(dustTons),
    coolingYears,
    ozoneDepletion: energyKilotons > 50000
  };
}

/**
 * Estima la población en riesgo
 * 
 * @param {object} radii - Radios de daño
 * @param {number} lat - Latitud del impacto
 * @param {number} lng - Longitud del impacto
 * @returns {object} Estimación de población afectada
 */
export function estimatePopulationAtRisk(radii, lat, lng) {
  // Densidad poblacional aproximada (muy simplificado)
  // Mayor cerca del ecuador y en continentes principales
  let densityFactor = 1;
  
  // Zonas altamente pobladas (aproximación)
  if (Math.abs(lat) < 40) densityFactor *= 2; // Trópicos y subtrópicos
  if (lng > 0 && lng < 150) densityFactor *= 2; // Asia
  if (lng > -100 && lng < -30) densityFactor *= 1.5; // Américas
  
  // Densidad promedio mundial: ~60 personas/km²
  const avgDensity = 60 * densityFactor;
  
  // Calcular población en cada zona
  const areaTotal = Math.PI * Math.pow(radii.total, 2);
  const areaSevere = Math.PI * Math.pow(radii.severe, 2);
  const areaModerate = Math.PI * Math.pow(radii.moderate, 2);
  
  return {
    total: Math.round(areaModerate * avgDensity),
    severe: Math.round(areaSevere * avgDensity),
    critical: Math.round(areaTotal * avgDensity),
    evacuationRadius: radii.light
  };
}

/**
 * Calcula riesgo de incendios masivos
 * 
 * @param {number} energyKilotons - Energía del impacto
 * @param {object} radii - Radios de daño
 * @returns {object} Información sobre incendios
 */
export function calculateFireRisk(energyKilotons, radii) {
  const hasFirestorm = energyKilotons > 100;
  
  return {
    risk: hasFirestorm ? 'ALTO' : 'BAJO',
    radius: radii.fireball,
    description: hasFirestorm 
      ? `Incendios masivos en un radio de ${radii.fireball.toFixed(1)} km`
      : 'Riesgo mínimo de incendios extendidos',
    firestorm: energyKilotons > 1000
  };
}

// =============================================================================
// COMPARACIÓN CON EVENTOS HISTÓRICOS
// =============================================================================

/**
 * Compara el impacto actual con eventos históricos
 * 
 * @param {number} energyKilotons - Energía del impacto actual
 * @returns {object} Comparación con el evento más cercano
 */
export function compareWithHistory(energyKilotons) {
  // Encontrar el evento histórico más cercano
  let closest = HISTORICAL_EVENTS[0];
  let minDiff = Math.abs(Math.log10(energyKilotons) - Math.log10(closest.energy));
  
  HISTORICAL_EVENTS.forEach(event => {
    const diff = Math.abs(Math.log10(energyKilotons) - Math.log10(event.energy));
    if (diff < minDiff) {
      minDiff = diff;
      closest = event;
    }
  });
  
  const ratio = energyKilotons / closest.energy;
  
  let comparison = '';
  if (ratio > 2) {
    comparison = `${ratio.toFixed(1)}× MÁS POTENTE que ${closest.name}`;
  } else if (ratio > 0.5) {
    comparison = `Similar al ${closest.name}`;
  } else {
    comparison = `${(1/ratio).toFixed(1)}× MENOR que ${closest.name}`;
  }
  
  return {
    event: closest,
    ratio,
    comparison,
    severity: energyKilotons > 15000 ? 'CATASTRÓFICO' : 
              energyKilotons > 500 ? 'SEVERO' : 
              energyKilotons > 50 ? 'MODERADO' : 'LEVE'
  };
}

// =============================================================================
// CÁLCULO COMPLETO DE IMPACTO
// =============================================================================

/**
 * Calcula todas las consecuencias de un impacto
 * 
 * @param {object} params - Parámetros del asteroide
 * @returns {object} Análisis completo del impacto
 */
export function calculateFullImpact({
  diameter,      // metros
  velocity,      // km/s
  density = 2500, // kg/m³
  lat = 0,       // latitud
  lng = 0        // longitud
}) {
  // Calcular energía
  const energy = calculateImpactEnergy(diameter, velocity, density);
  const energyUnits = convertEnergy(energy);
  
  // Calcular radios de daño
  const radii = calculateDamageRadii(energy);
  
  // Determinar tipo de impacto
  const ocean = isOceanImpact(lat, lng);
  
  // Calcular consecuencias
  const tsunami = calculateTsunamiRisk(energy, ocean);
  const seismic = calculateSeismicActivity(energy);
  const atmospheric = calculateAtmosphericEffects(energy, diameter);
  const population = estimatePopulationAtRisk(radii, lat, lng);
  const fire = calculateFireRisk(energy, radii);
  
  // Comparación histórica
  const historical = compareWithHistory(energy);
  
  return {
    energy: energyUnits,
    radii,
    impactType: ocean ? 'OCÉANO' : 'TIERRA',
    consequences: {
      tsunami,
      seismic,
      atmospheric,
      population,
      fire
    },
    historical,
    summary: {
      severity: historical.severity,
      primaryThreat: ocean ? 'Tsunami' : 
                      energy > 10000 ? 'Cambio Climático Global' :
                      energy > 1000 ? 'Devastación Regional' :
                      'Destrucción Local'
    }
  };
}

export default {
  HISTORICAL_EVENTS,
  calculateImpactEnergy,
  convertEnergy,
  calculateDamageRadii,
  isOceanImpact,
  calculateTsunamiRisk,
  calculateSeismicActivity,
  calculateAtmosphericEffects,
  estimatePopulationAtRisk,
  calculateFireRisk,
  compareWithHistory,
  calculateFullImpact
};
