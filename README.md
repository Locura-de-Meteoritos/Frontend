# 🌍 Meteor Madness - Interactive Asteroid Impact Simulator

Advanced web application for simulating asteroid impacts on Earth with realistic 3D visualization, accurate physics calculations, and real-time NASA data integration.

---

## ✨ Key Features

### 🎯 Impact Simulation
- 🌎 **Realistic 3D Earth Model** with NASA textures and accurate geography
- 🪨 **Procedural Asteroids** with irregular geometry and physics-based trajectories
- 💥 **Dynamic Impact Effects** with fire, smoke, particles, and crater formation
- 📊 **Precise Physics Calculations** for energy, crater diameter, and destruction radii
- � **Real-time Special Effects** with dynamic lighting and particle systems

### 🛰️ NASA Integration
- 📡 **NASA NeoWs API** for real Near-Earth Object (NEO) data
- ⚠️ **Hazardous Asteroid Tracking** with automatic filtering
- 📜 **Historical Events Database** (Tunguska, Chelyabinsk, Chicxulub, Barringer)
- 🎯 **7-day NEO Feed** with automatic updates

### 🌌 Solar System Visualization
- ☀️ **3D Solar System** with all 8 planets + Moon
- 🌍 **Realistic Orbital Mechanics** with elliptical orbits and proper eccentricity
- 🎨 **Optimized Planet Textures** with emissive materials and dynamic lighting
- 📏 **Accurate Distance Scaling** (1 unit = 1000 km)
- 🌟 **Decorative Asteroid Belt** between Mars and Jupiter

### 🤖 AI Chat Agent
- 💬 **Mistral AI Integration** for interactive Q&A about asteroids and impacts
- � **Educational Context** with scientific explanations
- 🎓 **Real-time Assistance** during simulations

### 📊 Advanced Impact Analysis
- ⚡ **Energy Calculations** in kilotons/megatons with Hiroshima equivalents
- 🌊 **Tsunami Risk Assessment** for ocean impacts
- 🌋 **Seismic Activity Prediction** with magnitude estimates
- ☁️ **Atmospheric Effects** including cooling years and dust tonnage
- 🏙️ **Population Risk Analysis** with evacuation radius calculations
- 🔥 **Fire and Thermal Effects** modeling
- ❄️ **Long-term Climate Impact** predictions

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/Locura-de-Meteoritos/Frontend.git
cd Frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file:

```env
# Backend API (pre-configured, ready to use)
VITE_BACKEND_URL=https://backend-ns-t0p7.onrender.com

# NASA API Key (get yours at https://api.nasa.gov/)
VITE_NASA_API_KEY=your_nasa_api_key_here

# Mistral AI API Key (optional, for chat agent)
VITE_MISTRAL_API_KEY=your_mistral_api_key_here
```

---

## 🛠️ Tech Stack

### Frontend Core
- **React 19** - Latest React with enhanced performance
- **Vite 5** - Ultra-fast build tool with HMR
- **Tailwind CSS 4** - Utility-first CSS framework

### 3D Rendering
- **Three.js 0.180** - WebGL 3D library
- **react-three-fiber 9** - React renderer for Three.js
- **@react-three/drei 10** - Useful helpers for r3f

### Routing & Navigation
- **React Router DOM 7** - Client-side routing

### External Services
- **NASA NeoWs API** - Real-time asteroid data
- **Impact Simulation Backend** - Physics calculations
- **Mistral AI** - Chat agent integration
- **Spline 3D** - Interactive 3D hero scenes

---

## 📦 Available Scripts

```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint code analysis
```

---

## 🎮 User Guide

### Impact Simulation Mode

1. **Configure Asteroid Parameters**
   - Type: Rock, Iron, or Mixed composition
   - Mass: In kilograms (e.g., 1000 kg)
   - Velocity: Relative scale 1-100 (maps to 11-70 km/s)
   - Density: In kg/m³ (e.g., 3000 for rock)
   - Angle: Impact angle in degrees

2. **Select NEO Source**
   - 📡 **All (7d)**: Recent Near-Earth Asteroids from NASA
   - ⚠️ **Hazardous**: Potentially Hazardous Asteroids only
   - 📜 **Historical**: Famous historical impacts

3. **Launch Impact**
   - Click "Simulate impact" button
   - Click anywhere on the 3D Earth to select impact location
   - Watch the asteroid trajectory and impact

