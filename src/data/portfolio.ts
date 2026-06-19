export type ProjectCategory = 'major' | 'minor' | 'schoolwork';
export type SchoolworkYear = 'Year 1' | 'Year 2' | 'Year 3';

export interface PortfolioProject {
  id: number;
  name: string;
  description: string;
  tech: string[];
  link: string;
  webapp: string;
  status: string;
  image: string;
  category?: ProjectCategory;
  year?: SchoolworkYear;
}

export const Projects: {
  Major: PortfolioProject[];
  Minor: PortfolioProject[];
  Schoolwork: PortfolioProject[];
} = {
  Major: [
    {
      id: 1,
      name: 'Portfolio Terminal',
      description: 'My current, Interactive terminal-style portfolio with command system',
      tech: ['React', 'Next.js', 'TypeScript'],
      link: 'https://github.com/Dylan-Ven/portfolio_v2',
      webapp: 'https://www.dylanvdven.xyz/',
      status: 'Online',
      image: '/images/Portfolio1.png',
      category: 'major',
    },
    {
      id: 2,
      name: 'My first Portfolio',
      description: 'I created my first portfolio back in the second year of my schooling, I built it with Astro on a reccomendation from a friend, this was my first time using a framework I got a 7/10 for this project',
      tech: ['Astro', 'Javascript'],
      link: 'https://github.com/Dylan-Ven/portfolio_1',
      webapp: '',
      status: 'Offline',
      image: '/images/Portfolio1.png',
      category: 'major',
    },
    {
      id: 3,
      name: 'TrackId.Studio',
      description: 'This project, I worked on making a music-recognition application, where i continued building on something that was already realised.',
      tech: ['React', 'TypeScript', 'Kotlin', 'Swift', 'Flutter (Dart)'],
      link: '#',
      webapp: '#',
      status: 'Not Published Yet, ETA: Q2 2026',
      image: '/images/Portfolio1.png',
      category: 'major',
    },
    {
      id: 4,
      name: 'Zeeslag (Digitalised Boardgame)',
      description: 'I liked playing the boardgame battleship, So i decided to make a digital version of it by myself, using vanilla javascript, html and css. its supposed to be a Multiplayer game',
      tech: ['HTML', 'CSS', 'JavaScript'],
      link: '',
      webapp: '',
      status: 'Offline, In Development',
      image: '/images/Portfolio1.png',
      category: 'major',
    },
  ],
  Minor: [
    {
      id: 1,
      name: 'Gametime Bot',
      description: 'I am working on a discord bot that tracks how much time you have spent in certain games,',
      tech: ['MongoDB', 'Discord.js', 'Express.js'],
      link: '',
      webapp: '',
      status: 'Private, In Development',
      image: '/images/Portfolio1.png',
      category: 'minor',
    },
    {
      id: 2,
      name: 'Natte Kerstzak (Discord Bot)',
      description: "A friend asked if i could make a bot for his discord server, the bot plays music in voice channels. I don't plan on releasing this bot publicly",
      tech: ['Discord.js', 'cookies', 'FFMPEG'],
      link: '',
      webapp: '',
      status: 'Temporarily stopped development, December 2025',
      image: '/images/Portfolio1.png',
      category: 'minor',
    },
  ],
  Schoolwork: [
    {
      id: 1,
      name: 'ClassProject',
      description: 'This is my first project from school that I uploaded to GitHub, We were tasked with making a digitalised student list, I made the list with Svelte, This was my first time using Svelte with Typescript. and i made an API in PHP. I got a 8/10 for this project',
      tech: ['Svelte', 'TypeScript', 'PHP'],
      link: 'https://github.com/Dylan-Ven/ClassProject',
      webapp: '',
      status: 'Offline',
      image: '/images/Portfolio1.png',
      category: 'schoolwork',
      year: 'Year 1',
    },
    {
      id: 1,
      name: 'Medisch Leerfonds (Junior Hackathon 2023)',
      description: 'Back in the second year, I along with a couple of my classmates participated in a junior hackathon. We had created a platform that was supposed to help medical students find funding for their studies, we won the public choice award!',
      tech: ['SvelteKit', 'JavaScript', 'CSS', 'Firebase'],
      link: 'https://github.com/Dylan-Ven/Medisch-leerfonds',
      webapp: 'https://medischleerfonds.vercel.app/',
      status: 'Online',
      image: '/images/Portfolio1.png',
      category: 'schoolwork',
      year: 'Year 2',
    },
    {
      id: 2,
      name: 'Bali (Web based game)',
      description: 'For one of my graded projects at school, We were tasked with making an old-school game, We went for a couch-coop type of game, like a minigame from mario party. The name is based off of an inside joke from our group. I helped set up the abilities system I got a 7/10 for this project',
      tech: ['Three.js', 'Websockets'],
      link: 'https://github.com/maciejphp/game',
      webapp: '',
      status: 'Offline',
      image: '/images/Portfolio1.png',
      category: 'schoolwork',
      year: 'Year 2',
    },
    {
      id: 1,
      name: 'Challenge game',
      description: "At school, we were challenged to design a game in a week. the theme was 'Food Waste'. me and my team created a memory game where you had to match food items",
      tech: ['HTML', 'Bootstrap', 'Javascript', 'Sweetalert2'],
      link: 'https://github.com/Dylan-Ven/Challenge-Game',
      webapp: 'https://challenge-game.vercel.app/',
      status: 'Online',
      image: '/images/Portfolio1.png',
      category: 'schoolwork',
      year: 'Year 3',
    },
    {
      id: 2,
      name: 'Proftaak P3 (Project Year 3, Q3)',
      description: 'In the third year, we had a project where we had to fill in an exam form, preparing me for my final internship. I made an app that would use an arduino to measure the sound volume of the room, and put that data on a graph, it updated every minute by the average sound level. I got a 6,4 (I forgot some documentation)',
      tech: ['C++', 'Arduino IDE', 'Graph.js', 'Express.js'],
      link: '',
      webapp: '',
      status: 'Private, Never published',
      image: '/images/Portfolio1.png',
      category: 'schoolwork',
      year: 'Year 3',
    },
    {
      id: 3,
      name: 'Proftaak P4 (Project Year 3, Q4)',
      description: 'We were tasked with the same thing as in Q3, This time I found some public NASA APIs that had data about exoplanets, I made a website that would display that data in a user-friendly 3D way, I had some checks based on size and rotation speed, I got a 9.3/10 for this project',
      tech: ['Three.js', 'JavaScript', 'NASA APIs'],
      link: 'https://github.com/Yonder-ICT-Mediatechnologie/proftaak-p4-dylan',
      webapp: '',
      status: 'Offline, Never published',
      image: '/images/Portfolio1.png',
      category: 'schoolwork',
      year: 'Year 3',
    },
  ],
};

