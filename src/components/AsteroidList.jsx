import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { StarsCanvas } from './main/star-background';

const API_KEY = '4XTNhkIbujuES0LnRkxyO5v5HI96OqklU3ELcEDB';

const AsteroidList = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [filterHazardous, setFilterHazardous] = useState(false);

  useEffect(() => {
    loadNEOData();
  }, []);

  // Cargar datos de la API de NASA
  const loadNEOData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      
      const startStr = today.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startStr}&end_date=${endStr}&api_key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const neoList = [];
      Object.keys(data.near_earth_objects).forEach(date => {
        data.near_earth_objects[date].forEach(neo => {
          neoList.push({
            id: neo.id,
            name: neo.name.replace(/[()]/g, ''),
            diameter: neo.estimated_diameter.meters.estimated_diameter_max,
            velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
            distance: parseFloat(neo.close_approach_data[0].miss_distance.kilometers),
            hazardous: neo.is_potentially_hazardous_asteroid,
            date: neo.close_approach_data[0].close_approach_date
          });
        });
      });
      
      setAsteroids(neoList);
    } catch (error) {
      console.error('Error al cargar datos NEO:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular energía de impacto (kilotones TNT)
  const calculateImpactEnergy = (diameter, velocity) => {
    const radius = diameter / 2;
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * 2000; // kg (densidad promedio)
    const energy = 0.5 * mass * Math.pow(velocity * 1000, 2); // Joules
    const kilotons = energy / (4.184 * Math.pow(10, 12));
    return kilotons;
  };

  // Calcular radios de daño
  const calculateDamageRadii = (energy) => {
    return {
      total: Math.pow(energy, 0.33) * 0.5,
      moderate: Math.pow(energy, 0.33) * 1.5,
      light: Math.pow(energy, 0.33) * 3
    };
  };

  // Simular impacto
  const simulateImpact = (asteroid) => {
    const energy = calculateImpactEnergy(asteroid.diameter, asteroid.velocity);
    const radii = calculateDamageRadii(energy);
    
    setSelectedAsteroid(asteroid);
    setImpactData({
      energy,
      radii,
      lat: (Math.random() * 160) - 80,
      lng: (Math.random() * 360) - 180
    });
  };

  // Obtener comparación histórica
  const getHistoricalComparison = (energy) => {
    if (energy < 100) return 'Similar a un pequeño meteorito. Daños localizados.';
    if (energy < 1000) return `Similar al evento de Cheliábinsk (2013). ${(energy/500).toFixed(1)}x más potente.`;
    if (energy < 20000) return `Entre Cheliábinsk y Tunguska. ${(energy/500).toFixed(1)}x Cheliábinsk.`;
    return `Evento catastrófico. ${(energy/15000).toFixed(1)}x el evento de Tunguska.`;
  };

  const displayedAsteroids = filterHazardous 
    ? asteroids.filter(a => a.hazardous)
    : asteroids;

  return (
    <div className="min-h-screen text-white relative z-10" style={{ backgroundColor: '#000' }}>
      <StarsCanvas />
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🌠 IMPACTUS
          </h1>
          <p className="text-gray-300 mb-4">
            Sistema Integrado de Modelado de Impactos de Asteroides
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <span className="glass px-3 py-1 rounded-full text-sm border border-[rgb(138,43,226)]">📡 NASA NEO API</span>
            <span className="glass px-3 py-1 rounded-full text-sm border border-[rgb(138,43,226)]">🎯 CNEOS JPL</span>
            <span className="glass px-3 py-1 rounded-full text-sm border border-[rgb(138,43,226)]">🛡️ PDCO</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Lista de Asteroides */}
          <div className="lg:col-span-1">
            <div className="glass p-6 rounded-lg border border-[rgba(138,43,226,0.3)]">
              <h2 className="text-2xl font-bold mb-4 text-[rgb(138,43,226)]">
                🎯 Asteroides Detectados
              </h2>
              
              <div className="flex flex-col gap-2 mb-6">
                <button
                  onClick={loadNEOData}
                  className="w-full px-4 py-2 bg-[rgb(138,43,226)] rounded-lg hover:bg-[rgb(158,63,246)] transition-colors"
                >
                  🔄 Cargar NEO (7 días)
                </button>
                <button
                  onClick={() => setFilterHazardous(!filterHazardous)}
                  className="w-full px-4 py-2 bg-transparent border-2 border-[rgb(138,43,226)] rounded-lg hover:bg-[rgba(138,43,226,0.2)] transition-colors"
                >
                  {filterHazardous ? '✅ Mostrar Todos' : '🔴 Solo Peligrosos'}
                </button>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-[rgb(138,43,226)] border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-400">Cargando datos...</p>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {displayedAsteroids.map((asteroid) => (
                  <div
                    key={asteroid.id}
                    onClick={() => simulateImpact(asteroid)}
                    className={`glass p-3 rounded-lg cursor-pointer transition-all hover:scale-105 border-l-4 ${
                      asteroid.hazardous ? 'border-l-red-500' : 'border-l-green-500'
                    } ${selectedAsteroid?.id === asteroid.id ? 'bg-[rgba(138,43,226,0.3)]' : ''}`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {asteroid.hazardous ? '⚠️' : '✅'} {asteroid.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      📏 {asteroid.diameter.toFixed(0)}m | ⚡ {asteroid.velocity.toFixed(1)} km/s
                      <br />📅 {asteroid.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Principal - Simulación */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mapa Placeholder */}
            <div className="glass p-6 rounded-lg border border-[rgba(138,43,226,0.3)]">
              <h2 className="text-2xl font-bold mb-4">🗺️ Simulador de Impacto</h2>
              <div className="w-full h-64 bg-gradient-to-br from-[rgba(138,43,226,0.2)] to-[rgba(158,63,246,0.1)] rounded-lg flex items-center justify-center border border-[rgba(138,43,226,0.3)]">
                {selectedAsteroid ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-lg">Impacto simulado en</p>
                    <p className="text-sm text-gray-400">
                      Lat: {impactData?.lat.toFixed(2)}° | Lng: {impactData?.lng.toFixed(2)}°
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">🌍</div>
                    <p>Selecciona un asteroide para simular impacto</p>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas de Impacto */}
            {impactData && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass p-4 rounded-lg border-l-4 border-l-[rgb(138,43,226)]">
                    <div className="text-xs text-gray-400 mb-1">Energía de Impacto</div>
                    <div className="text-2xl font-bold text-[rgb(138,43,226)]">
                      {impactData.energy.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">kilotones</div>
                  </div>
                  <div className="glass p-4 rounded-lg border-l-4 border-l-red-500">
                    <div className="text-xs text-gray-400 mb-1">Destrucción Total</div>
                    <div className="text-2xl font-bold text-red-500">
                      {impactData.radii.total.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">km</div>
                  </div>
                  <div className="glass p-4 rounded-lg border-l-4 border-l-yellow-500">
                    <div className="text-xs text-gray-400 mb-1">Daño Moderado</div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {impactData.radii.moderate.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">km</div>
                  </div>
                  <div className="glass p-4 rounded-lg border-l-4 border-l-green-500">
                    <div className="text-xs text-gray-400 mb-1">Daño Leve</div>
                    <div className="text-2xl font-bold text-green-500">
                      {impactData.radii.light.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">km</div>
                  </div>
                </div>

                {/* Consecuencias */}
                <div className="glass p-6 rounded-lg border-2 border-red-500/30">
                  <h3 className="text-xl font-bold mb-4 text-red-400">⚠️ Consecuencias Estimadas</h3>
                  <div className="space-y-3">
                    {[
                      { icon: '🌊', label: 'Riesgo de Tsunami', value: impactData.energy > 1000 ? '⚠️ ALTO' : '✅ Bajo' },
                      { icon: '🌋', label: 'Actividad Sísmica', value: impactData.energy > 1000 ? '⚠️ Magnitud 6+' : '✅ Magnitud <4' },
                      { icon: '☁️', label: 'Cambio Atmosférico', value: impactData.energy > 10000 ? '⚠️ Invierno Nuclear' : '✅ Mínimo' },
                      { icon: '🏙️', label: 'Población en Riesgo', value: impactData.energy > 500 ? '⚠️ Millones' : '⚠️ Miles' },
                      { icon: '🔥', label: 'Incendios Masivos', value: impactData.energy > 100 ? '⚠️ Sí' : '✅ No' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-[rgba(255,255,255,0.05)] p-3 rounded-lg">
                        <span>{item.icon} {item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comparación Histórica */}
                <div className="glass p-6 rounded-lg border-2 border-yellow-500/30">
                  <h3 className="text-xl font-bold mb-3 text-yellow-400">📊 Comparación Histórica</h3>
                  <p className="text-gray-300 mb-2">{getHistoricalComparison(impactData.energy)}</p>
                  <p className="text-sm text-gray-500">
                    Referencia: Cheliábinsk = 500 kt, Tunguska = 15,000 kt
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AsteroidList;
