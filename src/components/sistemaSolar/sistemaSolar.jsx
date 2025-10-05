import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Background from '../Background';
import SolarSystem3D from './SolarSystem3D';

const SistemaSolar = () => {
  return (
    <>
      {/* Background animado (fondo de estrellas) */}
      <Background count={140} />

      {/* Contenido principal */}
      <div className="relative z-20 min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow flex items-center justify-center px-4">
          <div className="w-full max-w-3xl flex items-center justify-center">
            <SolarSystem3D className="w-full h-[640px]" />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SistemaSolar;
