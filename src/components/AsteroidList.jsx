import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { StarsCanvas } from './main/star-background';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_KEY = '4XTNhkIbujuES0LnRkxyO5v5HI96OqklU3ELcEDB';

// Eventos históricos para comparación
const historicalEvents = [
  {
    id: 'hist-1',
    name: 'Cheliábinsk 2013',
    diameter: 20,
    velocity: 19,
    energy: 500,
    location: 'Rusia',
    casualties: '1500+ heridos',
    hazardous: true,
    date: 'Histórico',
    source: 'Evento Real'
  },
  {
    id: 'hist-2',
    name: 'Tunguska 1908',
    diameter: 60,
    velocity: 15,
    energy: 15000,
    location: 'Siberia',
    casualties: '2000 km² devastados',
    hazardous: true,
    date: 'Histórico',
    source: 'Evento Real'
  },
  {
    id: 'hist-3',
    name: 'Chicxulub (Extinción Dinosaurios)',
    diameter: 10000,
    velocity: 20,
    energy: 100000000,
    location: 'México',
    casualties: 'Extinción masiva',
    hazardous: true,
    date: 'Histórico',
    source: 'Evento Real'
  }
];

// Asteroides Sentry (riesgo real CNEOS)
const sentryAsteroids = [
  {
    id: 'sentry-1',
    name: '(29075) 1950 DA',
    diameter: 1300,
    velocity: 15,
    distance: 0,
    hazardous: true,
    date: '2880-03-16',
    source: 'CNEOS Sentry',
    riskLevel: 'Alto'
  },
  {
    id: 'sentry-2',
    name: '(99942) Apophis',
    diameter: 370,
    velocity: 12.6,
    distance: 31000,
    hazardous: true,
    date: '2029-04-13',
    source: 'CNEOS Sentry',
    riskLevel: 'Medio'
  },
  {
    id: 'sentry-3',
    name: '2023 DW',
    diameter: 50,
    velocity: 18.2,
    distance: 0,
    hazardous: true,
    date: '2046-02-14',
    source: 'CNEOS Sentry',
    riskLevel: 'Bajo'
  }
];