export const majorProjects: PortfolioProject[] = Projects.Major;
export const minorProjects: PortfolioProject[] = Projects.Minor;
export const schoolworkProjects: PortfolioProject[] = Projects.Schoolwork;
export const projects: PortfolioProject[] = [
  ...Projects.Major,
  ...Projects.Minor,
  ...Projects.Schoolwork,
];

export const projectsData: PortfolioProject[] = [
  ...projects,
];

export interface SkillEntry {
  name: string;
  level: number;
}

export interface SkillsDataset {
  [key: string]: SkillEntry[];
  languages: SkillEntry[];
  frontend: SkillEntry[];
  backend: SkillEntry[];
  fullstack: SkillEntry[];
  cms: SkillEntry[];
  creativeAndGraphics: SkillEntry[];
  engines: SkillEntry[];
  tools: SkillEntry[];
  other: SkillEntry[];
}

export const Skills: SkillsDataset = {
  languages: [
    { name: 'JavaScript', level: 5 },
    { name: 'TypeScript', level: 5 },
    { name: 'HTML/CSS', level: 5 },
    { name: 'PHP', level: 4 },
    { name: 'SQL', level: 4 },
    { name: 'AutoHotKey', level: 3 },
    { name: 'Java', level: 2 },
    { name: 'Python', level: 2 },
    { name: 'C++/C/C#', level: 1 },
    { name: 'Powershell', level: 1 },
  ],
  frontend: [
    { name: 'TailwindCSS', level: 5 },
    { name: 'React', level: 4 },
    { name: 'Svelte', level: 3 },
  ],
  backend: [
    { name: 'Express', level: 4 },
    { name: 'Node.js', level: 3 },
    { name: 'Mongoose', level: 3 }, 
    { name: 'MongoDB', level: 3 },
    { name: 'REST APIs', level: 3 },
  ],
  fullstack: [
    { name: 'Next.js', level: 3 },
    { name: 'SvelteKit', level: 3 },
  ],
  cms: [
    { name: 'Wordpress', level: 3 },
    { name: 'DIVI', level: 4 },
    { name: 'Joomla', level: 1 },
  ],
  creativeAndGraphics: [
    { name: 'UI/UX Design', level: 4 },
    { name: 'Three.js', level: 3 },
    { name: 'WebGL', level: 3 },
    { name: '3D Graphics', level: 3 },
    { name: 'GSAP', level: 1 },
    { name: 'Shader Programming', level: 1 },
  ],
  engines: [
    { name: 'Godot', level: 2 },
    { name: 'Unity', level: 2 },
    { name: 'Unreal Engine', level: 1 },
  ],
  tools: [
    { name: 'VS Code', level: 5 },
    { name: 'Figma', level: 4 },
    { name: 'Git', level: 3 },
    { name: 'Vite', level: 3 },    
    { name: 'Vercel', level: 3 },  
    { name: 'NPM / Yarn / pnpm', level: 3 }, 
    { name: 'Bun', level: 2 },     
    { name: 'Blender', level: 2 },
    { name: 'Krita', level: 2 },
    { name: 'Docker', level: 1 },
    { name: 'neovim', level: 1 },
  ],
  other: [],
};