4. **Analyze Results**
   - Energy release (kilotons/megatons)
   - Crater dimensions
   - Destruction radii (total, moderate, light)
   - Detailed consequences panel with:
     - Tsunami risk
     - Seismic activity
     - Atmospheric effects
     - Population at risk
     - Fire hazards
     - Long-term climate impact

### Solar System Mode

- Navigate to `/sistemaSolar` route
- Explore 3D solar system with realistic orbits
- Observe elliptical planetary motion
- View asteroid positions in real-time

---

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/              # React Components
│   │   ├── main/                # Landing page components
│   │   │   ├── hero.jsx         # Hero section with animations
│   │   │   └── star-background.jsx  # Starfield background
│   │   ├── sistemaSolar/        # Solar System 3D components
│   │   │   ├── SolarSystem3D.jsx    # Main solar system scene
│   │   │   ├── Planets.jsx          # Planet meshes with orbits
│   │   │   ├── Asteroids.jsx        # NASA asteroid rendering
│   │   │   ├── Sun3D.jsx            # Sun with glow effects
│   │   │   ├── AsteroidInfo.jsx     # Info panel for asteroids
│   │   │   └── sistemaSolar.jsx     # Route wrapper
│   │   ├── simulacion.jsx       # Main impact simulation component
│   │   ├── Earth3D.jsx          # 3D Earth model with textures
│   │   ├── Asteroid.jsx         # Asteroid physics and rendering
│   │   ├── Crater.jsx           # Crater with special effects
│   │   ├── ImpactConsequences.jsx  # Detailed impact analysis panel
│   │   ├── Header.jsx           # Navigation header
│   │   ├── Footer.jsx           # Footer component
│   │   ├── Body.jsx             # Landing page body
│   │   ├── Background.jsx       # Animated backgrounds
│   │   ├── ChatAgent.jsx        # Mistral AI chat integration
│   │   ├── AsteroidList.jsx     # Asteroid catalog view
│   │   └── APITestPanel.jsx     # API testing interface
│   ├── services/                # External API clients
│   │   ├── nasaAPI.js           # NASA NeoWs API integration
│   │   └── impactAPI.js         # Backend simulation API
│   ├── utils/                   # Utilities and calculations
│   │   └── impactCalculations.js # Physics formulas and historical data
│   ├── assets/                  # Images and textures
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
├── public/
│   ├── Videos/                  # Background videos
│   └── vite.svg                 # Vite logo
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── eslint.config.js             # ESLint rules
├── vercel.json                  # Vercel deployment config
├── API_INTEGRATION.md           # Backend API documentation
├── QUICK_START_API.md           # API quick start guide
├── IMPACTUS_README.md           # NASA IMPACTUS system docs
├── OPTIMIZACIONES.md            # Performance optimizations
└── README.md                    # This file
```

---

## 🌐 Backend API

**Base URL:** `https://backend-ns-t0p7.onrender.com`

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/asteroids/near-earth` | GET | Get Near-Earth Asteroids from NASA |
| `/api/impact/simulate` | POST | Simulate custom impact |
| `/api/impact/simulate-asteroid/:id` | POST | Simulate impact by NASA asteroid ID |

### Example Usage

```javascript
import { simulateImpact, getNearEarthAsteroids } from './src/services/impactAPI.js';

// Get recent asteroids
const asteroids = await getNearEarthAsteroids();

// Simulate custom impact
const result = await simulateImpact({
  diameter_m: 100,
  velocity_km_s: 20,
  impact_location: { lat: -16.4897, lon: -68.1193 },
  target_type: 'land',
  density: 2500,
  angle: 45
});
```

**Full API Documentation:** [`API_INTEGRATION.md`](./API_INTEGRATION.md)

---

## 🎨 Performance Optimizations

### Implemented Optimizations
- ✅ **2K Textures** instead of 4K (~75% size reduction)
- ✅ **Simplified Geometries** with optimized polygon counts
- ✅ **Efficient Particle Systems** with object pooling
- ✅ **Lazy Loading** for heavy 3D assets
- ✅ **Automatic Fallbacks** when backend is slow/unavailable
- ✅ **WebGL Optimizations** with proper shader usage
- ✅ **Memory Management** with cleanup on unmount

### Performance Tips
- Reduce stars count in `star-background.jsx` if needed
- Disable crater effects (fire/smoke) for low-end devices
- Use Chrome/Edge for best WebGL performance
- Enable hardware acceleration in browser settings

**Details:** See [`OPTIMIZACIONES.md`](./OPTIMIZACIONES.md)

---

## 🧪 Testing & Development

### Browser Console Testing

```javascript
// Open DevTools (F12) and run:

