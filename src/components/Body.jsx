import Spline from '@splinetool/react-spline'
import ChatAgent from './ChatAgent.jsx'
const Body = () => {
  const handleSimulationClick = () => {
    window.location.href = "/simulacion";
  };
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY

  return (
    <>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover the universe
            <br />
            <span className="text-white">within your reach</span>
          </h1>
          <p className="text-white text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore the fascinating collection of meteorites and learn about the mysteries 
            of outer space with our unique and interactive experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="text-white px-8 py-4 rounded-lg text-lg font-medium relative 
                         bg-[rgb(138,43,226)] border-2 border-[rgb(158,63,246)] 
                         shadow-[0_0_20px_rgba(138,43,226,0.6)]
                         hover:scale-105 hover:bg-[rgb(158,63,246)] hover:shadow-[0_0_30px_rgba(138,43,226,0.9)]
                         transition-all duration-300 ease-out"
              onClick={handleSimulationClick}
            >
              Start Simulation
            </button>
          </div>
        </div>
      </section>
      <div className="w-full h-[600px] relative" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <Spline scene="https://prod.spline.design/Xn1dwVpX-cuU4TI6/scene.splinecode" />
      </div>
      {/* Features Section */}
      {/* <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer a unique experience to discover and study authentic meteorites
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Authentic</h3>
              <p className="text-gray-600 leading-relaxed">
                All our meteorites are scientifically verified and come with certificates of authenticity.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Educational</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn about the formation, composition and history of each meteorite with detailed information.
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
                Meteorites from all over the world, from the Sahara Desert to Antarctica.
              </p>
            </div>
          </div>
        </div>
      </section> */}
      <ChatAgent apiKey={apiKey} />
      
    </>
  );
};

export default Body;