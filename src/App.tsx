import { useState, useRef } from 'react';
import { RadialMenu } from './components/RadialMenu/RadialMenu.tsx';
import { ThemeProvider } from './context/ThemeProvider.tsx'; 
import Home from './sections/Home.tsx';
import About from './sections/About.tsx';
import Projects from './sections/Projects.tsx';
import Contact from './sections/Contact.tsx';
import './App.css';
import './styles/components/Section.css';

function App() {
  const [currentSection, setCurrentSection] = useState('home');

  const handleNavigate = (section: string) => {
    const target = section.toLowerCase();
    if (target === currentSection) return;

    // start zoom-out animation
    setIsSwitching(true);
    setTimeout(() => {
      setCurrentSection(target);
      // allow render of new section then zoom-in
      setTimeout(() => setIsSwitching(false), 20);
    }, 360);
  };

  const [isSwitching, setIsSwitching] = useState(false);

  return (
    <ThemeProvider>
      <div className="App">
        {/* Radial Menu */}
        <RadialMenu navigateTo={handleNavigate} />

        {/* Sections */}
        <main>
          <div className={`section-root`}>
            <div className={`section-container ${isSwitching ? 'zoom-out' : 'zoom-in'}`}>
              {currentSection === 'home' && <Home />}
              {currentSection === 'about' && <About />}
              {currentSection === 'projects' && <Projects />}
              {currentSection === 'contact' && <Contact />}
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
