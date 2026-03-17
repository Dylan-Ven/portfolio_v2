'use client';
import { useState, useEffect, useMemo } from 'react';
import Terminal from '@/components/Terminal/Terminal';
import '../styles/components/Home.css';

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false);
  const [typedText, setTypedText] = useState('');
  
  // Generate random values for boot sequence (only once)
  const bootText = useMemo(() => {
    const cryptoApi = globalThis.crypto;
    const generateSecureUUID = () => {
      if (cryptoApi?.randomUUID) {
        return cryptoApi.randomUUID();
      }

      if (cryptoApi?.getRandomValues) {
        const bytes = new Uint8Array(16);
        cryptoApi.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }

      return '00000000-0000-4000-8000-000000000000';
    };

    const serverNumber = Math.floor(Math.random() * 25) + 1;
    const biosVersion = `RBIOS-4.02.08.${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`;
    const memorySize = [32, 64, 128, 256][Math.floor(Math.random() * 4)];
    const rootCode = Math.floor(Math.random() * 9000) + 1000;
    const serialCode = `52EE5.E${Math.floor(Math.random() * 9) + 1}.E${Math.floor(Math.random() * 9) + 1}`;
    const fakeUUID = generateSecureUUID();

    
    return `
    NST.v2 // NiSuTe SYSTEMS ARCHITECTURE
    [NODE: ${serverNumber}]
    >UUID: ${fakeUUID}
    PROPERTY OF NISUTE EUROPE MEDIA LABS // EST. 199X

    > QUERY CONSOLE /SYNC

    NST-M800 "LENSMASTER"

    > GRANT PERM /LEVEL:ROOT /USER:ADMIN
    Logic-Gate: OPEN. [RWED] privileges assigned to ADMIN.

    > ABORT RECOVERY /STATE:HOLD
    Automatic reboot cicles: SUSPENDED. System in static state. Awaiting further instructions.

    NIS-TECH FIRMWARE (c) 2201-2203
    CORE-BUILD: ${biosVersion} // UNIT: ${serialCode}
    UPPER-STACK: ${memorySize} GB
    IDENT: ${rootCode}
    STATUS: [MAINTENANCE OVERRIDE ACTIVE]
    !! NOTICE: DIRECT DATA-STREAM ACCESS ACTIVE. PARITY CHECKS DISABLED. !!

    > LAUNCH TRACE /MAP:ACCOUNTS.F
    Scrubbing Bit-Map...
    Injecting Override...
    Console Ready.`;
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
