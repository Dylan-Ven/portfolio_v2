'use client';
import { useState, useEffect, useRef } from 'react';
import { projectsData, majorProjects, minorProjects, skillsData, contactData, experienceData } from '@/data/portfolio';
import './Terminal.css';

type Section = 'home' | 'about' | 'projects' | 'contact';
type Subsection = string | null;

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

export default function Terminal() {
  const [currentSection, setCurrentSection] = useState<Section>('home');
  const [currentSubsection, setCurrentSubsection] = useState<Subsection>(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terminal-command-history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState<string | null>(null);
  const [typingEffect, setTypingEffect] = useState<boolean>(() => {
    // Load typing effect preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terminal-typing-effect');
      return saved === 'true'; // Default to false if not set
    }
    return false;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    // Load theme preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terminal-theme');
      return saved || 'default';
    }
    return 'default';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    // Load sound preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terminal-sound');
      return saved === 'true';
    }
    return false;
  });
  const [crtEffect, setCrtEffect] = useState<boolean>(() => {
    // Load CRT effect preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terminal-crt');
      return saved === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasBooted, setHasBooted] = useState<boolean>(() => {
    // Check if already booted this session
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('terminal-booted') === 'true';
    }
    return false;
  });
  const [sessionStart] = useState<number>(Date.now());
  const [commandCount, setCommandCount] = useState<number>(0);
  const [sectionsVisited, setSectionsVisited] = useState<Set<string>>(new Set(['home']));
  const [commandFrequency, setCommandFrequency] = useState<Map<string, number>>(new Map());
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>(() => {
    // Load custom prompt from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terminal-prompt');
      return saved || '$';
    }
    return '$';
  });
  const [discordActivity, setDiscordActivity] = useState<string>('Playing Videogames');
  const [discordStatus, setDiscordStatus] = useState<'online' | 'idle' | 'dnd' | 'offline'>('online');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [sudoMode, setSudoMode] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef<number>(0);

  // Initialize
  useEffect(() => {
    showHomeContent();
    
    // Show boot sequence on first load
    if (!hasBooted) {
      const bootSequence = async () => {
        const bootMessages = [
          'INITIALIZING TERMINAL...',
          'LOADING SYSTEM MODULES... [OK]',
          'CHECKING PORTFOLIO DATA... [OK]',
          'ESTABLISHING CONNECTION... [OK]',
          'BOOTING DYLAN\'S PORTFOLIO v2.0',
          ''
        ];
        
        const tempHistory: TerminalLine[] = [];
        for (const msg of bootMessages) {
          await new Promise(resolve => setTimeout(resolve, 150));
          tempHistory.push({ type: 'output', content: msg });
          setHistory([...tempHistory]);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        sessionStorage.setItem('terminal-booted', 'true');
        setHasBooted(true);
        
        // Show home content after boot
        setHistory([{
          type: 'output',
          content: `<span class="ascii-desktop">  ____            _    __       _ _       
 |  _ \\ ___  _ __| |_ / _| ___ | (_) ___  
 | |_) / _ \\| '__| __| |_ / _ \\| | |/ _ \\ 
 |  __/ (_) | |  | |_|  _| (_) | | | (_) |
 |_|   \\___/|_|   \\__|_|  \\___/|_|_|\\___/ </span><span class="ascii-mobile">
━━━━━━━━━━━━━━━━━━━━━━
   PORTFOLIO v2.0
━━━━━━━━━━━━━━━━━━━━━━</span>

DYLAN VAN DER VEN
Full-Stack Developer & UI/UX Designer
Status: ${discordActivity}

Navigate to:
[1] about    - Learn about me
[2] projects - View my work
[3] contact  - Get in touch`
        }]);
      };
      
      bootSequence();
    } else {
      // Skip boot sequence if already booted
      setHistory([{
        type: 'output',
        content: `<span class="ascii-desktop">  ____            _    __       _ _       
 |  _ \\ ___  _ __| |_ / _| ___ | (_) ___  
 | |_) / _ \\| '__| __| |_ / _ \\| | |/ _ \\ 
 |  __/ (_) | |  | |_|  _| (_) | | | (_) |
 |_|   \\___/|_|   \\__|_|  \\___/|_|_|\\___/ </span><span class="ascii-mobile">
━━━━━━━━━━━━━━━━━━━━━━
   PORTFOLIO v2.0
━━━━━━━━━━━━━━━━━━━━━━</span>

DYLAN VAN DER VEN
Full-Stack Developer & UI/UX Designer
Status: ${discordActivity}

Navigate to:
[1] about    - Learn about me
[2] projects - View my work
[3] contact  - Get in touch`
      }]);
    }
    
    // Apply saved theme
    if (currentTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, []);

  // Save command history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && commandHistory.length > 0) {
      localStorage.setItem('terminal-command-history', JSON.stringify(commandHistory));
    }
  }, [commandHistory]);

  // Save CRT effect preference and apply class
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('terminal-crt', String(crtEffect));
    }
  }, [crtEffect]);

  // Save custom prompt preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('terminal-prompt', customPrompt);
    }
  }, [customPrompt]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Fetch Discord activity via Lanyard
  useEffect(() => {
    const DISCORD_ID = '828859067618558012';
    
    const fetchDiscordActivity = async () => {
      try {
        // Use CORS proxy for development to avoid CORS issues
        const isDev = process.env.NODE_ENV === 'development';
        const apiUrl = isDev 
          ? `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)}`
          : `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const { discord_status, activities, listening_to_spotify } = data.data;
          
          // Update status
          setDiscordStatus(discord_status);
          
          // Determine activity text
          if (listening_to_spotify) {
            const song = data.data.spotify?.song || 'Unknown';
            const artist = data.data.spotify?.artist || 'Unknown';
            setDiscordActivity(`Listening to ${song} by ${artist}`);
          } else if (activities && activities.length > 0) {
            const activity = activities[0];
            if (activity.type === 0) { // Playing
              setDiscordActivity(`Playing ${activity.name}`);
            } else if (activity.type === 2) { // Listening
              setDiscordActivity(`Listening to ${activity.name}`);
            } else if (activity.type === 3) { // Watching
              setDiscordActivity(`Watching ${activity.name}`);
            } else if (activity.type === 4) { // Custom status
              setDiscordActivity(activity.state || activity.name || 'Chilling');
            } else {
              setDiscordActivity(activity.name || 'Active on Discord');
            }
          } else {
            // No activity, show based on status
            if (discord_status === 'online') {
              setDiscordActivity('Online');
            } else if (discord_status === 'idle') {
              setDiscordActivity('Away');
            } else if (discord_status === 'dnd') {
              setDiscordActivity('Do Not Disturb');
            } else {
              setDiscordActivity('Offline');
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch Discord activity:', error);
        // Set fallback status
        setDiscordActivity('Available online');
        setDiscordStatus('online');
      }
    };

    // Fetch immediately
    fetchDiscordActivity();
    
    // Update every 30 seconds
    const interval = setInterval(fetchDiscordActivity, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when history changes (smooth scroll)
  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      const targetScroll = element.scrollHeight;
      const startScroll = element.scrollTop;
      const distance = targetScroll - startScroll - element.clientHeight;
      
      if (distance > 0) {
        const duration = 300; // ms
        const startTime = performance.now();
        
        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (ease-out)
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          element.scrollTop = startScroll + (distance * easeProgress);
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };
        
        requestAnimationFrame(animateScroll);
      }
    }
  }, [history]);

  const addOutput = (content: string, type: 'output' | 'error' = 'output') => {
    if (typingEffect && !isTyping) {
      // Add typing animation
      setIsTyping(true);
      let currentIndex = 0;
      const lines = content.split('\n');
      const tempHistory: TerminalLine[] = [];

      const typeNextChar = () => {
        if (currentIndex < content.length) {
          const char = content[currentIndex];
          const currentLineIndex = content.substring(0, currentIndex + 1).split('\n').length - 1;
          const currentLineContent = content.substring(0, currentIndex + 1).split('\n')[currentLineIndex];
          
          setHistory(prev => {
            const newHistory = [...prev];
            if (newHistory.length > 0 && newHistory[newHistory.length - 1].type === type && currentIndex > 0) {
              // Update existing line
              newHistory[newHistory.length - 1] = {
                type,
                content: content.substring(0, currentIndex + 1)
              };
            } else {
              // Add new line
              newHistory.push({ type, content: content.substring(0, currentIndex + 1) });
            }
            return newHistory;
          });

          currentIndex++;
          typingTimeoutRef.current = setTimeout(typeNextChar, 1); // Adjust speed here (lower = faster)
        } else {
          setIsTyping(false);
        }
      };

      typeNextChar();
    } else {
      // No typing effect, add immediately
      setHistory(prev => [...prev, { type, content }]);
    }
  };

  const addInput = (content: string) => {
    setHistory(prev => [...prev, { type: 'input', content: `${customPrompt} ${content}` }]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Show loading animation
  const showLoading = async (callback: () => void, delay: number = 300) => {
    setIsLoading(true);
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frameIndex = 0;
    const loadingLine: TerminalLine = { type: 'output', content: `Loading... ${frames[0]}` };
    setHistory(prev => [...prev, loadingLine]);
    
    const interval = setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
      setHistory(prev => {
        const newHistory = [...prev];
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].content.startsWith('Loading...')) {
          newHistory[newHistory.length - 1] = {
            type: 'output',
            content: `Loading... ${frames[frameIndex]}`
          };
        }
        return newHistory;
      });
    }, 80);

    await new Promise(resolve => setTimeout(resolve, delay));
    clearInterval(interval);
    
    // Remove loading line
    setHistory(prev => prev.filter(line => !line.content.startsWith('Loading...')));
    setIsLoading(false);
    callback();
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const showHomeContent = () => {
    setCurrentSection('home');
    setCurrentSubsection(null);
  };

  const showAboutMenu = () => {
    setCurrentSection('about');
    setCurrentSubsection(null);
  };

  const showProjectsMenu = () => {
    setCurrentSection('projects');
    setCurrentSubsection(null);
  };

  const showContactMenu = () => {
    setCurrentSection('contact');
    setCurrentSubsection(null);
  };

  // Syntax highlighting function
  const applySyntaxHighlighting = (text: string): string => {
    // Highlight numbers in brackets [1], [2], etc.
    text = text.replace(/\[(\d+)\]/g, '<span class="syntax-bracket">[</span><span class="syntax-number">$1</span><span class="syntax-bracket">]</span>');
    
    // Highlight skill progress bars with color coding
    text = text.replace(/\[([█░]+)\]\s+([1-5])\/5/g, (match, bar, level) => {
      const levelNum = parseInt(level);
      let color = '';
      if (levelNum === 1) color = '#8b0000'; // Dark red
      else if (levelNum === 2) color = '#cc0000'; // Red  
      else if (levelNum === 3) color = '#ffcc00'; // Yellow
      else if (levelNum === 4) color = '#90ee90'; // Light green
      else if (levelNum === 5) color = '#00cc00'; // Dark green
      return `<span style="color: ${color}">[${bar}] ${level}/5</span>`;
    });
    
    // Highlight success symbols and messages (order matters - longer words first)
    text = text.replace(/(✓|✅|SUCCESS|successful|Downloaded|completed|enabled|disabled)/gi, '<span class="syntax-success">$1</span>');
    
    // Highlight error messages
    text = text.replace(/(ERROR|FAILED|undefined|No such)/gi, '<span class="syntax-error">$1</span>');
    
    // Highlight URLs and links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<span class="syntax-link">$1</span>');
    text = text.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<span class="syntax-link">$1</span>');
    
    // Highlight loading symbols
    text = text.replace(/(📦|⠋|🔗)/g, '<span class="syntax-highlight">$1</span>');
    
    // Highlight command names in help text
    text = text.replace(/^(\s*)(help|clear|home|about|projects|contact|back|ls|cd|npm|github|linkedin|email|instagram|typing|theme|themes|sound|tree|experience|copy|open|crt|debug|prompt|stats)(\s)/gm, '$1<span class="syntax-command">$2</span>$3');
    
    return text;
  };

  // Calculate Levenshtein distance for command suggestions
  const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,    // deletion
            dp[i][j - 1] + 1,    // insertion
            dp[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }

    return dp[m][n];
  };

  // Find closest matching command
  const findSimilarCommand = (input: string): string | null => {
    const commands = [
      'help', 'clear', 'home', 'about', 'bio', 'skills', 'frameworks', 
      'experience', 'projects', 'contact', 'back', 'themes', 'tree',
      'typing', 'sound', 'theme', 'ls', 'cd', 'github', 'linkedin',
      'email', 'instagram', 'npm', 'matrix', 'hack', 'coffee', 'sudo',
      'whoami', 'ping', 'fortune', 'joke', 'secret', 'stats', 'debug', 'prompt', 'crt',
      'copy', 'open'
    ];

    let minDistance = Infinity;
    let closestCommand = null;

    for (const cmd of commands) {
      const distance = levenshteinDistance(input.toLowerCase(), cmd.toLowerCase());
      if (distance < minDistance && distance <= 2) {
        minDistance = distance;
        closestCommand = cmd;
      }
    }

    return closestCommand;
  };

  // Play terminal beep sound
  const playBeep = () => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  // Add output with delay for multi-line content
  const addOutputWithDelay = async (lines: string[]) => {
    for (const line of lines) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addOutput(line);
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Handle sudo password mode
    if (sudoMode) {
      setSudoMode(false);
      addInput('*'.repeat(cmd.length)); // Show asterisks instead of actual input
      addOutputWithDelay([
        'Authentication successful.',
        'Checking system privileges...',
        'Warning: You now have root access to absolutely nothing.',
        'sudo: Nice try though.'
      ]);
      return;
    }
    
    addInput(cmd);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    playBeep(); // Play sound on command execution

    // Track stats
    setCommandCount(prev => prev + 1);
    setCommandFrequency(prev => {
      const newMap = new Map(prev);
      newMap.set(cmd, (newMap.get(cmd) || 0) + 1);
      return newMap;
    });

    if (!trimmedCmd) return;

    // Check for number input (1-9)
    if (/^[1-9]$/.test(trimmedCmd)) {
      handleNumberInput(parseInt(trimmedCmd));
      return;
    }

    // Command routing
    switch (trimmedCmd) {
      case 'help':
        addOutput(`AVAILABLE COMMANDS:
  help       - Show this help message
  clear      - Clear terminal output
  home       - Go to home section
  about      - Go to about section
  projects   - Go to projects section
  contact    - Go to contact information
  back       - Go back to previous section
  stats      - Show session statistics
  debug on/off - Toggle debug mode
  prompt set <text> - Set custom prompt
  prompt reset - Reset prompt to default
  npm install resume - Download resume
  npm i resume       - Download resume (shorthand)
  typing on/off - Toggle typing effect animation
  theme <name> - Change color theme
  themes     - List all available themes
  sound on/off - Toggle terminal sound effects
  crt on/off - Toggle CRT screen effect
  tree       - Display directory structure
  
  CONTACT COMMANDS (available in contact section):
  github     - Open GitHub profile
  linkedin   - Open LinkedIn profile
  email      - Open email client
  instagram  - Open Instagram profile
  
  ALIASES:
  ls         - Alias for 'projects'
  cd <section> - Navigate to section (e.g., cd about)
  cd ..      - Alias for 'back'
  
  EASTER EGGS: Try 'matrix', 'hack', 'coffee', 'sudo', 'whoami', 'ping', 'fortune', 'joke', 'secret'
  
  In each section, type a number (1-9) or command to access subsections`);
        break;

      case 'clear':
        clearHistory();
        break;

      case 'home':
        setSectionsVisited(prev => new Set(prev).add('home'));
        showLoading(() => {
          clearHistory();
          showHomeContent();
          addOutput(`<span class="ascii-desktop">  ____            _    __       _ _       
 |  _ \\ ___  _ __| |_ / _| ___ | (_) ___  
 | |_) / _ \\| '__| __| |_ / _ \\| | |/ _ \\ 
 |  __/ (_) | |  | |_|  _| (_) | | | (_) |
 |_|   \\___/|_|   \\__|_|  \\___/|_|_|\\___/ </span><span class="ascii-mobile">
━━━━━━━━━━━━━━━━━━━━━━
   PORTFOLIO v2.0
━━━━━━━━━━━━━━━━━━━━━━</span>

DYLAN VAN DER VEN
Full-Stack Developer & UI/UX Designer
Status: ${discordActivity}

Navigate to:
[1] about    - Learn about me
[2] projects - View my work
[3] contact  - Get in touch`);
        });
        break;

      case 'about':
        setSectionsVisited(prev => new Set(prev).add('about'));
        showLoading(() => {
          clearHistory();
          showAboutMenu();
          addOutput(`ABOUT DYLAN VAN DER VEN

[1] bio        - About me
[2] skills     - Technical skills (with levels)
[3] frameworks - Frameworks & libraries
[4] experience - Work history & timeline

Type a number or command to view`);
        });
        break;

      case 'bio':
        if (currentSection === 'about') {
          setCurrentSubsection('bio');
          clearHistory();
          addOutput(`BIOGRAPHY

I'm a passionate fullstack developer and designer with a love for creating
immersive digital experiences. I specialize in building modern web applications
with cutting-edge technologies and creative visual effects.

From pixel-perfect UI design to complex backend systems, I bridge the gap
between design and development. I'm particularly interested in WebGL,
shader programming, and creating unique interactive experiences.

CURRENTLY:
- Learning shader programming & advanced Three.js
- Open to freelance projects & collaborations
- Building experimental web experiences

Type 'back' to return`);
        } else {
          addOutput('undefined', 'error');
        }
        break;

      case 'skills':
        if (currentSection === 'about') {
          setCurrentSubsection('skills');
          clearHistory();
          
          const getProgressBar = (level: number) => {
            const filled = '█'.repeat(level);
            const empty = '░'.repeat(5 - level);
            return filled + empty;
          };
          
          const getSkillColor = (level: number) => {
            if (level <= 2) return level === 1 ? '#8b0000' : '#cc0000'; // Dark red to red
            if (level === 3) return '#ffcc00'; // Yellow
            if (level === 4) return '#90ee90'; // Light green
            return '#00cc00'; // Dark green
          };
          
          const skillsOutput = Object.entries(skillsData).map(([category, items]) => {
            const skillsList = (items as Array<{name: string, level: number}>).map(skill => {
              const bar = getProgressBar(skill.level);
              return `  ${skill.name.padEnd(20)} [${bar}] ${skill.level}/5`;
            }).join('\n');
            return `[${category.toUpperCase()}]\n${skillsList}`;
          }).join('\n\n');
          
          addOutput(`TECHNICAL SKILLS\n\n${skillsOutput}\n\nLegend: █ = Proficient, ░ = Learning\nColors: Red (1-2), Yellow (3), Light Green (4), Dark Green (5)\n\nType 'back' to return`);
        } else {
          addOutput('undefined', 'error');
        }
        break;

      case 'frameworks':
        if (currentSection === 'about') {
          setCurrentSubsection('frameworks');
          clearHistory();
          const frontendList = skillsData.frontend.map((s: any) => s.name).join(', ');
          const backendList = skillsData.backend.map((s: any) => s.name).join(', ');
          const toolsList = skillsData.tools.map((s: any) => s.name).join(', ');
          addOutput(`FRAMEWORKS & LIBRARIES

Frontend: ${frontendList}
Backend: ${backendList}
Tools: ${toolsList}

Type 'back' to return`);
        } else {
          addOutput('undefined', 'error');
        }
        break;

      case 'experience':
        if (currentSection === 'about') {
          setCurrentSubsection('experience');
          clearHistory();
          const experienceOutput = experienceData.map((exp, index) => {
            const descriptions = exp.description.map(d => `    • ${d}`).join('\n');
            const techStack = `    Tech: ${exp.tech.join(', ')}`;
            return `
[█] ${exp.title}
    ${exp.company} | ${exp.location}
    ${exp.period}

${descriptions}
${techStack}`;
          }).join('\n\n');
          addOutput(`WORK EXPERIENCE${experienceOutput}\n\nType 'back' to return`);
        } else {
          addOutput('undefined', 'error');
        }
        break;

      case 'projects':
        setSectionsVisited(prev => new Set(prev).add('projects'));
        showLoading(() => {
          clearHistory();
          showProjectsMenu();
          addOutput(`PROJECTS

[1] major   - Major projects (${majorProjects.length})
[2] minor   - Minor projects (${minorProjects.length})

Type a number or 'major'/'minor' to view category`);
        });
        break;

      case 'major':
        if (currentSection === 'projects') {
          setCurrentSubsection('major');
          clearHistory();
          const majorList = majorProjects.map((p, i) => 
            `[${i + 1}] ${p.name}`
          ).join('\n');
          addOutput(`MAJOR PROJECTS\n\n${majorList}\n\nType a number (1-${majorProjects.length}) to view details`);
        } else {
          addOutput('undefined', 'error');
        }
        break;

      case 'minor':
        if (currentSection === 'projects') {
          setCurrentSubsection('minor');
          clearHistory();
          const minorList = minorProjects.map((p, i) => 
            `[${i + 1}] ${p.name}`
          ).join('\n');
          addOutput(`MINOR PROJECTS\n\n${minorList}\n\nType a number (1-${minorProjects.length}) to view details`);
        } else {
          addOutput('undefined', 'error');
        }
        break;

      case 'back':
        if (currentSubsection) {
          // If in a subsection, go back to main section
          setCurrentSubsection(null);
          if (currentSection === 'about') {
            clearHistory();
            addOutput(`ABOUT DYLAN VAN DER VEN

[1] bio        - About me
[2] skills     - Technical skills (with levels)
[3] frameworks - Frameworks & libraries
[4] experience - Work history & timeline

Type a number or command to view`);
          } else if (currentSection === 'projects') {
            clearHistory();
            addOutput(`PROJECTS

[1] major   - Major projects (${majorProjects.length})
[2] minor   - Minor projects (${minorProjects.length})

Type a number or 'major'/'minor' to view category`);
          }
        } else {
          addOutput('Already at main section. Type a section name to navigate.', 'error');
        }
        break;

      case 'contact':
        setSectionsVisited(prev => new Set(prev).add('contact'));
        showLoading(() => {
          clearHistory();
          showContactMenu();
          const contactOutput = contactData.map((contact, index) => {
            let line = `[${index + 1}] ${contact.label.padEnd(10)} ${contact.value}`;
            // Add warning for email
            if (contact.label === 'EMAIL') {
              line += '  ⚠ Slow response';
            }
            return line;
          }).join('\n');
          addOutput(`CONTACT DYLAN VAN DER VEN

Status: ${discordActivity}
Location: Netherlands 🇳🇱
Timezone: CET (UTC+1)

${contactOutput}

Type a number (1-${contactData.length}) to copy, or use quick commands:
  github     - Open GitHub profile
  linkedin   - Open LinkedIn profile
  email      - Open email client
  instagram  - Open Instagram profile`);
        });
        break;

      // Aliases
      case 'ls':
        // Alias for projects
        clearHistory();
        setCurrentSection('projects');
        const projectsList2 = projectsData.map((p, i) => 
          `[${i + 1}] ${p.name} - ${p.description}`
        ).join('\n');
        addOutput(`PROJECTS\n\n${projectsList2}\n\nType a number (1-${projectsData.length}) to view details`);
        break;

      case 'typing on':
        if (typingEffect) {
          addOutput('⚠ Typing effect is already enabled', 'error');
        } else {
          setTypingEffect(true);
          localStorage.setItem('terminal-typing-effect', 'true');
          addOutput('✓ Typing effect enabled');
        }
        break;

      case 'typing off':
        if (!typingEffect) {
          addOutput('⚠ Typing effect is already disabled', 'error');
        } else {
          setTypingEffect(false);
          localStorage.setItem('terminal-typing-effect', 'false');
          addOutput('✓ Typing effect disabled');
        }
        break;

      case 'sound on':
        if (soundEnabled) {
          addOutput('⚠ Terminal sounds are already enabled', 'error');
        } else {
          setSoundEnabled(true);
          localStorage.setItem('terminal-sound', 'true');
          addOutput('✓ Terminal sounds enabled 🔊');
          playBeep(); // Demo the sound
        }
        break;

      case 'sound off':
        if (!soundEnabled) {
          addOutput('⚠ Terminal sounds are already disabled', 'error');
        } else {
          setSoundEnabled(false);
          localStorage.setItem('terminal-sound', 'false');
          addOutput('✓ Terminal sounds disabled 🔇');
        }
        break;

      case 'crt on':
        if (crtEffect) {
          addOutput('⚠ CRT screen effect is already enabled', 'error');
        } else {
          setCrtEffect(true);
          addOutput('✓ CRT screen effect enabled 📺');
        }
        break;

      case 'crt off':
        if (!crtEffect) {
          addOutput('⚠ CRT screen effect is already disabled', 'error');
        } else {
          setCrtEffect(false);
          addOutput('✓ CRT screen effect disabled');
        }
        break;

      case 'themes':
        addOutput(`AVAILABLE THEMES:

[1]  default         - Modern blue terminal
[2]  green           - Classic green terminal
[3]  amber           - Warm amber terminal
[4]  dracula         - Dracula color scheme
[5]  monokai         - Monokai color scheme
[6]  nord            - Nord color scheme
[7]  high-contrast   - WCAG AAA accessibility
[8]  solarized-dark  - Solarized Dark
[9]  solarized-light - Solarized Light
[10] gruvbox         - Gruvbox retro theme
[11] tokyo-night     - Tokyo Night theme
[12] one-dark        - One Dark theme
[13] synthwave       - Synthwave 80s neon
[14] matrix          - Matrix green code
[15] cyberpunk       - Cyberpunk 2077 style

Use: theme <name>
Example: theme tokyo-night`);
        break;

      case 'tree':
        addOutput(`/
├── home/
│   └── dylan/
│       ├── about/
│       │   ├── bio.txt
│       │   ├── skills.json
│       │   └── frameworks.md
│       ├── projects/
│       │   ├── portfolio-terminal/
│       │   ├── webgl-experience/
│       │   └── fullstack-app/
│       ├── contact/
│       │   ├── email.link
│       │   ├── github.link
│       │   ├── linkedin.link
│       │   └── instagram.link
│       └── resume/
│           └── Dylan_van_der_Ven_Resume.pdf (installable)
└── public/
    └── portfolio.html

Use: cd <section> to navigate
Example: cd about`);
        break;

      default:
        // Handle 'theme' command
        if (trimmedCmd.startsWith('theme ')) {
          const themeName = trimmedCmd.substring(6).trim();
          const validThemes = ['default', 'green', 'amber', 'dracula', 'monokai', 'nord', 'high-contrast', 'solarized-dark', 'solarized-light', 'gruvbox', 'tokyo-night', 'one-dark', 'synthwave', 'matrix', 'cyberpunk'];
          
          if (validThemes.includes(themeName)) {
            setCurrentTheme(themeName);
            localStorage.setItem('terminal-theme', themeName);
            
            if (themeName === 'default') {
              document.documentElement.removeAttribute('data-theme');
            } else {
              document.documentElement.setAttribute('data-theme', themeName);
            }
            
            addOutput(`✓ Theme changed to: ${themeName}`);
            return;
          } else {
            addOutput(`ERROR: Invalid theme '${themeName}'\nAvailable themes: ${validThemes.join(', ')}`, 'error');
            return;
          }
        }

        // Handle 'cd' command
        if (trimmedCmd.startsWith('cd ')) {
          const target = trimmedCmd.substring(3).trim();
          
          if (target === '..') {
            // cd .. is alias for back
            if (currentSubsection) {
              setCurrentSubsection(null);
              if (currentSection === 'about') {
                clearHistory();
                showAboutMenu();
                addOutput(`ABOUT DYLAN VAN DER VEN

[1] bio        - About me
[2] skills     - Technical skills (with levels)
[3] frameworks - Frameworks & libraries
[4] experience - Work history & timeline

Type a number or command to view`);
              } else if (currentSection === 'projects') {
                clearHistory();
                const projectsList = projectsData.map((p, i) => 
                  `[${i + 1}] ${p.name} - ${p.description}`
                ).join('\n');
                addOutput(`PROJECTS\n\n${projectsList}\n\nType a number (1-${projectsData.length}) to view details`);
              }
            } else {
              addOutput('Already at main section. Type a section name to navigate.', 'error');
            }
            return;
          }

          // cd <section>
          const validSections = ['home', 'about', 'projects', 'contact'];
          if (validSections.includes(target)) {
            executeCommand(target); // Reuse existing navigation logic
            return;
          } else {
            addOutput(`cd: ${target}: No such section`, 'error');
            return;
          }
        }

        // Check for social link commands (only in contact section)
        if (currentSection === 'contact') {
          const contact = contactData.find(c => c.label.toLowerCase() === trimmedCmd);
          
          if (contact && contact.link && contact.link !== '#') {
            addOutput(`Opening ${trimmedCmd}...`);
            window.open(contact.link, '_blank');
            return;
          }
        }

        // Check for npm install/i resume command
        if (trimmedCmd === 'npm install resume' || trimmedCmd === 'npm i resume') {
          addOutput(`📦 Installing resume...
⠋ Downloading Dylan_van_der_Ven_Resume.pdf
✓ Resume downloaded successfully!

Check your downloads folder.`);
          
          // Trigger download
          const link = document.createElement('a');
          link.href = '/resume/Dylan_van_der_Ven_Resume.pdf';
          link.download = 'Dylan_van_der_Ven_Resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }

        // Easter eggs with delays and variants
        if (trimmedCmd === 'matrix') {
          addOutputWithDelay([
            'Wake up, Neo...',
            'The Matrix has you.',
            'Follow the white rabbit.',
            '',
            'Knock, knock, Neo.'
          ]);
          return;
        }

        if (trimmedCmd === 'hack') {
          addOutput('[INITIALIZING HACKING SEQUENCE...]');
          
          // Animated progress bar that replaces itself with random increments
          let progress = 0;
          
          const updateProgress = () => {
            if (progress >= 100) {
              progress = 100; // Cap at 100
              const filled = 20;
              const bar = '█'.repeat(filled);
              
              setHistory(prev => {
                const newHistory = [...prev];
                if (newHistory.length > 0 && newHistory[newHistory.length - 1].content.includes('%')) {
                  newHistory[newHistory.length - 1] = { type: 'output', content: `[${bar}] ${progress.toFixed(1)}%` };
                }
                return newHistory;
              });
              
              setTimeout(() => {
                addOutputWithDelay([
                  '',
                  'ACCESS GRANTED',
                  "You're in Dylan's gaming library",
                  '',
                  'Just kidding. Nice try though!'
                ]);
              }, 300);
              return;
            }
            
            // Random increment between 1.0 and 3.2
            const increment = Math.random() * 2.2 + 1.0;
            progress = Math.min(progress + increment, 100);
            
            const filled = Math.floor((progress / 100) * 20);
            const empty = 20 - filled;
            const bar = '█'.repeat(filled) + '░'.repeat(empty);
            
            // Replace the last line with updated progress
            setHistory(prev => {
              const newHistory = [...prev];
              if (newHistory.length > 0 && newHistory[newHistory.length - 1].content.includes('%')) {
                newHistory[newHistory.length - 1] = { type: 'output', content: `[${bar}] ${progress.toFixed(1)}%` };
              } else {
                newHistory.push({ type: 'output', content: `[${bar}] ${progress.toFixed(1)}%` });
              }
              return newHistory;
            });
            
            // Random delay between 50 and 150ms
            const delay = Math.random() * 100 + 50;
            setTimeout(updateProgress, delay);
          };
          
          updateProgress();
          return;
        }

        if (trimmedCmd === 'coffee') {
          addOutputWithDelay([
            'Setting perfect temperature...',
            'Adding milk...',
            'Brewing coffee...',
            '',
            `       (  )   (   )  )
        ) (   )  (  (
        ( )  (    ) )
        _____________
       <_____________> ___
       |             |/ _ \\
       |               | | |
       |               |_| |
    ___|             |\\___/
   /    \\___________/    \\
   \\_____________________/`
          ]);
          return;
        }

        if (trimmedCmd === 'joke') {
          const jokes = [
            ['Why do programmers prefer dark mode?', '', 'Because light attracts bugs!'],
            ['Why do Java developers wear glasses?', '', 'Because they don\'t C#!'],
            ['How many programmers does it take to change a light bulb?', '', 'None. It\'s a hardware problem!'],
            ['Why did the programmer quit his job?', '', 'Because he didn\'t get arrays!']
          ];
          const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
          addOutputWithDelay(randomJoke);
          return;
        }

        if (trimmedCmd === 'secret') {
          const secrets = [
            ['You found the secret command!', 'There is no secret... or is there?', 'Try exploring more commands!'],
            ['Secret discovered!', 'The real secret is the code we wrote along the way.'],
            ['Easter egg unlocked!', 'Congratulations! You\'re now officially a command explorer.'],
            ['Hidden gem found!', 'You have excellent curiosity. That\'s what makes great developers!']
          ];
          const randomSecret = secrets[Math.floor(Math.random() * secrets.length)];
          addOutputWithDelay(randomSecret);
          return;
        }

        // Sudo command with password prompt
        if (trimmedCmd === 'sudo') {
          addOutput('[sudo] password for dylan:');
          setSudoMode(true);
          return;
        }

        // Simple easter eggs (line-by-line)
        if (trimmedCmd === 'whoami') {
          addOutputWithDelay([
            'You are: A curious developer',
            'Location: Viewing Dylan\'s portfolio',
            'Mission: Exploring terminal commands',
            'Status: Awesome!'
          ]);
          return;
        }

        if (trimmedCmd === 'ping') {
          addOutputWithDelay([
            'PING portfolio.dylan.dev',
            '64 bytes from awesome: icmp_seq=1 ttl=64 time=0.1 ms',
            '64 bytes from impressive: icmp_seq=2 ttl=64 time=0.1 ms',
            '64 bytes from hire_me: icmp_seq=3 ttl=64 time=0.1 ms'
          ]);
          return;
        }

        if (trimmedCmd === 'fortune') {
          addOutputWithDelay([
            'Your fortune: You will discover an amazing developer today.',
            'Hint: You\'re already looking at his portfolio!'
          ]);
          return;
        }

        // Stats command
        if (trimmedCmd === 'stats') {
          const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);
          const minutes = Math.floor(sessionTime / 60);
          const seconds = sessionTime % 60;
          const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
          
          const mostUsedCmd = Array.from(commandFrequency.entries())
            .sort((a, b) => b[1] - a[1])[0];
          
          const sectionsStr = Array.from(sectionsVisited).join(', ');
          
          addOutput(`SESSION STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  Session Time:      ${timeStr}
📊 Commands Run:       ${commandCount}
🗂️  Sections Visited:  ${sectionsVisited.size} (${sectionsStr})
⭐ Most Used Command: ${mostUsedCmd ? `${mostUsedCmd[0]} (${mostUsedCmd[1]}x)` : 'N/A'}
💾 Commands in History: ${commandHistory.length}

🎯 Keep exploring!`);
          return;
        }

        // Debug mode
        if (trimmedCmd === 'debug on') {
          if (debugMode) {
            addOutput('⚠ Debug mode is already enabled', 'error');
            return;
          }
          setDebugMode(true);
          const debugInfo = `DEBUG MODE ENABLED 🐛
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[REACT STATE]
Current Section: ${currentSection}
Current Subsection: ${currentSubsection}
History Lines: ${history.length}
Typing Effect: ${typingEffect ? 'ON' : 'OFF'}
Sound: ${soundEnabled ? 'ON' : 'OFF'}
CRT Effect: ${crtEffect ? 'ON' : 'OFF'}
Theme: ${currentTheme}

[LOCALSTORAGE]
Command History: ${commandHistory.length} commands
Stored Theme: ${localStorage.getItem('terminal-theme')}
Stored Sound: ${localStorage.getItem('terminal-sound')}
Stored Typing: ${localStorage.getItem('terminal-typing-effect')}
Stored CRT: ${localStorage.getItem('terminal-crt')}

[BROWSER]
User Agent: ${navigator.userAgent}
Viewport: ${window.innerWidth}x${window.innerHeight}
Language: ${navigator.language}

[PERFORMANCE]
Memory: ${(performance as any).memory ? ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' : 'N/A'}
Uptime: ${Math.floor((Date.now() - sessionStart) / 1000)}s

Type 'debug off' to disable`;
          addOutput(debugInfo);
          return;
        }

        if (trimmedCmd === 'debug off') {
          if (!debugMode) {
            addOutput('⚠ Debug mode is already disabled', 'error');
            return;
          }
          setDebugMode(false);
          addOutput('✓ Debug mode disabled');
          return;
        }

        // Custom prompt
        if (trimmedCmd.startsWith('prompt set ')) {
          const newPrompt = cmd.substring('prompt set '.length).trim();
          if (newPrompt && newPrompt.length > 0) {
            setCustomPrompt(newPrompt);
            addOutput(`✓ Prompt changed to: ${newPrompt}`);
          } else {
            addOutput('ERROR: Prompt cannot be empty', 'error');
          }
          return;
        }

        if (trimmedCmd === 'prompt reset') {
          setCustomPrompt('$');
          addOutput('✓ Prompt reset to default: $');
          return;
        }

        // Check for GitHub command in project subsection
        if (currentSubsection?.includes('-project-') && trimmedCmd === 'github') {
          const [category, , projectNum] = currentSubsection.split('-');
          const projects = category === 'major' ? majorProjects : minorProjects;
          const projectIndex = parseInt(projectNum) - 1;
          const project = projects[projectIndex];
          if (project.link) {
            addOutput(`Opening GitHub: ${project.link}`);
            window.open(project.link, '_blank');
          } else {
            addOutput('No GitHub repository available for this project', 'error');
          }
          return;
        }

        // Check for webapp command in project subsection
        if (currentSubsection?.includes('-project-') && trimmedCmd === 'webapp') {
          const [category, , projectNum] = currentSubsection.split('-');
          const projects = category === 'major' ? majorProjects : minorProjects;
          const projectIndex = parseInt(projectNum) - 1;
          const project = projects[projectIndex];
          if (project.webapp) {
            addOutput(`Opening live webapp: ${project.webapp}`);
            window.open(project.webapp, '_blank');
          } else {
            addOutput('No live webapp available for this project', 'error');
          }
          return;
        }

        // Try to find similar command
        const suggestion = findSimilarCommand(cmd);
        if (suggestion) {
          addOutput(`Command not found: ${cmd}\nDid you mean '${suggestion}'?\nType 'help' for available commands`, 'error');
        } else {
          addOutput(`Command not found: ${cmd}\nType 'help' for available commands`, 'error');
        }
    }
  };

  const getProjectStatusClass = (status: string): string => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('online')) return 'status-project-online';
    if (lowerStatus.includes('development') || lowerStatus.includes('in development')) return 'status-project-development';
    if (lowerStatus.includes('offline')) return 'status-project-offline';
    if (lowerStatus.includes('private')) return 'status-project-private';
    return 'status-project-offline'; // default
  };

  const handleNumberInput = (num: number) => {
    if (currentSection === 'about') {
      if (num === 1) {
        setCurrentSubsection('bio');
        clearHistory();
        addOutput(`BIOGRAPHY

I’m a fourth-year Web and Software Development student at Yonder (formerly ROC Tilburg). I enjoy frontend work but lean toward full-stack and backend development.
My goal is to grow into a strong full-stack developer with a solid foundation in cybersecurity and DevOps.

Current personal projects:
• A Discord bot for my community
• Portfolio V2
• An online multiplayer version of Zeeslag

Currently learning:
• SvelteKit
• React
• Discord API
• Completing my studies

Type 'back' to return`);
      } else if (num === 2) {
        setCurrentSubsection('skills');
        clearHistory();
        
        const getProgressBar = (level: number) => {
          const filled = '█'.repeat(level);
          const empty = '░'.repeat(5 - level);
          return filled + empty;
        };
        
        const skillsOutput = Object.entries(skillsData).map(([category, items]) => {
          const skillsList = (items as Array<{name: string, level: number}>).map(skill => {
            const bar = getProgressBar(skill.level);
            return `  ${skill.name.padEnd(20)} [${bar}] ${skill.level}/5`;
          }).join('\n');
          return `[${category.toUpperCase()}]\n${skillsList}`;
        }).join('\n\n');
        
        addOutput(`TECHNICAL SKILLS\n\n${skillsOutput}\n\nLegend: █ = Proficient, ░ = Learning\nColors: Red (1-2), Yellow (3), Light Green (4), Dark Green (5)\n\nType 'back' to return`);
      } else if (num === 3) {
        setCurrentSubsection('frameworks');
        clearHistory();
        const frontendList = skillsData.frontend.map((s: any) => s.name).join(', ');
        const backendList = skillsData.backend.map((s: any) => s.name).join(', ');
        const toolsList = skillsData.tools.map((s: any) => s.name).join(', ');
        addOutput(`FRAMEWORKS & LIBRARIES

Frontend: ${frontendList}
Backend: ${backendList}
Tools: ${toolsList}

Type 'back' to return`);
      } else if (num === 4) {
        setCurrentSubsection('experience');
        clearHistory();
        const experienceOutput = experienceData.map((exp, index) => {
          const descriptions = exp.description.map(d => `    • ${d}`).join('\n');
          const techStack = `    Tech: ${exp.tech.join(', ')}`;
          return `
[█] ${exp.title}
    ${exp.company} | ${exp.location}
    ${exp.period}

${descriptions}
${techStack}`;
        }).join('\n\n');
        addOutput(`WORK EXPERIENCE${experienceOutput}\n\nType 'back' to return`);
      }
    } else if (currentSection === 'projects') {
      // If no subsection, selecting major or minor
      if (!currentSubsection) {
        if (num === 1) {
          // Navigate to major projects
          setCurrentSubsection('major');
          clearHistory();
          const majorList = majorProjects.map((p, i) => 
            `[${i + 1}] ${p.name}`
          ).join('\n');
          addOutput(`MAJOR PROJECTS\n\n${majorList}\n\nType a number (1-${majorProjects.length}) to view details`);
        } else if (num === 2) {
          // Navigate to minor projects
          setCurrentSubsection('minor');
          clearHistory();
          const minorList = minorProjects.map((p, i) => 
            `[${i + 1}] ${p.name}`
          ).join('\n');
          addOutput(`MINOR PROJECTS\n\n${minorList}\n\nType a number (1-${minorProjects.length}) to view details`);
        }
      } else if (currentSubsection === 'major' || currentSubsection === 'minor') {
        // In a category, selecting a project
        const projectList = currentSubsection === 'major' ? majorProjects : minorProjects;
        if (num >= 1 && num <= projectList.length) {
          const project = projectList[num - 1];
          setCurrentSubsection(`${currentSubsection}-project-${num}`);
          clearHistory();
          const commands = [
            project.link ? '[1] github - Open GitHub repository' : '',
            project.webapp ? '[2] webapp - Open live application' : ''
          ].filter(Boolean).join('\n');
          
          const statusClass = getProjectStatusClass(project.status);
          const commandsSection = commands ? `\n\nCommands:\n${commands}` : '';
          addOutput(`PROJECT: ${project.name}

Description: ${project.description}
Technologies: ${project.tech.join(', ')}
Status: <span class="project-status-dot ${statusClass}"></span>${project.status}${project.link ? `\nGitHub: ${project.link}` : ''}${project.webapp ? `\nLive: ${project.webapp}` : ''}${commandsSection}

Type 'back' to return`);
        }
      } else if (currentSubsection?.includes('-project-')) {
        // In a project detail view
        const [category, , projectNumStr] = currentSubsection.split('-');
        const projectNum = parseInt(projectNumStr);
        const projectList = category === 'major' ? majorProjects : minorProjects;
        const project = projectList[projectNum - 1];
        
        if (num === 1) {
          // Handle [1] github command
          addOutput(`Opening GitHub: ${project.link}`);
          window.open(project.link, '_blank');
        } else if (num === 2 && project.webapp) {
          // Handle [2] webapp command
          addOutput(`Opening live webapp: ${project.webapp}`);
          window.open(project.webapp, '_blank');
        }
      }
    } else if (currentSection === 'contact') {
      if (num >= 1 && num <= contactData.length) {
        const contact = contactData[num - 1];
        handleCopy(contact.value, contact.label);
        addOutput(`Copied ${contact.label}: ${contact.value}`);
      }
    } else if (currentSection === 'home') {
      if (num === 1) {
        clearHistory();
        showAboutMenu();
        addOutput(`ABOUT DYLAN VAN DER VEN

[1] bio        - About me
[2] skills     - Technical skills (with levels)
[3] frameworks - Frameworks & libraries
[4] experience - Work history & timeline

Type a number or command to view`);
      } else if (num === 2) {
        clearHistory();
        showProjectsMenu();
        addOutput(`PROJECTS

[1] major   - Major projects (${majorProjects.length})
[2] minor   - Minor projects (${minorProjects.length})

Type a number or 'major'/'minor' to view category`);
      } else if (num === 3) {
        setSectionsVisited(prev => new Set(prev).add('contact'));
        clearHistory();
        showContactMenu();
        const contactOutput = contactData.map((contact, index) => {
          let line = `[${index + 1}] ${contact.label.padEnd(10)} ${contact.value}`;
          // Add warning for email
          if (contact.label === 'EMAIL') {
            line += '  ⚠ Slow response';
          }
          return line;
        }).join('\n');
        addOutput(`CONTACT DYLAN VAN DER VEN

Status: ${discordActivity}
Location: Netherlands 🇳🇱
Timezone: CET (UTC+1)

${contactOutput}

Type a number (1-${contactData.length}) to copy, or use quick commands:
  github     - Open GitHub profile
  linkedin   - Open LinkedIn profile
  email      - Open email client
  instagram  - Open Instagram profile`);
      }
    }
  };

  const createParticles = () => {
    const inputArea = inputRef.current;
    if (!inputArea) return;
    
    const rect = inputArea.getBoundingClientRect();
    const newParticles: Array<{id: number, x: number, y: number}> = [];
    
    // Create 8-12 particles
    for (let i = 0; i < Math.floor(Math.random() * 5) + 8; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: rect.left + Math.random() * rect.width,
        y: rect.top + rect.height / 2
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    return newParticles;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newParticles = createParticles();
      // Cleanup particles after animation
      if (newParticles) {
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1000);
      }
      executeCommand(input);
      setInput('');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only auto-focus on desktop, not mobile
      if (window.innerWidth > 768 && document.activeElement !== inputRef.current && !e.ctrlKey && !e.metaKey) {
        inputRef.current?.focus();
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandHistory, historyIndex]);



  // Focus input on desktop only
  useEffect(() => {
    if (window.innerWidth > 768) {
      inputRef.current?.focus();
    }
  }, []);
  
  const handleLayoutClick = (e: React.MouseEvent) => {
    // Only focus input on desktop, not on mobile
    if (window.innerWidth > 768) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="terminal-layout" onClick={handleLayoutClick}>
      {/* Particle effects */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            '--random-x': Math.random(),
          } as React.CSSProperties}
        />
      ))}
      
      <div className="terminal-wrapper">
        <div className={`terminal-container ${crtEffect ? 'crt-effect' : ''}`}>
        <div className="terminal-header">
          <span>dylan@portfolio:~$</span>
          <span className="terminal-section">{currentSection}</span>
        </div>

        <div className="terminal-content" ref={contentRef}>
          {/* Command History */}
          {history.map((line, index) => (
            <div key={index} className={`history-line ${line.type}`}>
              <pre dangerouslySetInnerHTML={{ __html: line.type === 'output' || line.type === 'error' ? applySyntaxHighlighting(line.content) : line.content }} />
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="terminal-input-area">
          <span className="prompt">{sudoMode ? '' : customPrompt}</span>
          <input
            ref={inputRef}
            type={sudoMode ? 'password' : 'text'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="terminal-input"
            placeholder={sudoMode ? '' : "Type 'help' for commands..."}
            autoComplete="off"
            spellCheck="false"
          />
        </form>
        </div>
      </div>
      
      <div className="visual-panel">
        <div className="visual-content">
          <div className="stats-container">
            <div className="stat-item">
                <div className="stat-label">SYSTEM NAME</div>
                <div className="stat-value">PORTFOLIO DYLAN</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">SYSTEM STATUS</div>
              <div className="stat-value">ONLINE</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">CURRENT SECTION</div>
              <div className="stat-value">{currentSection.toUpperCase()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">COMMANDS EXECUTED</div>
              <div className="stat-value">{commandCount}</div>
            </div>
          </div>
        </div>
        
        <div className="visual-content2">
          <div className="activity-status">
            <div className="activity-header">CURRENT ACTIVITY</div>
            <div className="activity-content">
              <div className="status-indicator">
                <span className={`status-dot status-${discordStatus}`}></span>
                <span className="status-text">{discordActivity}</span>
              </div>
              <div className="activity-note">Live from Discord via Lanyard</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
