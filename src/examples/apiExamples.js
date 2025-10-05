/**
 * ============================================================================
 * EJEMPLOS DE USO - API BACKEND DE IMPACTOS
 * ============================================================================
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar el servicio impactAPI.
 * Puedes copiar y pegar estos ejemplos en tu código o ejecutarlos en la consola.
 */

import { 
  checkHealth,
  getNearEarthAsteroids,
  simulateImpact,
  simulateImpactFromNASA,
  simulateImpactByAsteroidId,
  createImpactLocation,
  guessTargetType
} from '../services/impactAPI';

// ============================================================================
// EJEMPLO 1: Verificar Estado del Backend
// ============================================================================
export async function example1_healthCheck() {
  console.log('🏥 Verificando estado del backend...');
  
  try {
    const health = await checkHealth();
    console.log('✅ Backend está funcionando:', health);
    return health;
  } catch (error) {
    console.error('❌ Backend no responde:', error.message);
    throw error;
  }
}

// ============================================================================
// EJEMPLO 2: Obtener Asteroides Cercanos
// ============================================================================
export async function example2_getNearEarthObjects() {
  console.log('🌑 Obteniendo asteroides cercanos...');
  
  try {
    // Opción A: Todos los asteroides
    const allNeos = await getNearEarthAsteroids();
    console.log(`✅ Se encontraron ${allNeos.length} asteroides`);
    console.table(allNeos.slice(0, 5)); // Mostrar los primeros 5
    
    // Opción B: Solo asteroides peligrosos
    const hazardousNeos = await getNearEarthAsteroids({ 
      hazardousOnly: true 
    });
    console.log(`⚠️ ${hazardousNeos.length} asteroides potencialmente peligrosos`);
    
    return allNeos;
  } catch (error) {
    console.error('❌ Error obteniendo NEOs:', error.message);
    throw error;
  }
}

// ============================================================================
// EJEMPLO 3: Simular Impacto Simple
// ============================================================================
export async function example3_simulateBasicImpact() {
  console.log('💥 Simulando impacto básico...');
  
  try {
    // Asteroide pequeño (100m) impactando en el océano Pacífico
    const result = await simulateImpact({
      diameter_m: 100,
      velocity_km_s: 20,
      impact_location: createImpactLocation(0, -150), // Pacífico ecuatorial
      target_type: 'water',
      density: 3000,
      angle: 45
    });
    
    console.log('✅ Simulación completada:');
    console.log(`  Energía: ${result.impact_effects.energy.megatons} MT`);
    console.log(`  Radio destrucción: ${result.impact_effects.radii.total} km`);
    console.log(`  Diámetro cráter: ${result.impact_effects.crater.final_diameter_km} km`);
    
    return result;
  } catch (error) {
    console.error('❌ Error en simulación:', error.message);
    throw error;
  }
}

// ============================================================================
// EJEMPLO 4: Simular Impacto en Ciudad Real
// ============================================================================
export async function example4_simulateUrbanImpact() {
  console.log('🏙️ Simulando impacto en área urbana...');
  
  const cities = [
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'La Paz', lat: -16.4897, lon: -68.1193 }
  ];
  
  try {
    // Asteroide mediano (500m) impactando en São Paulo
    const city = cities[0];
    const result = await simulateImpact({
      diameter_m: 500,
      velocity_km_s: 25,
      impact_location: createImpactLocation(city.lat, city.lon),
      target_type: guessTargetType(city.lat, city.lon),
      density: 2500
    });
    
    console.log(`✅ Impacto simulado en ${city.name}:`);
    console.log(`  Energía: ${result.impact_effects.energy.megatons.toFixed(2)} MT`);
    console.log(`  Destrucción total: ${result.impact_effects.radii.total} km`);
    console.log(`  Daño moderado: ${result.impact_effects.radii.moderate} km`);
    console.log(`  Daño leve: ${result.impact_effects.radii.light} km`);
    
    return result;
  } catch (error) {
    console.error('❌ Error en simulación urbana:', error.message);
    throw error;
  }
}

