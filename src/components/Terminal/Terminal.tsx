'use client';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { projectsData, majorProjects, minorProjects, skillsData, contactData, experienceData, learningBacklog } from '@/data/portfolio';
import './Terminal.css';

type Section = 'home' | 'about' | 'projects' | 'contact';
type Subsection = string | null;
type ProjectCategory = 'major' | 'minor';
type PortfolioProject = typeof majorProjects[number];

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
}

const Tetris = dynamic(() => import('@/components/Tetris/Tetris'), {
  ssr: false,
  loading: () => null,
});

const Snake = dynamic(() => import('@/components/Snake/Snake'), {
  ssr: false,
  loading: () => null,
});

const AVAILABLE_COMMANDS = [
  'help', 'clear', 'home', 'about', 'bio', 'skills', 'frameworks',
  'experience', 'projects', 'contact', 'back', 'themes', 'tree',
  'typing', 'sound', 'theme', 'ls', 'cd', 'github', 'linkedin',
  'email', 'instagram', 'npm', 'matrix', 'hack', 'coffee', 'sudo',
  'whoami', 'ping', 'fortune', 'joke', 'secret', 'stats', 'debug', 'prompt', 'crt',
  'neofetch', 'backlog',
  'copy', 'open', 'tetris', 'snake'
] as const;

const buildHomeOutput = (activity: string): string => `  ____            _    __       _ _
 |  _ \\ ___  _ __| |_ / _| ___ | (_) ___
 | |_) / _ \\| '__| __| |_ / _ \\| | |/ _ \\
 |  __/ (_) | |  | |_|  _| (_) | | | (_) |
 |_|   \\___/|_|   \\__|_|  \\___/|_|_|\\___/

PORTFOLIO v2.0

DYLAN VAN DER VEN
Full-Stack Developer & UI/UX Designer
Status: ${activity}

Navigate to:
[1] about    - Learn about me
[2] projects - View my work
[3] contact  - Get in touch`;

const HistoryEntry = memo(function HistoryEntry({ line }: { line: TerminalLine }) {
  return (
    <div className={`history-line ${line.type}`}>
      <pre>{line.content}</pre>
    </div>
  );
});

