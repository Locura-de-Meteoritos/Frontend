const Body = () => {
  const handleSimulationClick = () => {
    window.location.href = "/simulacion";
  };

  return (
    <>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Descubre el universo
            <br />
            <span className="text-gray-600">a tu alcance</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explora la fascinante colección de meteoritos y aprende sobre los misterios 
            del espacio exterior con nuestra experiencia única e interactiva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
              onClick={handleSimulationClick}
            >
              Empezar simulación
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegirnos?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una experiencia única para conocer y estudiar meteoritos auténticos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Auténticos</h3>
              <p className="text-gray-600 leading-relaxed">
                Todos nuestros meteoritos son verificados científicamente y vienen con certificados de autenticidad.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Educativo</h3>
              <p className="text-gray-600 leading-relaxed">
                Aprende sobre la formación, composición y historia de cada meteorito con información detallada.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global</h3>
              <p className="text-gray-600 leading-relaxed">
                Meteoritos de todas partes del mundo, desde el desierto del Sahara hasta la Antártida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            ¿Listo para explorar el cosmos?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Únete a miles de entusiastas del espacio y comienza tu viaje hacia las estrellas
          </p>
          <button className="bg-black text-white px-10 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium">
            Comenzar Ahora
          </button>
        </div>
      </section>
    </>
  );
};

export default Body;