const AsteroidList = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [filterHazardous, setFilterHazardous] = useState(false);
  const [deviation, setDeviation] = useState(0.001);
  const [dataSource, setDataSource] = useState('NEO');
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const impactCirclesRef = useRef([]);

  useEffect(() => {
    loadNEOData();
  }, []);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Agregar leyenda
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-legend');
      div.style.cssText = 'background: rgba(0, 0, 0, 0.8); padding: 15px; border-radius: 8px; font-size: 0.85em; color: white;';
      div.innerHTML = `
        <div style="display: flex; align-items: center; margin: 5px 0;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background: rgba(255, 107, 107, 0.5); margin-right: 10px;"></div>
          <span>Zona de Destrucción Total</span>
        </div>
        <div style="display: flex; align-items: center; margin: 5px 0;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background: rgba(255, 193, 7, 0.5); margin-right: 10px;"></div>
          <span>Zona de Daño Moderado</span>
        </div>
        <div style="display: flex; align-items: center; margin: 5px 0;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background: rgba(76, 175, 80, 0.5); margin-right: 10px;"></div>
          <span>Zona de Daño Leve</span>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Cargar datos de la API de NASA
  const loadNEOData = async () => {
    setLoading(true);
    setDataSource('NEO');
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
            date: neo.close_approach_data[0].close_approach_date,
            source: 'NEO API'
          });
        });
      });
      
      setAsteroids(neoList);
    } catch (error) {
      console.error('Error al cargar datos NEO:', error);
      alert('Error al cargar datos NEO');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos Sentry
  const loadSentryData = () => {
    setLoading(true);
    setDataSource('Sentry');
    setTimeout(() => {
      setAsteroids(sentryAsteroids);
      setLoading(false);
    }, 500);
  };

  // Cargar eventos históricos
  const loadHistoricalEvents = () => {
    setLoading(true);
    setDataSource('Histórico');
    setTimeout(() => {
      setAsteroids(historicalEvents);
      setLoading(false);
    }, 500);
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
    const lat = (Math.random() * 160) - 80;
    const lng = (Math.random() * 360) - 180;
    
    setSelectedAsteroid(asteroid);
    setImpactData({
      energy,
      radii,
      lat,
      lng,
      isOcean: Math.abs(lat) < 60 && (lng < -30 || lng > 120)
    });

    // Actualizar mapa
    if (mapInstanceRef.current) {
      // Limpiar círculos anteriores
      impactCirclesRef.current.forEach(layer => {
        mapInstanceRef.current.removeLayer(layer);
      });
      impactCirclesRef.current = [];

      // Dibujar círculos de daño
      const circles = [
        { radius: radii.total * 1000, color: '#ff6b6b', label: 'Total' },
        { radius: radii.moderate * 1000, color: '#ffc107', label: 'Moderado' },
        { radius: radii.light * 1000, color: '#4caf50', label: 'Leve' }
      ];

      circles.forEach(circle => {
        const leafletCircle = L.circle([lat, lng], {
          radius: circle.radius,
          color: circle.color,
          fillColor: circle.color,
          fillOpacity: 0.3,
          weight: 2
        }).addTo(mapInstanceRef.current);
        
        impactCirclesRef.current.push(leafletCircle);
      });

      // Marker en el punto de impacto
      const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      marker.bindPopup(`<b>Punto de Impacto</b><br>${asteroid.name}`).openPopup();
      impactCirclesRef.current.push(marker);

      // Centrar mapa
      mapInstanceRef.current.setView([lat, lng], 5);
    }
  };

  // Simular mitigación
  const simulateMitigation = () => {
    if (!impactData || !mapInstanceRef.current) return;

    const { lat, lng } = impactData;
    const newLat = lat + (deviation * 100);
    const newLng = lng + (deviation * 150);

    // Dibujar nuevo círculo de impacto mitigado
    const mitigatedCircle = L.circle([newLat, newLng], {
      radius: impactCirclesRef.current[0].getRadius(),
      color: '#51cf66',
      fillColor: '#51cf66',
      fillOpacity: 0.4,
      weight: 3,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);

    // Crear icono verde personalizado
    const greenIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const mitigatedMarker = L.marker([newLat, newLng], { icon: greenIcon }).addTo(mapInstanceRef.current);
    mitigatedMarker.bindPopup(`<b>Nuevo Punto de Impacto</b><br>Después de desviación de ${deviation}°`).openPopup();

    // Línea de trayectoria
    const trajectoryLine = L.polyline([
      [lat, lng],
      [newLat, newLng]
    ], {
      color: '#feca57',
      weight: 3,
      dashArray: '5, 10'
    }).addTo(mapInstanceRef.current);

    impactCirclesRef.current.push(mitigatedCircle, mitigatedMarker, trajectoryLine);

    // Ajustar vista
    mapInstanceRef.current.fitBounds([
      [lat, lng],
      [newLat, newLng]
    ], { padding: [50, 50] });

    alert(`✅ Simulación de Mitigación Completada\n\nDesviación: ${deviation}°\nNuevo impacto: ${Math.abs(newLat - lat).toFixed(2)}° de latitud desplazado\n\nEsto podría mover el impacto de una zona poblada a una zona segura.`);
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
                  onClick={loadSentryData}
                  className="w-full px-4 py-2 bg-[rgb(138,43,226)] rounded-lg hover:bg-[rgb(158,63,246)] transition-colors"
                >
                  ⚠️ Sentry Risk List
                </button>
                <button
                  onClick={() => setFilterHazardous(!filterHazardous)}
                  className="w-full px-4 py-2 bg-transparent border-2 border-[rgb(138,43,226)] rounded-lg hover:bg-[rgba(138,43,226,0.2)] transition-colors"
                >
                  {filterHazardous ? '✅ Mostrar Todos' : '🔴 Solo Peligrosos'}
                </button>
                <button
                  onClick={loadHistoricalEvents}
                  className="w-full px-4 py-2 bg-transparent border-2 border-[rgb(138,43,226)] rounded-lg hover:bg-[rgba(138,43,226,0.2)] transition-colors"
                >
                  📜 Eventos Históricos
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
                      <br />📅 {asteroid.date} | 📡 {asteroid.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Principal - Simulación */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mapa Leaflet */}
            <div className="glass p-6 rounded-lg border border-[rgba(138,43,226,0.3)]">
              <h2 className="text-2xl font-bold mb-4">🗺️ Simulador de Impacto</h2>
              <div 
                ref={mapRef} 
                className="w-full h-96 rounded-lg border-2 border-[rgba(138,43,226,0.3)]"
                style={{ zIndex: 1 }}
              ></div>
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
                      { icon: '🌊', label: 'Riesgo de Tsunami', value: impactData.isOcean ? '⚠️ ALTO' : '✅ Bajo' },
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

                {/* Panel de Mitigación */}
                <div className="glass p-6 rounded-lg border-2 border-green-500/30">
                  <h3 className="text-xl font-bold mb-4 text-green-400">🛡️ Estrategias de Mitigación</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-300">Desviación Orbital (grados)</span>
                      <span className="text-sm font-bold text-green-400">{deviation}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={deviation}
                      onChange={(e) => setDeviation(parseFloat(e.target.value))}
                      className="w-full h-2 bg-[rgba(255,255,255,0.2)] rounded-lg appearance-none cursor-pointer slider-thumb-green"
                    />
                  </div>

                  <button
                    onClick={simulateMitigation}
                    className="w-full px-4 py-3 bg-green-500 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    🚀 Simular Desviación
                  </button>
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
