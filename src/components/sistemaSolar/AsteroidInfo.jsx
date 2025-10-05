import React from 'react';

const AsteroidInfo = ({ asteroids, onClose, isMockData = false }) => {
  if (!asteroids || asteroids.length === 0) {
    return null;
  }

  // Ordenar por los más cercanos
  const sortedAsteroids = [...asteroids]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10); // Mostrar solo los 10 más cercanos

  const potentiallyHazardous = asteroids.filter(a => a.isPotentiallyHazardous).length;

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-lg max-w-md max-h-96 overflow-y-auto z-20">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg">
          {isMockData ? '⚡ Asteroids (Simulated)' : '🌠 Near-Earth Asteroids'}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      {isMockData && (
        <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-500/40 rounded text-xs text-yellow-200">
          ⚠️ NASA API unavailable. Showing educational sample data.
        </div>
      )}
      
      <div className="mb-3 text-sm text-gray-300">
        <p>Total: <span className="text-blue-400 font-semibold">{asteroids.length}</span></p>
        <p>Potentially hazardous: <span className="text-red-400 font-semibold">{potentiallyHazardous}</span></p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Closest 10:</h4>
        {sortedAsteroids.map((asteroid, index) => (
          <div 
            key={asteroid.id} 
            className={`p-2 rounded text-xs border-l-2 ${
              asteroid.isPotentiallyHazardous 
                ? 'bg-red-900/20 border-red-500' 
                : 'bg-gray-800/50 border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-white truncate" title={asteroid.name}>
                  {index + 1}. {asteroid.name.replace(/[()]/g, '')}
                </p>
                <p className="text-gray-400 mt-1">
                  📏 {asteroid.distance.toFixed(3)} AU
                </p>
                <p className="text-gray-400">
                  📦 Ø {asteroid.diameter.toFixed(2)} km
                </p>
                <p className="text-gray-400">
                  🚀 {Math.round(asteroid.velocity).toLocaleString()} km/h
                </p>
              </div>
              {asteroid.isPotentiallyHazardous && (
                <span className="text-red-400 text-lg" title="Potentially hazardous">
                  ⚠️
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
        <p>🛰️ {isMockData ? 'Simulated data for demonstration' : 'Data from NASA NeoWs API'}</p>
        <p>Red asteroids are potentially hazardous</p>
      </div>
    </div>
  );
};

export default AsteroidInfo;
