'use client';
import { useState, useEffect, useMemo } from 'react';
import Terminal from '@/components/Terminal/Terminal';
import '../styles/components/Home.css';

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false);
  const [typedText, setTypedText] = useState('');
  
  // Generate random values for boot sequence (only once)
  const bootText = useMemo(() => {
    const serverNumber = Math.floor(Math.random() * 8) + 1;
    const biosVersion = `RBIOS-4.02.08.${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`;
    const memorySize = [32, 64, 128, 256][Math.floor(Math.random() * 4)];
    const rootCode = Math.floor(Math.random() * 9000) + 1000;
    const serialCode = `52EE5.E${Math.floor(Math.random() * 9) + 1}.E${Math.floor(Math.random() * 9) + 1}`;
    
    return `ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM
COPYRIGHT 2075-2077 ROBCO INDUSTRIES
-Server ${serverNumber}-

>SET TERMINAL/INQUIRE

RIT-V300

>SET FILE/PROTECTION=OWNER:RWED ACCOUNTS.F
>SET HALT RESTART/MAINT

Initializing Robco Industries(TM) MF Boot Agent v2.3.0
RETROS BIOS
${biosVersion} ${serialCode}
Copyright 2201-2203 Robco Ind.
Uppermem: ${memorySize} KB
Root (${rootCode})
Maintenance Mode

>RUN DEBUG/ACCOUNTS.F`;
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    
    const typeNextChar = () => {
      if (currentIndex <= bootText.length) {
        setTypedText(bootText.slice(0, currentIndex));
        
        let delay = 20; // Default typing speed
        
        // Check if we just typed a newline character
        if (bootText[currentIndex - 1] === '\n') {
          // Check if the next line is blank (empty line)
          const nextLineEnd = bootText.indexOf('\n', currentIndex);
          const nextLine = bootText.slice(currentIndex, nextLineEnd === -1 ? bootText.length : nextLineEnd).trim();
          
          if (nextLine === '') {
            // Blank line - add random delay between 200-400ms
            delay = Math.random() * 200 + 200;
          } else {
            // Regular newline - 200ms delay
            delay = 200;
          }
        }
        
        currentIndex++;
        timeoutId = setTimeout(typeNextChar, delay);
      } else {
        setTimeout(() => setBootComplete(true), 500);
      }
    };
    
    typeNextChar();

    return () => clearTimeout(timeoutId);
  }, [bootText]);

  if (!bootComplete) {
    return (
      <section className="home-section boot-screen">
        <div className="terminal-output">
          <pre>{typedText}</pre>
          <span className="cursor blink">█</span>
        </div>
      </section>
    );
  }

  return <Terminal />;
}
