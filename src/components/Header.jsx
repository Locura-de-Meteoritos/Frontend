import { Link, useNavigate } from 'react-router-dom';
import img1 from '../assets/LOGO METEOR MADNESS.png';
import boleeuImg from '../assets/Boleeuu.png';

const Header = () => {
  const navigate = useNavigate();

  return (
    <nav className="glass border-b border-transparent relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link to="/" className="flex items-center space-x-2">
            <img src={img1} alt="Logo" className="h-15 w-auto object-contain" />
            <h1 className="text-xl font-semibold text-white">Locura de Meteoritos</h1>
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-200 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link to="/asteroides" className="text-gray-200 hover:text-white transition-colors">
              Asteroides
            </Link>
          </div>
          <img
            src={boleeuImg}
            alt="Comenzar"
            className="h-10 w-auto cursor-pointer hover:scale-110 transition-transform duration-200"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}
          />
        </div>
      </div>
    </nav>
  );
};

export default Header;