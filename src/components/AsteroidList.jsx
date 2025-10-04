import React from 'react';
import Header from './Header';

const AsteroidList = () => {
  // Esta lista se puede actualizar con los datos reales más adelante
  const asteroids = [
    {
      id: 1,
      name: "Asteroide 1",
      description: "Descripción del asteroide 1",
      image: "src/assets/asteroide.jpg", // Usa la imagen que ya tienes
    },
    // Más asteroides se pueden agregar aquí
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Catálogo de Asteroides
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {asteroids.map((asteroid) => (
            <div key={asteroid.id} className="glass p-6 rounded-lg">
              <img
                src={asteroid.image}
                alt={asteroid.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold text-white mb-2">
                {asteroid.name}
              </h2>
              <p className="text-gray-300">
                {asteroid.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AsteroidList;