export const skillsData = Skills;

export interface ExperienceEntry {
  id: number;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  tech: string[];
}

export const Experience: ExperienceEntry[] = [
  {
    id: 1,
    title: 'Full-Stack Developer (internship)',
    company: 'GOAN jouw groeipartner',
    location: 'On site, Waalwijk, Netherlands',
    period: '2025 - Present (full-year)',
    description: [
      'Developed and maintained web applications using Wordpress with DIVI',
      'Collaborated with design team to implement responsive UI/UX',
      'Optimized application performance and database queries',
    ],
    tech: ['Wordpress', 'DIVI', 'Sveltekit'],
  },
  {
    id: 2,
    title: 'Developer (internship)',
    company: 'MaMa Producties',
    location: 'Eindhoven, Netherlands',
    period: '2023 - 2023 (half-year)',
    description: [
      'Created instruction videos',
      'Made a test 3D experience using AI and Unity',
      'Designed websites for clients using Wordpress/Figma',
    ],
    tech: ['Wordpress', 'Figma', 'Unity'],
  },
];

export const experienceData = Experience;

export type BacklogStatus = 'learning' | 'building' | 'researching' | 'done';

export interface LearningBacklogItem {
  id: number;
  topic: string;
  status: BacklogStatus;
  focus: string;
  eta: string;
  priority: 'high' | 'medium' | 'low';
}

export const LearningBacklog: LearningBacklogItem[] = [
  {
    id: 1,
    topic: 'Advanced TypeScript patterns',
    status: 'learning',
    focus: 'Utility types, generics, and safer state modeling in React apps',
    eta: 'never',
    priority: 'high'
  },
  {
    id: 2,
    topic: 'Kotlin and Android development',
    status: 'learning',
    focus: 'Kotlin basics, Android app development, and UI/UX design',
    eta: 'TBD',
    priority: 'low'
  },
  {
    id: 3,
    topic: 'DevOps baseline for portfolio projects',
    status: 'researching',
    focus: 'CI checks, deployment pipelines, and environment hardening',
    eta: 'Q3 2026',
    priority: 'medium'
  },
  {
    id: 4,
    topic: 'How to cook for dummies',
    status: 'done',
    focus: 'Basic cooking techniques for dummies',
    eta: 'Completed',
    priority: 'high'
  }
];

export const learningBacklog = LearningBacklog;

export interface ContactItem {
  label: string;
  value: string;
  link: string;
}

export const Contacts: ContactItem[] = [
  {
    label: 'EMAIL',
    value: 'ven.dylanvander@gmail.com',
    link: 'mailto:ven.dylanvander@gmail.com',
  },
  {
    label: 'GITHUB',
    value: 'github.com/Dylan-Ven',
    link: 'https://github.com/Dylan-Ven',
  },
  {
    label: 'LINKEDIN',
    value: 'linkedin.com/in/dylan-van-der-ven',
    link: 'https://www.linkedin.com/in/dylan-van-der-ven-766a94240/',
  },
  {
    label: 'INSTAGRAM',
    value: '@ven.dylan',
    link: 'https://www.instagram.com/ven.dylan/',
  },
  {
    label: 'DISCORD',
    value: 'DylanNST',
    link: '#',
  },
];

export const contactData = Contacts;
