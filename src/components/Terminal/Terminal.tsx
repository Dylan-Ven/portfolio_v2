'use client';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { projectsData, majorProjects, minorProjects, skillsData, contactData, experienceData, learningBacklog } from '@/data/portfolio';
import { AVAILABLE_COMMANDS, normalizeCommandInput, resolveExactCommand, sanitizeCommandInput, type ExactCommandId } from './commandCatalog';
import {
  buildAboutOverviewOutput,
  buildBacklogResponse,
  buildBioOutput,
  buildContactOverviewOutput,
  buildExperienceOutput,
  buildFrameworksOutput,
  createAboutCommandHandlers,
  createContactCommandHandlers,
  createEasterEggCommandHandlers,
  createGameCommandHandlers,
  createNavigationCommandHandlers,
  createPreferenceCommandHandlers,
  createProjectsCommandHandlers,
  createSystemCommandHandlers,
  createThemeCommandHandlers,
  buildHelpOutput,
  buildHomeOutput,
  buildNeofetchOutput,
  buildProjectDetailsOutput,
  buildProjectListOutput,
  buildProjectsAliasOutput,
  buildProjectsOverviewOutput,
  buildSkillsOutput,
  buildStatsOutput,
  buildThemesOutput,
  handleBacklogFilterCommand,
  handleCdCommand,
  handleContactByPath,
  handleContactShortcutCommand,
  handleHackCommand,
  handlePromptSetCommand,
  handleProjectContextShortcutCommand,
  handleResumeInstallCommand,
  handleThemeCommand,
} from './commands';
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
    return buildHelpOutput({
      currentSection,
      currentSubsection,
      majorProjects,
      minorProjects,
      contactCount: contactData.length,
    });
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

  const triggerResumeDownload = () => {
    addOutput(`📦 Installing resume...
⠋ Downloading CV-Dylan.pdf
✓ Resume downloaded successfully!

Check your downloads folder.`);

    const link = document.createElement('a');
    link.href = '/resume/CV-Dylan.pdf';
    link.download = 'CV-Dylan.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    addOutput(buildAboutOverviewOutput());
  };

  const showBioContent = () => {
    setCurrentSubsection('bio');
    clearHistory();
    addOutput(buildBioOutput());
  };

  const showSkillsContent = () => {
    setCurrentSubsection('skills');
    clearHistory();
    addOutput(buildSkillsOutput(skillsData));
  };

  const showFrameworksContent = () => {
    setCurrentSubsection('frameworks');
    clearHistory();
    addOutput(buildFrameworksOutput(skillsData));
  };

  const showExperienceContent = () => {
    setCurrentSubsection('experience');
    clearHistory();
    addOutput(buildExperienceOutput(experienceData));
  };

  const showProjectsOverview = () => {
    clearHistory();
    showProjectsMenu();
    addOutput(buildProjectsOverviewOutput(majorProjects.length, minorProjects.length));
  };

  const showProjectsAliasListing = () => {
    clearHistory();
    setCurrentSection('projects');
    setCurrentSubsection(null);
    addOutput(buildProjectsAliasOutput(projectsData));
  };

  const showMajorProjectsList = () => {
    if (currentSection !== 'projects') {
      addOutput('undefined', 'error');
      return;
    }

    setCurrentSubsection('major');
    clearHistory();
    addOutput(buildProjectListOutput('MAJOR PROJECTS', majorProjects));
  };

  const showMinorProjectsList = () => {
    if (currentSection !== 'projects') {
      addOutput('undefined', 'error');
      return;
    }

    setCurrentSubsection('minor');
    clearHistory();
    addOutput(buildProjectListOutput('MINOR PROJECTS', minorProjects));
  };

  const showContactOverview = () => {
    clearHistory();
    showContactMenu();
    addOutput(buildContactOverviewOutput(contactData, discordActivity));
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
    addOutput(buildThemesOutput());
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
    addOutput(buildStatsOutput({
      sessionStart,
      commandFrequency,
      sectionsVisited,
      commandCount,
      commandHistoryLength: commandHistory.length,
    }));
  };

  const showNeofetchOutput = () => {
    addOutput(buildNeofetchOutput({ sessionStart, currentTheme, discordActivity }));
  };

  const showBacklogOutput = (subcommand: string = 'all') => {
    const response = buildBacklogResponse(learningBacklog, subcommand);
    addOutput(response.content, response.type);
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

    const exactCommandHandlers = {
      ...createNavigationCommandHandlers({
        addOutput,
        clearHistory,
        showLoading,
        showHomeContent,
        buildHomeOutput,
        discordActivity,
        setSectionsVisited,
        currentSubsection,
        currentSection,
        setCurrentSubsection,
        showAboutOverview,
        showProjectsOverview,
        showProjectsAliasListing,
      }),
      ...createAboutCommandHandlers({
        addOutput,
        showLoading,
        setSectionsVisited,
        currentSection,
        showAboutOverview,
        showBioContent,
        showSkillsContent,
        showFrameworksContent,
        showExperienceContent,
      }),
      ...createProjectsCommandHandlers({
        setSectionsVisited,
        showLoading,
        showProjectsOverview,
        showMajorProjectsList,
        showMinorProjectsList,
      }),
      ...createContactCommandHandlers({
        setSectionsVisited,
        showLoading,
        showContactOverview,
      }),
      ...createPreferenceCommandHandlers({
        setTypingPreference,
        setSoundPreference,
        setCrtPreference,
      }),
      ...createThemeCommandHandlers({ showThemesOutput }),
      ...createSystemCommandHandlers({
        addOutput,
        getHelpOutput,
        clearHistory,
        toggleTreePanel,
        runGitPushPrank,
        showStatsOutput,
        showNeofetchOutput,
        showBacklogOutput,
        setDebugPreference,
        setCustomPrompt,
      }),
      ...createGameCommandHandlers({
        launchTetris,
        launchSnake,
      }),
      ...createEasterEggCommandHandlers({
        addOutput,
        addOutputWithDelay,
        setSudoMode,
      }),
    } satisfies Partial<Record<ExactCommandId, () => void>>;

    const exactCommand = resolveExactCommand(trimmedCmd);
    if (exactCommand) {
      const exactHandler = exactCommandHandlers[exactCommand];
      if (exactHandler) {
        exactHandler();
        return;
      }
    }

    if (handleThemeCommand({ trimmedCmd, addOutput, applyThemePreference })) {
      return;
    }

    if (handleCdCommand({
      trimmedCmd,
      currentVirtualPathParts,
      createProjectSlug,
      majorProjects,
      minorProjects,
      openProjectDetails,
      executeCommand,
      addOutput,
      openContactByPath: (contactPath: string) => handleContactByPath({
        contactPath,
        contactData,
        addOutput,
        handleCopy,
      }),
      triggerResumeDownload,
    })) {
      return;
    }



        if (handleContactShortcutCommand({
          trimmedCmd,
          currentSection,
          contactData,
          addOutput,
        })) {
          return;
        }

        if (handleResumeInstallCommand({
          trimmedCmd,
          triggerResumeDownload,
        })) {
          return;
        }

        if (handleHackCommand({
          trimmedCmd,
          addOutput,
          addOutputWithDelay,
          setHistory,
        })) {
          return;
        }

        if (handleBacklogFilterCommand({
          trimmedCmd,
          showBacklogOutput,
        })) {
          return;
        }

        if (handlePromptSetCommand({
          trimmedCmd,
          sanitizedCmd,
          setCustomPrompt,
          addOutput,
        })) {
          return;
        }

        if (handleProjectContextShortcutCommand({
          trimmedCmd,
          currentSubsection,
          majorProjects,
          minorProjects,
          addOutput,
        })) {
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

    addOutput(buildProjectDetailsOutput(project));
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
