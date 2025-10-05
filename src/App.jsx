import Header from './components/Header'
import Body from './components/Body'
import Footer from './components/Footer'
import { StarsCanvas } from './components/main/star-background'
import Hero from './components/main/hero'


function App() {
  return (
    <div className="min-h-screen text-white relative z-10" style={{ backgroundColor: '#000' }}>
      <StarsCanvas />
      <Header />
      <Hero />
      
      <Body />
      <Footer />
    </div>
  )
}

export default App
