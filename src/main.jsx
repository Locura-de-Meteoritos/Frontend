import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Simulacion from './components/simulacion.jsx';
import AsteroidList from './components/AsteroidList.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/simulacion" element={<Simulacion />} />
        <Route path="/asteroides" element={<AsteroidList /  >} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