// ============================================================================
// EJEMPLO 5: Simular Usando Datos Reales de NASA
// ============================================================================
export async function example5_simulateWithNASAData() {
  console.log('🛰️ Simulando con datos reales de NASA...');
  
  try {
    // Primero obtener un asteroide real
    const neos = await getNearEarthAsteroids();
    const firstNeo = neos[0];
    
    console.log(`📡 Usando asteroide: ${firstNeo.name}`);
    console.log(`  Diámetro: ${firstNeo.estimated_diameter.meters.estimated_diameter_max.toFixed(0)} m`);
    console.log(`  Velocidad: ${firstNeo.close_approach_data[0].relative_velocity.kilometers_per_second} km/s`);
    
    // Simular impacto en una ubicación aleatoria
    const randomLat = (Math.random() - 0.5) * 180; // -90 a 90
    const randomLon = (Math.random() - 0.5) * 360; // -180 a 180
    
    const result = await simulateImpactFromNASA({
      nasa_data: {
        diameter_max_m: firstNeo.estimated_diameter.meters.estimated_diameter_max,
        diameter_min_m: firstNeo.estimated_diameter.meters.estimated_diameter_min,
        close_approach_data: firstNeo.close_approach_data
      },
      impact_location: createImpactLocation(randomLat, randomLon),
      target_type: guessTargetType(randomLat, randomLon)
    });
    
    console.log('✅ Simulación con datos NASA completada:');
    console.log(`  Ubicación: ${randomLat.toFixed(2)}°, ${randomLon.toFixed(2)}°`);
    console.log(`  Tipo objetivo: ${guessTargetType(randomLat, randomLon)}`);
    console.log(`  Energía: ${result.impact_effects.energy.megatons.toFixed(2)} MT`);
    
    return result;
  } catch (error) {
    console.error('❌ Error en simulación con NASA:', error.message);
    throw error;
  }
}

// ============================================================================
// EJEMPLO 6: Simular Usando ID de Asteroide
// ============================================================================
export async function example6_simulateByAsteroidId() {
  console.log('🔢 Simulando por ID de asteroide...');
  
  try {
    // Primero obtener lista de asteroides para elegir uno
    const neos = await getNearEarthAsteroids();
    const targetNeo = neos.find(n => n.is_potentially_hazardous_asteroid) || neos[0];
    
    console.log(`🎯 Objetivo: ${targetNeo.name} (ID: ${targetNeo.id})`);
    
    // Simular impacto en Madrid
    const result = await simulateImpactByAsteroidId(targetNeo.id, {
      impact_location: createImpactLocation(40.4168, -3.7038),
      target_type: 'land'
    });
    
    console.log('✅ Simulación por ID completada:');
    console.log(`  Energía: ${result.impact_effects.energy.kilotons.toFixed(0)} kt`);
    console.log(`  Radio destrucción: ${result.impact_effects.radii.total} km`);
    
    return result;
  } catch (error) {
    console.error('❌ Error en simulación por ID:', error.message);
    throw error;
  }
}

// ============================================================================
// EJEMPLO 7: Comparar Impactos en Tierra vs Agua
// ============================================================================
export async function example7_compareTargetTypes() {
  console.log('🌊 Comparando impactos en tierra vs agua...');
  
  const params = {
    diameter_m: 200,
    velocity_km_s: 30,
    density: 3000,
    angle: 45
  };
  
  try {
    // Impacto en tierra
    const landImpact = await simulateImpact({
      ...params,
      impact_location: createImpactLocation(40.7128, -74.0060), // NYC
      target_type: 'land'
    });
    
    // Impacto en agua
    const waterImpact = await simulateImpact({
      ...params,
      impact_location: createImpactLocation(0, -150), // Pacífico
      target_type: 'water'
    });
    
    console.log('✅ Comparación completada:');
    console.log('\n🏞️ TIERRA (NYC):');
    console.log(`  Energía: ${landImpact.impact_effects.energy.megatons.toFixed(2)} MT`);
    console.log(`  Radio destrucción: ${landImpact.impact_effects.radii.total} km`);
    console.log(`  Diámetro cráter: ${landImpact.impact_effects.crater.final_diameter_km} km`);
    
    console.log('\n🌊 AGUA (Pacífico):');
    console.log(`  Energía: ${waterImpact.impact_effects.energy.megatons.toFixed(2)} MT`);
    console.log(`  Radio destrucción: ${waterImpact.impact_effects.radii.total} km`);
    console.log(`  Altura ola (si aplica): ${waterImpact.impact_effects.tsunami?.wave_height_m || 'N/A'} m`);
    
    return { land: landImpact, water: waterImpact };
  } catch (error) {
    console.error('❌ Error en comparación:', error.message);
    throw error;
  }
}

