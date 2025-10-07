import { useState } from 'react';
import { RadialMenu } from './components/RadialMenu/RadialMenu.tsx';
import { ThemeProvider } from './context/ThemeProvider.tsx'; 
import Home from './sections/Home.tsx';
import About from './sections/About.tsx';
import Projects from './sections/Projects.tsx';
import Contact from './sections/Contact.tsx';
import './App.css';

function App() {
  const [currentSection, setCurrentSection] = useState('home');

  const handleNavigate = (section: string) => {
    setCurrentSection(section.toLowerCase());
  };

  return (
    <ThemeProvider>
      <div className="App">
        {/* Radial Menu */}
        <RadialMenu navigateTo={handleNavigate} />

        {/* Sections */}
        <main>
          {currentSection === 'home' && <Home />}
          {currentSection === 'about' && <About />}
          {currentSection === 'projects' && <Projects />}
          {currentSection === 'contact' && <Contact />}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
