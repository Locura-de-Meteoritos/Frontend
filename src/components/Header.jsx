const Header = () => {
  return (
    <nav className="glass border-b border-transparent relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-2">
            <img src="src/assets/LOGO METEOR MADNESS.png" alt="Logo" className="h-8 w-auto object-contain" />
            <h1 className="text-xl font-semibold text-white">Locura de Meteoritos</h1>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-200 hover:text-white transition-colors">Inicio</a>
            <a href="#" className="text-gray-200 hover:text-white transition-colors">Acerca</a>
            <a href="#" className="text-gray-200 hover:text-white transition-colors">Servicios</a>
            <a href="#" className="text-gray-200 hover:text-white transition-colors">Contacto</a>
        
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Comenzar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;