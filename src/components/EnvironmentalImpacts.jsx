import React from 'react';
import Header from './Header';

const EnvironmentalImpacts = () => {
  // Esta lista se puede actualizar con los datos reales más adelante
  const impacts = [
    {
      id: 1,
      title: "Impacto 1",
      description: "Descripción del impacto ambiental 1",
      image: "src/assets/earth.jpg", // Usa la imagen que ya tienes
    },
    // Más impactos se pueden agregar aquí
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Impactos Ambientales
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {impacts.map((impact) => (
            <div key={impact.id} className="glass p-6 rounded-lg">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={impact.image}
                  alt={impact.title}
                  className="w-full md:w-1/2 h-48 object-cover rounded-lg"
                />
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {impact.title}
                  </h2>
                  <p className="text-gray-300">
                    {impact.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalImpacts;