// Test NASA API
const nasa = await import('./src/services/nasaAPI.js');
const asteroids = await nasa.getAsteroidFeed();
console.table(asteroids);

// Test Impact API
const impact = await import('./src/services/impactAPI.js');
const health = await impact.checkHealth();
console.log('Backend status:', health);

// Simulate impact
const result = await impact.simulateImpact({
  diameter_m: 50,
  velocity_km_s: 25,
  impact_location: { lat: 40.7128, lon: -74.0060 }, // NYC
  target_type: 'land'
});
console.log('Impact results:', result);
```

### Using API Test Panel

Uncomment `<APITestPanel />` in `simulacion.jsx` to enable visual API testing interface.

---

## 🔧 Advanced Configuration

### Custom Backend URL

```env
# Local development
VITE_BACKEND_URL=http://localhost:5000

# Custom deployment
VITE_BACKEND_URL=https://your-backend.example.com
```

### Adjusting Physics

Edit `src/utils/impactCalculations.js`:

```javascript
// Modify energy calculation constants
export function calculateEnergy(mass, velocity) {
  return 0.5 * mass * Math.pow(velocity, 2);
}

// Adjust crater scaling
const C = 0.032; // Empirical coefficient
const D_t = C * Math.pow(energyJ, 1/3.4);
```

### Customizing 3D Assets

Planet textures and materials can be modified in:
- `src/components/sistemaSolar/Planets.jsx`
- `src/components/Earth3D.jsx`

---

## 🐛 Troubleshooting

### Common Issues

**Backend not responding**
- ✅ Normal: App automatically uses local calculations
- ✅ Cold start: Backend may take 10-30s on first request
- ✅ Check `.env` has correct `VITE_BACKEND_URL`

**Low FPS / Performance Issues**
- Reduce stars in `star-background.jsx`
- Disable crater effects in `Crater.jsx`
- Close other browser tabs
- Update GPU drivers

**Asteroids not visible**
- Check NASA API key in `.env`
- Verify console for API errors
- Try "Historical" filter to use local data

**Build errors**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (needs >= 18)
- Verify all dependencies: `npm audit`

**3D not rendering**
- Enable hardware acceleration in browser
- Check WebGL support: https://get.webgl.org/
- Try different browser (Chrome/Edge recommended)

---

## 📚 Additional Documentation

- 📖 **[API Integration Guide](./API_INTEGRATION.md)** - Complete backend API documentation
- 🚀 **[Quick Start API](./QUICK_START_API.md)** - Fast API setup guide
- 🎯 **[IMPACTUS System](./IMPACTUS_README.md)** - NASA impact calculation models
- ⚡ **[Optimizations](./OPTIMIZACIONES.md)** - Performance optimization details
- 🌍 **[Earth 3D Guide](./EARTH3D_DOCUMENTATION.md)** - Earth model documentation
- 🛠️ **[NASA Integration](./NASA_INTEGRATION.md)** - NASA API integration details

---

## 📝 License

Created for **UMSA Hackathon 2025** by Team **Locura de Meteoritos**

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Team

**Locura de Meteoritos** - UMSA Hackathon 2025

---

## 🔗 Useful Links

- 🌐 **Backend API:** https://backend-ns-t0p7.onrender.com
- 🛰️ **NASA NeoWs API:** https://api.nasa.gov/
- 🎨 **Three.js Docs:** https://threejs.org/docs/
- ⚛️ **React Three Fiber:** https://docs.pmnd.rs/react-three-fiber/
- 🤖 **Mistral AI:** https://mistral.ai/
- 📊 **Spline 3D:** https://spline.design/

---

## 🌟 Features Showcase

### Impact Simulation
- Real-time physics calculations
- Dynamic crater formation
- Particle effects (fire, smoke, debris)
- Energy-based damage radii
- Historical event comparison

### Solar System
- 8 planets with realistic textures
- Elliptical orbital mechanics
- Real NASA asteroid data
- Interactive camera controls
- Scale-accurate distances

### AI Chat Agent
- Context-aware responses
- Scientific explanations
- Impact scenario Q&A
- Educational content

---

**Made with ❤️ for education and space exploration 🚀**
