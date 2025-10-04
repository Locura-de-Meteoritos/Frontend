import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <nav className="glass border-b border-transparent relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <img src="src/assets/LOGO METEOR MADNESS.png" alt="Logo" className="h-8 w-auto object-contain" />
            <h1 className="text-xl font-semibold text-white">Locura de Meteoritos</h1>
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-200 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link to="/asteroides" className="text-gray-200 hover:text-white transition-colors">
              Asteroides
            </Link>
            <Link to="/impactos" className="text-gray-200 hover:text-white transition-colors">
              Impactos ambientales
            </Link>
          </div>
          <button
            onClick={() => navigate('/simulacion')}
            className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Comenzar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;