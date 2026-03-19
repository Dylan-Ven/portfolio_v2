export const VALID_THEMES = [
  'default',
  'green',
  'amber',
  'dracula',
  'monokai',
  'nord',
  'high-contrast',
  'solarized-dark',
  'solarized-light',
  'gruvbox',
  'tokyo-night',
  'one-dark',
  'synthwave',
  'matrix',
  'cyberpunk',
] as const;

export const AVAILABLE_COMMANDS = [
  'help',
  'clear',
  'home',
  'about',
  'bio',
  'skills',
  'frameworks',
  'experience',
  'projects',
  'major',
  'minor',
  'contact',
  'back',
  'ls',
  'tree',
  'cd',
  'theme',
  'themes',
  'typing on',
  'typing off',
  'sound on',
  'sound off',
  'crt on',
  'crt off',
  'stats',
  'neofetch',
  'backlog',
  'debug on',
  'debug off',
  'prompt set',
  'prompt reset',
  'github',
  'linkedin',
  'email',
  'instagram',
  'webapp',
  'npm install resume',
  'npm i resume',
  'git push',
  'tetris',
  'snake',
  'matrix',
  'hack',
  'coffee',
  'sudo',
  'whoami',
  'ping',
  'fortune',
  'joke',
  'secret',
  'copy',
  'open',
] as const;

export type ExactCommandId =
  | 'help'
  | 'clear'
  | 'home'
  | 'about'
  | 'bio'
  | 'skills'
  | 'frameworks'
  | 'experience'
  | 'projects'
  | 'major'
  | 'minor'
  | 'contact'
  | 'back'
  | 'ls'
  | 'typing-on'
  | 'typing-off'
  | 'sound-on'
  | 'sound-off'
  | 'crt-on'
  | 'crt-off'
  | 'themes'
  | 'tree'
  | 'git-push'
  | 'matrix'
  | 'coffee'
  | 'joke'
  | 'secret'
  | 'sudo'
  | 'whoami'
  | 'ping'
  | 'fortune'
  | 'tetris'
  | 'snake'
  | 'stats'
  | 'neofetch'
  | 'backlog'
  | 'debug-on'
  | 'debug-off'
  | 'prompt-reset';

const EXACT_COMMAND_ALIASES: Record<ExactCommandId, readonly string[]> = {
  help: ['help'],
  clear: ['clear'],
  home: ['home'],
  about: ['about'],
  bio: ['bio'],
  skills: ['skills'],
  frameworks: ['frameworks'],
  experience: ['experience'],
  projects: ['projects'],
  major: ['major'],
  minor: ['minor'],
  contact: ['contact'],
  back: ['back'],
  ls: ['ls'],
  'typing-on': ['typing on'],
  'typing-off': ['typing off'],
  'sound-on': ['sound on'],
  'sound-off': ['sound off'],
  'crt-on': ['crt on'],
  'crt-off': ['crt off'],
  themes: ['themes'],
  tree: ['tree'],
  'git-push': ['git push', 'git push origin main'],
  matrix: ['matrix'],
  coffee: ['coffee'],
  joke: ['joke'],
  secret: ['secret'],
  sudo: ['sudo'],
  whoami: ['whoami'],
  ping: ['ping'],
  fortune: ['fortune'],
  tetris: ['tetris', 'play tetris'],
  snake: ['snake', 'play snake'],
  stats: ['stats'],
  neofetch: ['neofetch'],
  backlog: ['backlog'],
  'debug-on': ['debug on'],
  'debug-off': ['debug off'],
  'prompt-reset': ['prompt reset'],
};

export const sanitizeCommandInput = (value: string): string => {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
};

export const normalizeCommandInput = (value: string): string => sanitizeCommandInput(value).toLowerCase();

export const resolveExactCommand = (normalizedInput: string): ExactCommandId | null => {
  for (const [commandId, aliases] of Object.entries(EXACT_COMMAND_ALIASES) as Array<[ExactCommandId, readonly string[]]>) {
    if (aliases.includes(normalizedInput)) {
      return commandId;
    }
  }

  return null;
};
