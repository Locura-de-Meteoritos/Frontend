const Header = () => {
  return (
    <nav className="border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Locura de Meteoritos</h1>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Inicio</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Acerca</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Servicios</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Contacto</a>
        
          </div>
          <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Comenzar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;