export default function Terminal() {
  const developerEmail = contactData.find((item) => item.label === 'EMAIL')?.value ?? 'developer@example.com';
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
  const [showTetris, setShowTetris] = useState<boolean>(false);
  const [showSnake, setShowSnake] = useState<boolean>(false);
  const [showFake404, setShowFake404] = useState<boolean>(false);
  const [systemNow, setSystemNow] = useState<Date>(new Date());
  const [cpuLoad, setCpuLoad] = useState<number>(32);
  const [memoryLoad, setMemoryLoad] = useState<number>(46);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gitPushTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Initialize
  /* eslint-disable react-hooks/exhaustive-deps */
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
          content: buildHomeOutput(discordActivity)
        }]);
      };
      
      bootSequence();
    } else {
      // Skip boot sequence if already booted
      setHistory([{
        type: 'output',
        content: buildHomeOutput(discordActivity)
      }]);
    }
    
    // Apply saved theme
    if (currentTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

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

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close();
      }

      gitPushTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      gitPushTimeoutsRef.current = [];
    };
  }, []);

  // Simulated diagnostics ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemNow(new Date());
      setCpuLoad(prev => {
        const next = prev + (Math.random() * 10 - 5);
        return Math.max(8, Math.min(96, Math.round(next)));
      });
      setMemoryLoad(prev => {
        const next = prev + (Math.random() * 8 - 4);
        return Math.max(12, Math.min(92, Math.round(next)));
      });
    }, 1000);

    return () => clearInterval(interval);
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

      const typeNextChar = () => {
        if (currentIndex < content.length) {
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
    callback();
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addOutput(`Copied ${label}: ${text}`);
    } catch {
      addOutput('Failed to copy to clipboard', 'error');
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

  const createProjectSlug = (value: string): string => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const formatTreeBranch = (items: string[], prefix: string): string => {
    if (!items.length) {
      return `${prefix}└── (empty)/`;
    }

    return items
      .map((item, index) => `${prefix}${index === items.length - 1 ? '└──' : '├──'} ${item}/`)
      .join('\n');
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
    let minDistance = Infinity;
    let closestCommand = null;

    for (const cmd of AVAILABLE_COMMANDS) {
      const distance = levenshteinDistance(input.toLowerCase(), cmd.toLowerCase());
      if (distance < minDistance && distance <= 2) {
        minDistance = distance;
        closestCommand = cmd;
      }
    }

    return closestCommand;
  };

  // Play terminal beep sound
  const playBeep = useCallback(() => {
    if (soundEnabled) {
      const audioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!audioContextClass) {
        return;
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new audioContextClass();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        void audioContext.resume();
      }

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
  }, [soundEnabled]);

  // Add output with delay for multi-line content
  const addOutputWithDelay = async (lines: string[]) => {
    for (const line of lines) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addOutput(line);
    }
  };

  const runGitPushPrank = () => {
    if (showFake404) {
      return;
    }

    const clearPrankTimeouts = () => {
      gitPushTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      gitPushTimeoutsRef.current = [];
    };

    clearPrankTimeouts();

    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);
    const withJitter = (base: number, jitter: number) => base + randomInt(-jitter, jitter);

    const objectCount = randomInt(8, 34);
    const compressedCount = Math.max(2, Math.floor(objectCount * (Math.random() * 0.35 + 0.35)));
    const writtenCount = Math.max(3, objectCount - randomInt(1, 6));
    const payloadKiB = randomFloat(0.88, 5.6);
    const transferRate = randomFloat(0.82, 9.75);
    const deltaCount = Math.max(1, Math.floor(writtenCount * (Math.random() * 0.6 + 0.15)));
    const rejectionReasons = ['fetch first', 'non-fast-forward', 'remote contains work that you do not have locally'];
    const rejectionReason = rejectionReasons[randomInt(0, rejectionReasons.length - 1)];
    const remoteFormats = [
      'github.com:Dylan-Ven/portfolio_v2.git',
      'git@github.com:Dylan-Ven/portfolio_v2.git',
      'https://github.com/Dylan-Ven/portfolio_v2.git',
      'ssh://git@github.com/Dylan-Ven/portfolio_v2.git',
    ];
    const selectedRemote = remoteFormats[randomInt(0, remoteFormats.length - 1)];

    const baseTimeline = {
      enumerate: 900,
      count: 1700,
      compress: 2450,
      write: 3200,
      total: 3950,
      remote: 4600,
      reject: 5400,
      panic: 6500,
      show404: 7600,
      reset: 22000,
    };

    const timeline = {
      enumerate: withJitter(baseTimeline.enumerate, 120),
      count: withJitter(baseTimeline.count, 140),
      compress: withJitter(baseTimeline.compress, 160),
      write: withJitter(baseTimeline.write, 180),
      total: withJitter(baseTimeline.total, 200),
      remote: withJitter(baseTimeline.remote, 220),
      reject: withJitter(baseTimeline.reject, 260),
      panic: withJitter(baseTimeline.panic, 320),
      show404: withJitter(baseTimeline.show404, 320),
      reset: withJitter(baseTimeline.reset, 600),
    };

    addOutput('Pushing to main..');

    const enumerateTimeout = setTimeout(() => {
      addOutput(`Enumerating objects: ${objectCount}, done.`);
    }, timeline.enumerate);

    const countingTimeout = setTimeout(() => {
      addOutput(`Counting objects: 100% (${objectCount}/${objectCount}), done.`);
    }, timeline.count);

    const compressTimeout = setTimeout(() => {
      addOutput(`Compressing objects: 100% (${compressedCount}/${compressedCount}), done.`);
    }, timeline.compress);

    const writingTimeout = setTimeout(() => {
      addOutput(`Writing objects: 100% (${writtenCount}/${writtenCount}), ${payloadKiB} KiB | ${transferRate} MiB/s, done.`);
    }, timeline.write);

    const totalTimeout = setTimeout(() => {
      addOutput(`Total ${writtenCount} (delta ${deltaCount}), reused 0 (delta 0), pack-reused 0`);
    }, timeline.total);

    const remoteTimeout = setTimeout(() => {
      addOutput(`To ${selectedRemote}`);
    }, timeline.remote);

    const rejectTimeout = setTimeout(() => {
      addOutput(` ! [rejected]        main -> main (${rejectionReason})`, 'error');
    }, timeline.reject);

    const panicTimeout = setTimeout(() => {
      addOutput('What have you done?!', 'error');
    }, timeline.panic);

    const show404Timeout = setTimeout(() => {
      setShowFake404(true);
    }, timeline.show404);

    const resetTimeout = setTimeout(() => {
      setShowFake404(false);
      clearPrankTimeouts();
    }, timeline.reset);

    gitPushTimeoutsRef.current = [
      enumerateTimeout,
      countingTimeout,
      compressTimeout,
      writingTimeout,
      totalTimeout,
      remoteTimeout,
      rejectTimeout,
      panicTimeout,
      show404Timeout,
      resetTimeout,
    ];
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
      newMap.set(trimmedCmd, (newMap.get(trimmedCmd) || 0) + 1);
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
  neofetch   - Show system profile panel
  backlog    - Show current learning backlog
  backlog next/focus/done - Filter learning backlog
  debug on/off - Toggle debug mode
  prompt set <text> - Set custom prompt
  prompt reset - Reset prompt to default
  git push   - Push current branch to remote
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
  cd projects/<slug> - Open specific project directly
  cd ..      - Alias for 'back'
  
  EASTER EGGS: Try 'matrix', 'hack', 'coffee', 'sudo', 'whoami', 'ping', 'fortune', 'joke', 'secret'
  GAMES: 'tetris', 'snake'
  
  GAMES: 'tetris' or 'play tetris'
  
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
          addOutput(buildHomeOutput(discordActivity));
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
          const frontendList = skillsData.frontend.map((s) => s.name).join(', ');
          const backendList = skillsData.backend.map((s) => s.name).join(', ');
          const toolsList = skillsData.tools.map((s) => s.name).join(', ');
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
          const experienceOutput = experienceData.map((exp) => {
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
        addOutput(`${directoryTreeText}

      Use: cd <section> to navigate
      Use: cd projects/<slug> to open a project directly`);
        break;

      case 'git push':
      case 'git push origin main':
        runGitPushPrank();
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

          const openProjectBySlug = (slug: string, category?: 'major' | 'minor') => {
            if (category) {
              const projectList = category === 'major' ? majorProjects : minorProjects;
              const scopedIndex = projectList.findIndex((project) => createProjectSlug(project.name) === slug);
              if (scopedIndex !== -1) {
                openProjectDetails(category, scopedIndex);
                return true;
              }
              return false;
            }

            const majorIndex = majorProjects.findIndex((project) => createProjectSlug(project.name) === slug);
            if (majorIndex !== -1) {
              openProjectDetails('major', majorIndex);
              return true;
            }

            const minorIndex = minorProjects.findIndex((project) => createProjectSlug(project.name) === slug);
            if (minorIndex !== -1) {
              openProjectDetails('minor', minorIndex);
              return true;
            }

            return false;
          };

          const triggerResumeDownload = () => {
            addOutput(`📦 Installing resume...
⠋ Downloading Dylan_van_der_Ven_Resume.pdf
✓ Resume downloaded successfully!

Check your downloads folder.`);

            const link = document.createElement('a');
            link.href = '/resume/Dylan_van_der_Ven_Resume.pdf';
            link.download = 'Dylan_van_der_Ven_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };

          const openContactByPath = (contactPath: string): boolean => {
            const key = contactPath.replace(/\.link$/i, '');
            const contact = contactData.find((item) => item.label.toLowerCase() === key);
            if (!contact) {
              return false;
            }

            if (contact.link && contact.link !== '#') {
              addOutput(`Opening ${key}...`);
              window.open(contact.link, '_blank');
            } else {
              handleCopy(contact.value, contact.label);
            }
            return true;
          };

          const normalizedTarget = target
            .replace(/\/+/g, '/')
            .replace(/\/$/, '');

          const resolvePathParts = (pathValue: string): string[] => {
            const baseParts = pathValue.startsWith('/') ? [] : currentVirtualPathParts;
            const incomingParts = pathValue.replace(/^\/+/, '').split('/').filter(Boolean);
            const stack = [...baseParts];

            for (const part of incomingParts) {
              if (part === '.') {
                continue;
              }

              if (part === '..') {
                if (stack.length > 0) {
                  stack.pop();
                }
                continue;
              }

              stack.push(part);
            }

            return stack;
          };

          const navigateToResolvedPath = (resolvedParts: string[]): boolean => {
            if (resolvedParts.length === 0) {
              executeCommand('home');
              return true;
            }

            if (resolvedParts[0] === 'public') {
              if (resolvedParts.length === 1 || (resolvedParts.length === 2 && resolvedParts[1] === 'portfolio.html')) {
                addOutput('Opening portfolio home page...');
                window.open('/', '_blank');
                return true;
              }
              return false;
            }

            if (resolvedParts[0] !== 'home') {
              return false;
            }

            if (resolvedParts.length === 1) {
              executeCommand('home');
              return true;
            }

            if (resolvedParts[1] !== 'dylan') {
              return false;
            }

            const localParts = resolvedParts.slice(2);

            if (localParts.length === 0) {
              executeCommand('home');
              return true;
            }

            const [section, second, third] = localParts;

            if (section === 'about') {
              if (!second) {
                executeCommand('about');
                return true;
              }

              const aboutMapping: Record<string, 'bio' | 'skills' | 'frameworks' | 'experience'> = {
                bio: 'bio',
                'bio.txt': 'bio',
                skills: 'skills',
                'skills.json': 'skills',
                frameworks: 'frameworks',
                'frameworks.md': 'frameworks',
                experience: 'experience',
              };

              const command = aboutMapping[second];
              if (!command) {
                return false;
              }

              executeCommand('about');
              setTimeout(() => executeCommand(command), 0);
              return true;
            }

            if (section === 'projects') {
              if (!second) {
                executeCommand('projects');
                return true;
              }

              if (second === 'major' || second === 'minor') {
                if (!third) {
                  executeCommand('projects');
                  setTimeout(() => executeCommand(second), 0);
                  return true;
                }

                if (openProjectBySlug(third, second)) {
                  return true;
                }
                return false;
              }

              if (openProjectBySlug(second)) {
                return true;
              }

              return false;
            }

            if (section === 'contact') {
              if (!second) {
                executeCommand('contact');
                return true;
              }
              return openContactByPath(second);
            }

            if (section === 'resume') {
              if (!second || second === 'dylan_van_der_ven_resume.pdf') {
                triggerResumeDownload();
                return true;
              }
              return false;
            }

            return false;
          };

          if (normalizedTarget === '' || normalizedTarget === '/') {
            executeCommand('home');
            return;
          }

          const resolvedParts = resolvePathParts(target);
          if (navigateToResolvedPath(resolvedParts)) {
            return;
          }

          const fallbackSections = ['home', 'about', 'projects', 'contact'];
          if (fallbackSections.includes(normalizedTarget)) {
            executeCommand(normalizedTarget);
            return;
          }

          addOutput(`cd: ${target}: No such file or directory`, 'error');
          return;
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
          link.href = '/resume/CV-Dylan.pdf';
          link.download = 'CV-Dylan.pdf';
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

        if (trimmedCmd === 'play tetris' || trimmedCmd === 'tetris') {
          addOutput('Launching Tetris...');
          setTimeout(() => setShowTetris(true), 500);
          return;
        }

        if (trimmedCmd === 'play snake' || trimmedCmd === 'snake') {
          addOutput('Launching Snake...');
          setTimeout(() => setShowSnake(true), 500);
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

        if (trimmedCmd === 'neofetch') {
          const sessionMinutes = Math.max(1, Math.floor((Date.now() - sessionStart) / 60000));
          addOutput(` _   _  ____ _____
| \\ | |/ ___|_   _|  OS: NST.v2 (NiSuTe Kernel)
|  \\| |\\___ \\ | |    Host: Dylan's Portfolio
| |\\  | ___) || |    Uptime: ${sessionMinutes} mins
|_| \\_|____/ |_|     Shell: dsh (dylan-sh)
                     Theme: ${currentTheme}
                     Discord: ${discordActivity}`);
          return;
        }

        if (trimmedCmd === 'backlog' || trimmedCmd.startsWith('backlog ')) {
          const subcommand = trimmedCmd.split(' ')[1] ?? 'all';
          const statusIcon: Record<'learning' | 'building' | 'researching' | 'done', string> = {
            learning: '📚',
            building: '🛠',
            researching: '🔍',
            done: '✅',
          };

          const formatBacklogItem = (item: typeof learningBacklog[number]) => {
            return `[${item.id}] ${statusIcon[item.status]} ${item.topic}\n    Status: ${item.status.toUpperCase()} | Priority: ${item.priority.toUpperCase()} | ETA: ${item.eta}\n    Focus: ${item.focus}`;
          };

          let filteredItems = learningBacklog;
          let title = 'LEARNING BACKLOG';

          if (subcommand === 'next') {
            const nextItem = learningBacklog.find((item) => item.status !== 'done');
            filteredItems = nextItem ? [nextItem] : [];
            title = 'BACKLOG - NEXT UP';
          } else if (subcommand === 'focus') {
            filteredItems = learningBacklog.filter((item) => item.priority === 'high' && item.status !== 'done');
            title = 'BACKLOG - CURRENT FOCUS';
          } else if (subcommand === 'done') {
            filteredItems = learningBacklog.filter((item) => item.status === 'done');
            title = 'BACKLOG - COMPLETED';
          } else if (subcommand !== 'all') {
            addOutput(`Invalid backlog option: ${subcommand}\nUse: backlog | backlog next | backlog focus | backlog done`, 'error');
            return;
          }

          if (filteredItems.length === 0) {
            addOutput(`${title}\n\nNo items found for this filter.`, 'error');
            return;
          }

          const output = filteredItems.map(formatBacklogItem).join('\n\n');
          addOutput(`${title}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${output}`);
          return;
        }

        // Debug mode
        if (trimmedCmd === 'debug on') {
          if (debugMode) {
            addOutput('⚠ Debug mode is already enabled', 'error');
            return;
          }
          setDebugMode(true);
          const performanceMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
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
Memory: ${performanceMemory ? (performanceMemory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' : 'N/A'}
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

  const openProjectDetails = (category: ProjectCategory, projectIndex: number) => {
    const projectList = category === 'major' ? majorProjects : minorProjects;
    const project = projectList[projectIndex];

    if (!project) {
      addOutput('Project not found', 'error');
      return;
    }

    setCurrentSection('projects');
    setCurrentSubsection(`${category}-project-${projectIndex + 1}`);
    clearHistory();

    const commands = [
      project.link ? '[1] github - Open GitHub repository' : '',
      project.webapp ? '[2] webapp - Open live application' : ''
    ].filter(Boolean).join('\n');

    const commandsSection = commands ? `\n\nCommands:\n${commands}` : '';

    addOutput(`PROJECT: ${project.name}

Description: ${project.description}
Technologies: ${project.tech.join(', ')}
Status: ● ${project.status}${project.link ? `\nGitHub: ${project.link}` : ''}${project.webapp ? `\nLive: ${project.webapp}` : ''}${commandsSection}

Type 'back' to return`);
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
        const frontendList = skillsData.frontend.map((s) => s.name).join(', ');
        const backendList = skillsData.backend.map((s) => s.name).join(', ');
        const toolsList = skillsData.tools.map((s) => s.name).join(', ');
        addOutput(`FRAMEWORKS & LIBRARIES

Frontend: ${frontendList}
Backend: ${backendList}
Tools: ${toolsList}

Type 'back' to return`);
      } else if (num === 4) {
        setCurrentSubsection('experience');
        clearHistory();
        const experienceOutput = experienceData.map((exp) => {
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
          openProjectDetails(currentSubsection, num - 1);
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
    if (window.innerWidth > 768 && !showTetris && !showSnake) {
      inputRef.current?.focus();
    }
  }, [showTetris, showSnake]);
  
  const handleLayoutClick = () => {
    // Only focus input on desktop, not on mobile, and not when games are open
    if (window.innerWidth > 768 && !showTetris && !showSnake) {
      inputRef.current?.focus();
    }
  };

  const selectedProject = useMemo<{ category: ProjectCategory; index: number; project: PortfolioProject } | null>(() => {
    if (!currentSubsection || !currentSubsection.includes('-project-')) {
      return null;
    }

    const [category, , projectNumStr] = currentSubsection.split('-');
    if (category !== 'major' && category !== 'minor') {
      return null;
    }

    const index = parseInt(projectNumStr, 10) - 1;
    const projectList = category === 'major' ? majorProjects : minorProjects;
    const project = projectList[index];

    if (!project) {
      return null;
    }

    return { category, index, project };
  }, [currentSubsection]);
  const sessionSeconds = Math.floor((systemNow.getTime() - sessionStart) / 1000);
  const uptimeMinutes = Math.floor(sessionSeconds / 60);
  const uptimeRemainderSeconds = sessionSeconds % 60;
  const currentClock = systemNow.toLocaleTimeString('en-GB', { hour12: false });
  const majorProjectSlugs = useMemo(
    () => majorProjects.map((project) => createProjectSlug(project.name)),
    []
  );
  const minorProjectSlugs = useMemo(
    () => minorProjects.map((project) => createProjectSlug(project.name)),
    []
  );
  const currentVirtualPathParts = useMemo(() => {
    if (selectedProject) {
      return ['home', 'dylan', 'projects', selectedProject.category, createProjectSlug(selectedProject.project.name)];
    }

    if (currentSection === 'home') {
      return ['home', 'dylan'];
    }

    if (currentSection === 'about') {
      if (currentSubsection === 'bio') return ['home', 'dylan', 'about', 'bio.txt'];
      if (currentSubsection === 'skills') return ['home', 'dylan', 'about', 'skills.json'];
      if (currentSubsection === 'frameworks') return ['home', 'dylan', 'about', 'frameworks.md'];
      if (currentSubsection === 'experience') return ['home', 'dylan', 'about', 'experience'];
      return ['home', 'dylan', 'about'];
    }

    if (currentSection === 'projects') {
      if (currentSubsection === 'major') return ['home', 'dylan', 'projects', 'major'];
      if (currentSubsection === 'minor') return ['home', 'dylan', 'projects', 'minor'];
      return ['home', 'dylan', 'projects'];
    }

    if (currentSection === 'contact') {
      return ['home', 'dylan', 'contact'];
    }

    return ['home', 'dylan'];
  }, [currentSection, currentSubsection, selectedProject]);

  const activeTreeNode = useMemo(() => {
    if (selectedProject) {
      return `${createProjectSlug(selectedProject.project.name)}/`;
    }

    if (currentSection === 'about') {
      if (currentSubsection === 'bio') return 'bio.txt';
      if (currentSubsection === 'skills') return 'skills.json';
      if (currentSubsection === 'frameworks') return 'frameworks.md';
    }

    if (currentSection === 'projects') {
      if (currentSubsection === 'major') return 'major/';
      if (currentSubsection === 'minor') return 'minor/';
    }

    return `${currentSection}/`;
  }, [currentSection, currentSubsection, selectedProject]);
  const directoryTreeText = useMemo(() => `/
├── home/
│   └── dylan/
│       ├── about/
│       │   ├── bio.txt
│       │   ├── skills.json
│       │   └── frameworks.md
│       ├── projects/
│       │   ├── major/
${formatTreeBranch(majorProjectSlugs, '│       │   │   ')}
│       │   └── minor/
${formatTreeBranch(minorProjectSlugs, '│       │       ')}
│       ├── contact/
│       │   ├── email.link
│       │   ├── github.link
│       │   ├── linkedin.link
│       │   └── instagram.link
│       └── resume/
│           └── Dylan_van_der_Ven_Resume.pdf (installable)
└── public/
    └── portfolio.html`, [majorProjectSlugs, minorProjectSlugs]);

  const directoryTreeHtml = useMemo(() => {
    const escapedTreeNode = activeTreeNode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return directoryTreeText.replace(
      new RegExp(escapedTreeNode),
      `<span class="directory-active">${activeTreeNode}</span>`
    );
  }, [activeTreeNode, directoryTreeText]);

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
            <HistoryEntry key={index} line={line} />
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
            disabled={showTetris || showSnake || showFake404}
          />
        </form>
        </div>
      </div>
      
      <div className="visual-panel">
        <div className="visual-content diagnostics-panel">
          <div className="diag-row"><span>Current Time: </span><strong>{currentClock}</strong></div>
          <div className="diag-row"><span>Section: </span><strong>{currentSection.toUpperCase()}</strong></div>
          <div className="diag-row"><span>Commands: </span><strong>{commandCount}</strong></div>
        </div>

        <div className="visual-content directory-panel">
          <pre className="directory-tree" dangerouslySetInnerHTML={{ __html: directoryTreeHtml }} />
        </div>
        <div className="visual-content load-panel">
          <div className="diag-row"><span>Uptime </span><strong>{uptimeMinutes}m {uptimeRemainderSeconds}s</strong></div>
          <div className="load-row"><span>CPU</span><span>{cpuLoad}%</span></div>
          <div className="load-bar"><div className="load-fill" style={{ width: `${cpuLoad}%` }} /></div>
          <div className="load-row"><span>Memory</span><span>{memoryLoad}%</span></div>
          <div className="load-bar"><div className="load-fill memory" style={{ width: `${memoryLoad}%` }} /></div>
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

      {showFake404 && (
        <div className="fake-404-screen" role="alert" aria-live="assertive">
          <div className="fake-404-content">
            <h1>404 | Page not found</h1>
            <p>Contact the developer at: <a href={`mailto:${developerEmail}`}>{developerEmail}</a></p>
          </div>
        </div>
      )}
      
      {showTetris && <Tetris onClose={() => setShowTetris(false)} />}
      {showSnake && <Snake onClose={() => setShowSnake(false)} />}
    </div>
  );
}