// ============================================================================
// EJEMPLO 8: Pipeline Completo (Workflow Real)
// ============================================================================
export async function example8_completeWorkflow() {
  console.log('🔄 Ejecutando workflow completo...\n');
  
  try {
    // Paso 1: Verificar backend
    console.log('📌 Paso 1: Health check');
    await checkHealth();
    console.log('✅ Backend OK\n');
    
    // Paso 2: Obtener asteroides
    console.log('📌 Paso 2: Obtener asteroides');
    const neos = await getNearEarthAsteroids();
    console.log(`✅ ${neos.length} asteroides obtenidos\n`);
    
    // Paso 3: Filtrar asteroides peligrosos
    console.log('📌 Paso 3: Filtrar peligrosos');
    const hazardous = neos.filter(n => n.is_potentially_hazardous_asteroid);
    console.log(`⚠️ ${hazardous.length} asteroides peligrosos\n`);
    
    // Paso 4: Seleccionar el más grande
    console.log('📌 Paso 4: Seleccionar el más grande');
    const largest = hazardous.reduce((max, neo) => {
      const diameter = neo.estimated_diameter.meters.estimated_diameter_max;
      const maxDiameter = max.estimated_diameter.meters.estimated_diameter_max;
      return diameter > maxDiameter ? neo : max;
    }, hazardous[0] || neos[0]);
    console.log(`🎯 Seleccionado: ${largest.name} (${largest.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m)\n`);
    
    // Paso 5: Simular impacto en múltiples ciudades
    console.log('📌 Paso 5: Simular impactos');
    const cities = [
      { name: 'La Paz', lat: -16.4897, lon: -68.1193 },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
      { name: 'New York', lat: 40.7128, lon: -74.0060 }
    ];
    
    const results = [];
    for (const city of cities) {
      const result = await simulateImpactByAsteroidId(largest.id, {
        impact_location: createImpactLocation(city.lat, city.lon),
        target_type: 'land'
      });
      results.push({ city: city.name, ...result.impact_effects });
      console.log(`  ✅ ${city.name}: ${result.impact_effects.energy.megatons.toFixed(2)} MT`);
    }
    
    console.log('\n✅ Workflow completo finalizado');
    return {
      asteroid: largest,
      simulations: results
    };
  } catch (error) {
    console.error('❌ Error en workflow:', error.message);
    throw error;
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL - EJECUTAR TODOS LOS EJEMPLOS
// ============================================================================
export async function runAllExamples() {
  console.log('🚀 EJECUTANDO TODOS LOS EJEMPLOS\n');
  console.log('='.repeat(60));
  
  const examples = [
    { name: 'Health Check', fn: example1_healthCheck },
    { name: 'Obtener NEOs', fn: example2_getNearEarthObjects },
    { name: 'Impacto Básico', fn: example3_simulateBasicImpact },
    { name: 'Impacto Urbano', fn: example4_simulateUrbanImpact },
    { name: 'Datos NASA', fn: example5_simulateWithNASAData },
    { name: 'Por ID', fn: example6_simulateByAsteroidId },
    { name: 'Tierra vs Agua', fn: example7_compareTargetTypes },
    { name: 'Workflow Completo', fn: example8_completeWorkflow }
  ];
  
  const results = {};
  
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    console.log(`\n[${ i + 1}/${examples.length}] ${example.name}`);
    console.log('-'.repeat(60));
    
    try {
      const result = await example.fn();
      results[example.name] = { success: true, data: result };
      console.log(`✅ ${example.name} completado\n`);
    } catch (error) {
      results[example.name] = { success: false, error: error.message };
      console.error(`❌ ${example.name} falló: ${error.message}\n`);
    }
    
    // Pausa entre ejemplos
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('='.repeat(60));
  console.log('📊 RESUMEN DE RESULTADOS\n');
  
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${result.success ? '✅' : '❌'} ${name}`);
  });
  
  const successCount = Object.values(results).filter(r => r.success).length;
  console.log(`\n${successCount}/${examples.length} ejemplos exitosos`);
  
  return results;
}

// ============================================================================
// EXPORTACIÓN DEFAULT
// ============================================================================
export default {
  example1_healthCheck,
  example2_getNearEarthObjects,
  example3_simulateBasicImpact,
  example4_simulateUrbanImpact,
  example5_simulateWithNASAData,
  example6_simulateByAsteroidId,
  example7_compareTargetTypes,
  example8_completeWorkflow,
  runAllExamples
};
