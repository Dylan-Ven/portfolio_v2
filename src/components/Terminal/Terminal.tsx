'use client';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { projectsData, majorProjects, minorProjects, skillsData, contactData, experienceData, learningBacklog } from '@/data/portfolio';
import { AVAILABLE_COMMANDS, VALID_THEMES, normalizeCommandInput, resolveExactCommand, sanitizeCommandInput, type ExactCommandId } from './commandCatalog';
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

const generateSecureUUID = (): string => {
  const cryptoApi = globalThis.crypto;

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

const buildBootSequence = (): string[] => {
  const serverNumber = Math.floor(Math.random() * 25) + 1;
  const biosVersion = `RBIOS-4.02.08.${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`;
  const memorySize = [32, 64, 128, 256][Math.floor(Math.random() * 4)];
  const rootCode = Math.floor(Math.random() * 9000) + 1000;
  const serialCode = `52EE5.E${Math.floor(Math.random() * 9) + 1}.E${Math.floor(Math.random() * 9) + 1}`;
  const fakeUUID = generateSecureUUID();

  return [
    'NST.v2 // NiSuTe SYSTEMS ARCHITECTURE',
    `[NODE: ${serverNumber}]`,
    `>UUID: ${fakeUUID}`,
    'PROPERTY OF NISUTE EUROPE MEDIA LABS // EST. 199X',
    '',
    '> QUERY CONSOLE /SYNC',
    '',
    'NST-M800 "LENSMASTER"',
    '',
    '> GRANT PERM /LEVEL:ROOT /USER:ADMIN',
    'Logic-Gate: OPEN. [RWED] privileges assigned to ADMIN.',
    '',
    '> ABORT RECOVERY /STATE:HOLD',
    'Automatic reboot cicles: SUSPENDED. System in static state. Awaiting further instructions.',
    '',
    'NIS-TECH FIRMWARE (c) 2201-2203',
    `CORE-BUILD: ${biosVersion} // UNIT: ${serialCode}`,
    `UPPER-STACK: ${memorySize} GB`,
    `IDENT: ${rootCode}`,
    'STATUS: [MAINTENANCE OVERRIDE ACTIVE]',
    '!! NOTICE: DIRECT DATA-STREAM ACCESS ACTIVE. PARITY CHECKS DISABLED. !!',
    '',
    '> LAUNCH TRACE /MAP:ACCOUNTS.F',
    'Scrubbing Bit-Map...',
    'Injecting Override...',
    'Console Ready.',
  ];
};

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
  const [isBooting, setIsBooting] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
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
  const [discordActivity, setDiscordActivity] = useState<string>('Online');
  const [discordStatus, setDiscordStatus] = useState<'online' | 'idle' | 'dnd' | 'offline'>('online');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [sudoMode, setSudoMode] = useState<boolean>(false);
  const [showTetris, setShowTetris] = useState<boolean>(false);
  const [showSnake, setShowSnake] = useState<boolean>(false);
  const [showFake404, setShowFake404] = useState<boolean>(false);
  const [showTreePanel, setShowTreePanel] = useState<boolean>(false);
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

    let cancelled = false;

    const bootSequence = async () => {
      const bootMessages = buildBootSequence();
      const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 768;

      const baseLineDelay = isMobileViewport ? 95 : 170;
      const commandDelay = isMobileViewport ? 140 : 260;
      const statusDelay = isMobileViewport ? 115 : 200;
      const blankLineDelay = isMobileViewport ? 180 : 320;
      const dramaticDelay = isMobileViewport ? 220 : 380;

      const withJitter = (value: number, spread: number) => {
        const offset = Math.floor(Math.random() * (spread * 2 + 1)) - spread;
        return Math.max(40, value + offset);
      };

      const getDelayForLine = (line: string) => {
        if (!line.trim()) {
          return withJitter(blankLineDelay, isMobileViewport ? 20 : 35);
        }

        if (line.startsWith('>')) {
          return withJitter(commandDelay, isMobileViewport ? 18 : 30);
        }

        if (line.includes('NOTICE') || line.includes('MAINTENANCE') || line.includes('Console Ready')) {
          return withJitter(dramaticDelay, isMobileViewport ? 24 : 40);
        }

        if (line.includes('...')) {
          return withJitter(statusDelay, isMobileViewport ? 16 : 26);
        }

        return withJitter(baseLineDelay, isMobileViewport ? 14 : 24);
      };
      
      const tempHistory: TerminalLine[] = [];
      for (const msg of bootMessages) {
        await new Promise(resolve => setTimeout(resolve, getDelayForLine(msg)));
        if (cancelled) {
          return;
        }
        tempHistory.push({ type: 'output', content: msg });
        setHistory([...tempHistory]);
      }
      
      await new Promise(resolve => setTimeout(resolve, isMobileViewport ? 260 : 520));
      if (cancelled) {
        return;
      }
      setIsBooting(false);

      // Clear boot output before pushing homescreen
      setHistory([]);
      await new Promise(resolve => setTimeout(resolve, 80));
      if (cancelled) {
        return;
      }
      
      // Show home content after boot
      setHistory([{ type: 'output', content: buildHomeOutput(discordActivity) }]);
    };

    bootSequence();
    
    // Apply saved theme
    if (currentTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }

    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    setHasHydrated(true);
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
      const directUrl = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;
      const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;

      try {
        const candidateUrls = process.env.NODE_ENV === 'development'
          ? [proxiedUrl, directUrl]
          : [directUrl, proxiedUrl];

        let data: unknown = null;

        for (const url of candidateUrls) {
          try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
              continue;
            }

            data = await response.json();
            break;
          } catch {
            continue;
          }
        }

        if (!data || typeof data !== 'object') {
          return;
        }

        const parsedData = data as {
          success?: boolean;
          data?: {
            discord_status?: 'online' | 'idle' | 'dnd' | 'offline';
            activities?: Array<{ type?: number; name?: string; details?: string; state?: string }>;
            listening_to_spotify?: boolean;
            spotify?: { song?: string; artist?: string };
          };
        };

        if (parsedData.success && parsedData.data) {
          const { discord_status, activities, listening_to_spotify } = parsedData.data;
          
          // Update status
          setDiscordStatus(discord_status ?? 'online');
          
          // Show Lanyard values directly (no friendly remapping)
          if (listening_to_spotify && parsedData.data.spotify) {
            const song = parsedData.data.spotify.song ?? '';
            const artist = parsedData.data.spotify.artist ?? '';
            const spotifyText = [song, artist].filter(Boolean).join(' — ');
            setDiscordActivity(spotifyText || 'spotify');
            return;
          }

          if (activities && activities.length > 0) {
            const activity = activities[0];
            const rawText = [activity.name, activity.details, activity.state]
              .filter((value): value is string => Boolean(value && value.trim().length > 0))
              .join(' | ');
            setDiscordActivity(rawText || (discord_status ?? 'offline'));
            return;
          }

          setDiscordActivity(discord_status ?? 'offline');
        }
      } catch (error) {
        console.error('Failed to fetch Discord activity:', error);
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

  const getHelpOutput = (): string => {
    const globalCommands = [
      'GLOBAL COMMANDS:',
      '  help       - Show commands for this section',
      '  clear      - Clear terminal output',
      '  home       - Go to home section',
      '  about      - Go to about section',
      '  projects   - Go to projects section',
      '  contact    - Go to contact section',
      '  stats      - Show session statistics',
      '  neofetch   - Show system profile panel',
      '  backlog    - Show current learning backlog',
      '  backlog next/focus/done - Filter learning backlog',
      '  debug on/off - Toggle debug mode',
      '  prompt set <text> - Set custom prompt',
      '  prompt reset - Reset prompt to default',
      '  git push   - Push current branch to remote',
      '  npm install resume - Download resume',
      '  npm i resume       - Download resume (shorthand)',
      '  typing on/off - Toggle typing effect animation',
      '  theme <name> - Change color theme',
      '  themes     - List all available themes',
      '  sound on/off - Toggle terminal sound effects',
      '  crt on/off - Toggle CRT screen effect',
      '  tree       - Display directory structure',
      '  ls         - Alias for projects',
      '  cd <section|path> - Navigate virtual sections/paths',
      '  tetris     - Launch Tetris',
      '  snake      - Launch Snake',
      '',
      'EASTER EGGS:',
      "  matrix, hack, coffee, sudo, whoami, ping, fortune, joke, secret",
    ];

    const sectionCommands: string[] = [];

    if (currentSection === 'home') {
      sectionCommands.push(
        'SECTION COMMANDS (HOME):',
        '  [1] / about    - Open about section',
        '  [2] / projects - Open projects section',
        '  [3] / contact  - Open contact section',
      );
    }

    if (currentSection === 'about') {
      sectionCommands.push('SECTION COMMANDS (ABOUT):');

      if (!currentSubsection) {
        sectionCommands.push(
          '  bio        - View biography',
          '  skills     - View technical skills',
          '  frameworks - View frameworks & libraries',
          '  experience - View work experience',
          '  [1-4]      - Use number shortcuts',
        );
      } else {
        sectionCommands.push(
          `  Current subsection: ${currentSubsection}`,
          '  back       - Return to about menu',
        );
      }
    }

    if (currentSection === 'projects') {
      sectionCommands.push('SECTION COMMANDS (PROJECTS):');

      if (!currentSubsection) {
        sectionCommands.push(
          '  major      - View major projects',
          '  minor      - View minor projects',
          '  [1-2]      - Use number shortcuts',
        );
      } else if (currentSubsection === 'major' || currentSubsection === 'minor') {
        const projectList = currentSubsection === 'major' ? majorProjects : minorProjects;
        sectionCommands.push(
          `  Current category: ${currentSubsection}`,
          `  [1-${projectList.length}] - Open a project`,
          '  back       - Return to project categories',
        );
      } else if (currentSubsection.includes('-project-')) {
        const [category, , projectNumStr] = currentSubsection.split('-');
        const projectList = category === 'major' ? majorProjects : minorProjects;
        const project = projectList[parseInt(projectNumStr, 10) - 1];

        sectionCommands.push('  back       - Return to the project list');

        if (project?.link) {
          sectionCommands.push('  github     - Open GitHub repository');
        }

        if (project?.webapp) {
          sectionCommands.push('  webapp     - Open live application');
        }
      }
    }

    if (currentSection === 'contact') {
      sectionCommands.push(
        'SECTION COMMANDS (CONTACT):',
        '  github     - Open GitHub profile',
        '  linkedin   - Open LinkedIn profile',
        '  email      - Open email client',
        '  instagram  - Open Instagram profile',
        `  [1-${contactData.length}]      - Copy contact info`,
      );
    }

    return [...globalCommands, '', ...sectionCommands].join('\n');
  };

  const createProjectSlug = (value: string): string => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const formatTreeBranch = (items: string[], prefix: string): string[] => {
    if (!items.length) {
      return [`${prefix}└── (empty)/`];
    }

    return items.map((item, index) => `${prefix}${index === items.length - 1 ? '└──' : '├──'} ${item}/`);
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

  const showAboutOverview = () => {
    clearHistory();
    showAboutMenu();
    addOutput(`ABOUT DYLAN VAN DER VEN

[1] bio        - About me
[2] skills     - Technical skills (with levels)
[3] frameworks - Frameworks & libraries
[4] experience - Work history & timeline

Type a number or command to view`);
  };

  const showBioContent = () => {
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
  };

  const showSkillsContent = () => {
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
  };

  const showFrameworksContent = () => {
    setCurrentSubsection('frameworks');
    clearHistory();
    const frontendList = skillsData.frontend.map((skill) => skill.name).join(', ');
    const backendList = skillsData.backend.map((skill) => skill.name).join(', ');
    const toolsList = skillsData.tools.map((skill) => skill.name).join(', ');
    addOutput(`FRAMEWORKS & LIBRARIES

Frontend: ${frontendList}
Backend: ${backendList}
Tools: ${toolsList}

Type 'back' to return`);
  };

  const showExperienceContent = () => {
    setCurrentSubsection('experience');
    clearHistory();
    const experienceOutput = experienceData.map((experience) => {
      const descriptions = experience.description.map((description) => `    • ${description}`).join('\n');
      const techStack = `    Tech: ${experience.tech.join(', ')}`;
      return `
[█] ${experience.title}
    ${experience.company} | ${experience.location}
    ${experience.period}

${descriptions}
${techStack}`;
    }).join('\n\n');

    addOutput(`WORK EXPERIENCE${experienceOutput}\n\nType 'back' to return`);
  };

  const showProjectsOverview = () => {
    clearHistory();
    showProjectsMenu();
    addOutput(`PROJECTS

[1] major   - Major projects (${majorProjects.length})
[2] minor   - Minor projects (${minorProjects.length})

Type a number or 'major'/'minor' to view category`);
  };

  const showProjectsAliasListing = () => {
    clearHistory();
    setCurrentSection('projects');
    setCurrentSubsection(null);
    const projectsList = projectsData.map((project, index) =>
      `[${index + 1}] ${project.name} - ${project.description}`
    ).join('\n');
    addOutput(`PROJECTS\n\n${projectsList}\n\nType a number (1-${projectsData.length}) to view details`);
  };

  const showMajorProjectsList = () => {
    if (currentSection !== 'projects') {
      addOutput('undefined', 'error');
      return;
    }

    setCurrentSubsection('major');
    clearHistory();
    const majorList = majorProjects.map((project, index) => `[${index + 1}] ${project.name}`).join('\n');
    addOutput(`MAJOR PROJECTS\n\n${majorList}\n\nType a number (1-${majorProjects.length}) to view details`);
  };

  const showMinorProjectsList = () => {
    if (currentSection !== 'projects') {
      addOutput('undefined', 'error');
      return;
    }

    setCurrentSubsection('minor');
    clearHistory();
    const minorList = minorProjects.map((project, index) => `[${index + 1}] ${project.name}`).join('\n');
    addOutput(`MINOR PROJECTS\n\n${minorList}\n\nType a number (1-${minorProjects.length}) to view details`);
  };

  const showContactOverview = () => {
    clearHistory();
    showContactMenu();
    const contactOutput = contactData.map((contact, index) => {
      let line = `[${index + 1}] ${contact.label.padEnd(10)} ${contact.value}`;
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
  };

  const applyThemePreference = (themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem('terminal-theme', themeName);

    if (themeName === 'default') {
      document.documentElement.removeAttribute('data-theme');
      return;
    }

    document.documentElement.setAttribute('data-theme', themeName);
  };

  const setTypingPreference = (enabled: boolean) => {
    if (typingEffect === enabled) {
      addOutput(`⚠ Typing effect is already ${enabled ? 'enabled' : 'disabled'}`, 'error');
      return;
    }

    setTypingEffect(enabled);
    localStorage.setItem('terminal-typing-effect', String(enabled));
    addOutput(`✓ Typing effect ${enabled ? 'enabled' : 'disabled'}`);
  };

  const setSoundPreference = (enabled: boolean) => {
    if (soundEnabled === enabled) {
      addOutput(`⚠ Terminal sounds are already ${enabled ? 'enabled' : 'disabled'}`, 'error');
      return;
    }

    setSoundEnabled(enabled);
    localStorage.setItem('terminal-sound', String(enabled));
    addOutput(`✓ Terminal sounds ${enabled ? 'enabled 🔊' : 'disabled 🔇'}`);

    if (enabled) {
      playBeep();
    }
  };

  const setCrtPreference = (enabled: boolean) => {
    if (crtEffect === enabled) {
      addOutput(`⚠ CRT screen effect is already ${enabled ? 'enabled' : 'disabled'}`, 'error');
      return;
    }

    setCrtEffect(enabled);
    addOutput(`✓ CRT screen effect ${enabled ? 'enabled 📺' : 'disabled'}`);
  };

  const showThemesOutput = () => {
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
  };

  const toggleTreePanel = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile) {
      addOutput(directoryTreeText);
      return;
    }
    const nextShowTreePanel = !showTreePanel;
    setShowTreePanel(nextShowTreePanel);
    addOutput(nextShowTreePanel ? 'Tree panel enabled. Type tree again to hide.' : 'Tree panel hidden.');
  };

  const launchTetris = () => {
    addOutput('Launching Tetris...');
    setTimeout(() => setShowTetris(true), 500);
  };

  const launchSnake = () => {
    addOutput('Launching Snake...');
    setTimeout(() => setShowSnake(true), 500);
  };

  const showStatsOutput = () => {
    const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);
    const minutes = Math.floor(sessionTime / 60);
    const seconds = sessionTime % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    const mostUsedCmd = Array.from(commandFrequency.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const sectionsStr = Array.from(sectionsVisited).join(', ');

    addOutput(`SESSION STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session Time:      ${timeStr}
Commands Run:       ${commandCount}
Sections Visited:  ${sectionsVisited.size} (${sectionsStr})
Most Used Command: ${mostUsedCmd ? `${mostUsedCmd[0]} (${mostUsedCmd[1]}x)` : 'N/A'}
Commands in History: ${commandHistory.length}

Keep exploring!`);
  };

  const showNeofetchOutput = () => {
    const sessionMinutes = Math.max(1, Math.floor((Date.now() - sessionStart) / 60000));
    addOutput(` _   _  ____ _____
| \\ | |/ ___|_   _|  OS: NST.v2 (NiSuTe Kernel)
|  \\| |\\___ \\ | |    Host: Dylan's Portfolio
| |\\  | ___) || |    Uptime: ${sessionMinutes} mins
|_| \\_|____/ |_|     Shell: dsh (dylan-sh)
                     Theme: ${currentTheme}
                     Discord: ${discordActivity}`);
  };

  const showBacklogOutput = (subcommand: string = 'all') => {
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
  };

  const setDebugPreference = (enabled: boolean) => {
    if (debugMode === enabled) {
      addOutput(`⚠ Debug mode is already ${enabled ? 'enabled' : 'disabled'}`, 'error');
      return;
    }

    setDebugMode(enabled);

    if (!enabled) {
      addOutput('✓ Debug mode disabled');
      return;
    }

    const performanceMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    const debugInfo = `DEBUG MODE ENABLED 
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
  };

  const executeCommand = (cmd: string) => {
    const sanitizedCmd = sanitizeCommandInput(cmd);
    const trimmedCmd = normalizeCommandInput(sanitizedCmd);
    
    // Handle sudo password mode
    if (sudoMode) {
      setSudoMode(false);
      addInput('*'.repeat(sanitizedCmd.length));
      addOutputWithDelay([
        'Authentication successful.',
        'Checking system privileges...',
        'Warning: You now have root access to absolutely nothing.',
        'sudo: Nice try though.'
      ]);
      return;
    }
    
    addInput(sanitizedCmd);
    setCommandHistory(prev => [...prev, sanitizedCmd]);
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

    const exactCommandHandlers: Record<ExactCommandId, () => void> = {
      help: () => addOutput(getHelpOutput()),
      clear: clearHistory,
      home: () => {
        setSectionsVisited(prev => new Set(prev).add('home'));
        void showLoading(() => {
          clearHistory();
          showHomeContent();
          addOutput(buildHomeOutput(discordActivity));
        });
      },
      about: () => {
        setSectionsVisited(prev => new Set(prev).add('about'));
        void showLoading(showAboutOverview);
      },
      bio: () => {
        if (currentSection === 'about') {
          showBioContent();
          return;
        }
        addOutput('undefined', 'error');
      },
      skills: () => {
        if (currentSection === 'about') {
          showSkillsContent();
          return;
        }
        addOutput('undefined', 'error');
      },
      frameworks: () => {
        if (currentSection === 'about') {
          showFrameworksContent();
          return;
        }
        addOutput('undefined', 'error');
      },
      experience: () => {
        if (currentSection === 'about') {
          showExperienceContent();
          return;
        }
        addOutput('undefined', 'error');
      },
      projects: () => {
        setSectionsVisited(prev => new Set(prev).add('projects'));
        void showLoading(showProjectsOverview);
      },
      major: showMajorProjectsList,
      minor: showMinorProjectsList,
      back: () => {
        if (!currentSubsection) {
          addOutput('Already at main section. Type a section name to navigate.', 'error');
          return;
        }

        setCurrentSubsection(null);
        if (currentSection === 'about') {
          showAboutOverview();
          return;
        }

        if (currentSection === 'projects') {
          showProjectsOverview();
        }
      },
      contact: () => {
        setSectionsVisited(prev => new Set(prev).add('contact'));
        void showLoading(showContactOverview);
      },
      ls: showProjectsAliasListing,
      'typing-on': () => setTypingPreference(true),
      'typing-off': () => setTypingPreference(false),
      'sound-on': () => setSoundPreference(true),
      'sound-off': () => setSoundPreference(false),
      'crt-on': () => setCrtPreference(true),
      'crt-off': () => setCrtPreference(false),
      themes: showThemesOutput,
      tree: toggleTreePanel,
      'git-push': runGitPushPrank,
      matrix: () => {
        void addOutputWithDelay([
          'Wake up, Neo...',
          'The Matrix has you.',
          'Follow the white rabbit.',
          '',
          'Knock, knock, Neo.'
        ]);
      },
      coffee: () => {
        void addOutputWithDelay([
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
      },
      joke: () => {
        const jokes = [
          ['Why do programmers prefer dark mode?', '', 'Because light attracts bugs!'],
          ['Why do Java developers wear glasses?', '', 'Because they don\'t C#!'],
          ['How many programmers does it take to change a light bulb?', '', 'None. It\'s a hardware problem!'],
          ['Why did the programmer quit his job?', '', 'Because he didn\'t get arrays!']
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        void addOutputWithDelay(randomJoke);
      },
      secret: () => {
        const secrets = [
          ['You found the secret command!', 'There is no secret... or is there?', 'Try exploring more commands!'],
          ['Secret discovered!', 'The real secret is the code we wrote along the way.'],
          ['Easter egg unlocked!', 'Congratulations! You\'re now officially a command explorer.'],
          ['Hidden gem found!', 'You have excellent curiosity. That\'s what makes great developers!']
        ];
        const randomSecret = secrets[Math.floor(Math.random() * secrets.length)];
        void addOutputWithDelay(randomSecret);
      },
      sudo: () => {
        addOutput('[sudo] password for dylan:');
        setSudoMode(true);
      },
      whoami: () => {
        void addOutputWithDelay([
          'You are: A curious developer',
          'Location: Viewing Dylan\'s portfolio',
          'Mission: Exploring terminal commands',
          'Status: Awesome!'
        ]);
      },
      ping: () => {
        void addOutputWithDelay([
          'PING portfolio.dylan.dev',
          '64 bytes from awesome: icmp_seq=1 ttl=64 time=0.1 ms',
          '64 bytes from impressive: icmp_seq=2 ttl=64 time=0.1 ms',
          '64 bytes from hire_me: icmp_seq=3 ttl=64 time=0.1 ms'
        ]);
      },
      fortune: () => {
        void addOutputWithDelay([
          'Your fortune: You will discover an amazing developer today.',
          'Hint: You\'re already looking at his portfolio!'
        ]);
      },
      tetris: launchTetris,
      snake: launchSnake,
      stats: showStatsOutput,
      neofetch: showNeofetchOutput,
      backlog: () => showBacklogOutput(),
      'debug-on': () => setDebugPreference(true),
      'debug-off': () => setDebugPreference(false),
      'prompt-reset': () => {
        setCustomPrompt('$');
        addOutput('✓ Prompt reset to default: $');
      },
    };

    const exactCommand = resolveExactCommand(trimmedCmd);
    if (exactCommand) {
      exactCommandHandlers[exactCommand]();
      return;
    }

    // Handle 'theme' command
        if (trimmedCmd.startsWith('theme ')) {
          const themeName = trimmedCmd.substring(6).trim();
          
          if (VALID_THEMES.includes(themeName as typeof VALID_THEMES[number])) {
            applyThemePreference(themeName);
            
            addOutput(`✓ Theme changed to: ${themeName}`);
            return;
          } else {
            addOutput(`ERROR: Invalid theme '${themeName}'\nAvailable themes: ${VALID_THEMES.join(', ')}`, 'error');
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
            const isAbsolutePath = pathValue.startsWith('/') || /^(home|public)(\/|$)/.test(pathValue);
            const baseParts = isAbsolutePath ? [] : currentVirtualPathParts;
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

            const localParts = resolvedParts[1] === 'dylan'
              ? resolvedParts.slice(2)
              : resolvedParts.slice(1);

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

Session Time:      ${timeStr}
Commands Run:       ${commandCount}
Sections Visited:  ${sectionsVisited.size} (${sectionsStr})
Most Used Command: ${mostUsedCmd ? `${mostUsedCmd[0]} (${mostUsedCmd[1]}x)` : 'N/A'}
Commands in History: ${commandHistory.length}

Keep exploring!`);
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
          const debugInfo = `DEBUG MODE ENABLED 
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
          const newPrompt = sanitizedCmd.substring('prompt set '.length).trim();
          if (newPrompt && newPrompt.length > 0) {
            setCustomPrompt(newPrompt);
            addOutput(`✓ Prompt changed to: ${newPrompt}`);
          } else {
            addOutput('ERROR: Prompt cannot be empty', 'error');
          }
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
        const suggestion = findSimilarCommand(trimmedCmd);
        if (suggestion) {
          addOutput(`Command not found: ${sanitizedCmd}\nDid you mean '${suggestion}'?\nType 'help' for available commands`, 'error');
        } else {
          addOutput(`Command not found: ${sanitizedCmd}\nType 'help' for available commands`, 'error');
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
        showBioContent();
      } else if (num === 2) {
        showSkillsContent();
      } else if (num === 3) {
        showFrameworksContent();
      } else if (num === 4) {
        showExperienceContent();
      }
      return;
    }

    if (currentSection === 'projects') {
      if (!currentSubsection) {
        if (num === 1) {
          showMajorProjectsList();
        } else if (num === 2) {
          showMinorProjectsList();
        }
        return;
      }

      if (currentSubsection === 'major' || currentSubsection === 'minor') {
        const projectList = currentSubsection === 'major' ? majorProjects : minorProjects;
        if (num >= 1 && num <= projectList.length) {
          openProjectDetails(currentSubsection, num - 1);
        }
        return;
      }

      if (currentSubsection.includes('-project-')) {
        const [category, , projectNumStr] = currentSubsection.split('-');
        const projectNum = parseInt(projectNumStr, 10);
        const projectList = category === 'major' ? majorProjects : minorProjects;
        const project = projectList[projectNum - 1];

        if (num === 1 && project.link) {
          addOutput(`Opening GitHub: ${project.link}`);
          window.open(project.link, '_blank');
        } else if (num === 2 && project.webapp) {
          addOutput(`Opening live webapp: ${project.webapp}`);
          window.open(project.webapp, '_blank');
        }
      }
      return;
    }

    if (currentSection === 'contact') {
      if (num >= 1 && num <= contactData.length) {
        const contact = contactData[num - 1];
        handleCopy(contact.value, contact.label);
      }
      return;
    }

    if (currentSection === 'home') {
      if (num === 1) {
        setSectionsVisited(prev => new Set(prev).add('about'));
        showAboutOverview();
      } else if (num === 2) {
        setSectionsVisited(prev => new Set(prev).add('projects'));
        showProjectsOverview();
      } else if (num === 3) {
        setSectionsVisited(prev => new Set(prev).add('contact'));
        showContactOverview();
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
    if (window.innerWidth > 768 && !showTetris && !showSnake && !isBooting) {
      inputRef.current?.focus();
    }
  }, [showTetris, showSnake, isBooting]);
  
  const handleLayoutClick = () => {
    // Only focus input on desktop, not on mobile, and not when games are open
    if (window.innerWidth > 768 && !showTetris && !showSnake && !isBooting) {
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
  const sessionSeconds = hasHydrated ? Math.floor((systemNow.getTime() - sessionStart) / 1000) : 0;
  const uptimeMinutes = Math.floor(sessionSeconds / 60);
  const uptimeRemainderSeconds = sessionSeconds % 60;
  const currentClock = hasHydrated ? systemNow.toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--';
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
      return ['home', 'projects', selectedProject.category, createProjectSlug(selectedProject.project.name)];
    }

    if (currentSection === 'home') {
      return ['home'];
    }

    if (currentSection === 'about') {
      if (currentSubsection === 'bio') return ['home', 'about', 'bio.txt'];
      if (currentSubsection === 'skills') return ['home', 'about', 'skills.json'];
      if (currentSubsection === 'frameworks') return ['home', 'about', 'frameworks.md'];
      if (currentSubsection === 'experience') return ['home', 'about', 'experience'];
      return ['home', 'about'];
    }

    if (currentSection === 'projects') {
      if (currentSubsection === 'major') return ['home', 'projects', 'major'];
      if (currentSubsection === 'minor') return ['home', 'projects', 'minor'];
      return ['home', 'projects'];
    }

    if (currentSection === 'contact') {
      return ['home', 'contact'];
    }

    return ['home'];
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
  const directoryTreeText = useMemo(() => [
    'home/',
    '  ├── about/',
    '  │   ├── bio.txt',
    '  │   ├── skills.json',
    '  │   └── frameworks.md',
    '  ├── projects/',
    '  │   ├── major/',
    ...formatTreeBranch(majorProjectSlugs, '  │   │   '),
    '  │   └── minor/',
    ...formatTreeBranch(minorProjectSlugs, '  │       '),
    '  ├── contact/',
    '  │   ├── email.link',
    '  │   ├── github.link',
    '  │   ├── linkedin.link',
    '  │   └── instagram.link',
    '  └── resume/',
    '      └── Dylan_van_der_Ven_Resume.pdf (installable)',
  ].join('\n'), [majorProjectSlugs, minorProjectSlugs]);

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
            placeholder={sudoMode ? '' : isBooting ? 'Booting system...' : "Type 'help' for commands..."}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="send"
            inputMode="text"
            spellCheck="false"
            disabled={showTetris || showSnake || showFake404 || isBooting}
          />
          <button
            type="submit"
            className="terminal-submit"
            disabled={!input.trim() || showTetris || showSnake || showFake404 || isBooting}
            aria-label="Run terminal command"
          >
            Run
          </button>
        </form>
        </div>
      </div>
      
      <div className="visual-panel">
        <div className="visual-content diagnostics-panel">
          <div className="diag-row"><span>Current Time: </span><strong>{currentClock}</strong></div>
          <div className="diag-row"><span>Section: </span><strong>{currentSection.toUpperCase()}</strong></div>
          <div className="diag-row"><span>Commands: </span><strong>{commandCount}</strong></div>
        </div>

        {showTreePanel && (
          <div className="visual-content directory-panel">
            <pre className="directory-tree" dangerouslySetInnerHTML={{ __html: directoryTreeHtml }} />
          </div>
        )}
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
