export const majorProjects = [
  {
    id: 1,
    name: "Portfolio Terminal",
    description: "My current, Interactive terminal-style portfolio with command system",
    tech: ["React", "Next.js", "TypeScript"],
    link: "https://github.com/Dylan-Ven/portfolio",
    webapp: "https://www.dylanvdven.xyz/",
    status: "Online",
    image: "/images/Portfolio1.png"
  },
  {
    id: 2,
    name: "My first Portfolio",
    description: "I created my first portfolio back in the second year of my schooling, I built it with Astro on a reccomendation from a friend, this was my first time using a framework I got a 7/10 for this project",
    tech: ["Astro", "Javascript"],
    link: "https://github.com/Dylan-Ven/3d-ai",
    webapp: "",
    status: "Offline",
    image: "/images/Portfolio1.png"
  },
  {
    id: 3,
    name: "Bali (Web based game)",
    description: "For one of my graded projects at school, We were tasked with making an old-school game, We went for a couch-coop type of game, like a minigame from mario party. The name is based off of an inside joke from our group. I helped set up the abilities system I got a 7/10 for this project",
    tech: ["Three.js", "Websockets"],
    link: "https://github.com/maciejphp/game",
    webapp: "",
    status: "Offline",
    image: "/images/Portfolio1.png"
  },
  {
    id: 4,
    name: "Woordle (Wordle Clone)",
    description: "another school project, We were tasked with making our own version/clone of either a typing test or wordle. my group decided on wordle, I made the API, aswell as the entire admin panel and leaderboard system. I got an 8/10 for this project",
    tech: ["JavaScript", "PHP", "Vanilla"],
    link: "",
    webapp: "",
    status: "Offline, never published",
    image: "/images/Portfolio1.png"
  },
  {
    id: 5,
    name: "ClassProject",
    description: "This is my first project from school that I uploaded to GitHub, We were tasked with making a digitalised student list, I made the list with Svelte, This was my first time using Svelte with Typescript. and i made an API in PHP. I got a 8/10 for this project",
    tech: ["Svelte", "TypeScript", "PHP"],
    link: "https://github.com/Dylan-Ven/ClassProject",
    webapp: "",
    status: "Offline, API is down",
    image: "/images/Portfolio1.png"
  },
  {
    id: 6,
    name: "Proftaak P3 (Project Year 3, Q3)",
    description: "In the third year, we had a project where we had to fill in an exam form, preparing me for my final internship. I made an app that would use an arduino to measure the sound volume of the room, and put that data on a graph, it updated every minute by the average sound level. I got a 6,4 (I forgot some documentation)",
    tech: ["C++", "Arduino IDE", "Graph.js", "Express.js"],
    link: "",
    webapp: "",
    status: "Private, Never published",
    image: "/images/Portfolio1.png"
  },
  {
    id: 7,
    name: "Proftaak P4 (Project Year 3, Q4)",
    description: "We were tasked with the same thing as in Q3, This time I found some public NASA APIs that had data about exoplanets, I made a website that would display that data in a user-friendly 3D way, I had some checks based on size and rotation speed, I got a 9.3/10 for this project",
    tech: ["Three.js", "JavaScript", "NASA APIs"],
    link: "https://github.com/Yonder-ICT-Mediatechnologie/proftaak-p4-dylan",
    webapp: "",
    status: "Offline, Never published",
    image: "/images/Portfolio1.png"
  }
];

export const minorProjects = [
  {
    id: 1,
    name: "Challenge game",
    description: "At school, we were challenged to design a game in a week. the theme was 'Food Waste'. me and my team created a memory game where you had to match food items",
    tech: ["HTML", "Bootstrap", "Javascript", "Sweetalert2"],
    link: "https://github.com/Dylan-Ven/Challenge-Game",
    webapp: "https://challenge-game.vercel.app/",
    status: "Online",
    image: "/images/Portfolio1.png"
  },
  {
    id: 2,
    name: "Medisch Leerfonds (Junior Hackathon 2023)",
    description: "Back in the second year, I along with a couple of my classmates participated in a junior hackathon. We had created a platform that was supposed to help medical students find funding for their studies, we won the public choice award!",
    tech: ["SvelteKit", "JavaScript", "CSS", "Firebase"],
    link: "https://github.com/Dylan-Ven/Medisch-leerfonds", 
    webapp: "https://medischleerfonds.vercel.app/",
    status: "Online",
    image: "/images/Portfolio1.png"
  },
  {
    id: 3,
    name: "Gametime Bot",
    description: "I am working on a discord bot that tracks how much time you have spent in certain games,",
    tech: ["MongoDB", "Discord.js", "Express.js"],
    link: "",
    webapp: "",
    status: "Private, In Development",
    image: "/images/Portfolio1.png"
  },
  {
    id: 4,
    name: "Natte Kerstzak (Discord Bot)",
    description: "A friend asked if i could make a bot for his discord server, the bot plays music in voice channels. I don't plan on releasing this bot publicly",
    tech: ["Discord.js", "cookies", "FFMPEG"],
    link: "",
    webapp: "",
    status: "Private, In Development",
    image: "/images/Portfolio1.png"
  },
  {
    id: 5,
    name: "Zeeslag (Digitalised Boardgame)",
    description: "I liked playing the boardgame battleship, So i decided to make a digital version of it by myself, using vanilla javascript, html and css. its supposed to be a Multiplayer game",
    tech: ["HTML", "CSS", "JavaScript"],
    link: "",
    webapp: "",
    status: "Offline, In Development",
    image: "/images/Portfolio1.png"
  }
];

// Keep old export for backwards compatibility
export const projectsData = [...majorProjects, ...minorProjects];

export const skillsData = {
  languages: [
    { name: "JavaScript", level: 4 },
    { name: "TypeScript", level: 4 },
    { name: "HTML/CSS", level: 4 },
    { name: "SQL", level: 3 }
  ],
  frontend: [
    { name: "React", level: 2 },
    { name: "Next.js", level: 3 },
    { name: "Three.js", level: 3 },
    { name: "GSAP", level: 1 },
    { name: "TailwindCSS", level: 5 }
  ],
  backend: [
    { name: "Node.js", level: 3 },
    { name: "Express", level: 4 },
    { name: "MongoDB", level: 3 },
    { name: "REST APIs", level: 3 }
  ],
  tools: [
    { name: "Git", level: 3 },
    { name: "Docker", level: 1 },
    { name: "Figma", level: 4 },
    { name: "VS Code", level: 5 }
  ],
  other: [
    { name: "WebGL", level: 3 },
    { name: "Shader Programming", level: 1 },
    { name: "UI/UX Design", level: 4 },
    { name: "3D Graphics", level: 3 }
  ]
};

export const experienceData = [
  {
    id: 1,
    title: "Full-Stack Developer (internship)",
    company: "GOAN jouw groeipartner",
    location: "On site, Waalwijk, Netherlands",
    period: "2025 - Present (full-year)",
    description: [
      "Developed and maintained web applications using Wordpress with DIVI",
      "Collaborated with design team to implement responsive UI/UX",
      "Optimized application performance and database queries"
    ],
    tech: ["Wordpress", "DIVI", "Sveltekit"]
  },
  {
    id: 2,
    title: "Developer (internship)",
    company: "MaMa Producties",
    location: "Eindhoven, Netherlands",
    period: "2023 - 2023 (half-year)",
    description: [
      "Created instruction videos",
      "Made a test 3D experience using AI and Unity",
      "Designed websites for clients using Wordpress/Figma"
    ],
    tech: ["Wordpress", "Figma", "Unity"]
  }
];

export const contactData = [
  {
    label: "EMAIL",
    value: "dylanvanderven@outlook.com",
    link: "mailto:dylanvanderven@outlook.com"
  },
  {
    label: "GITHUB",
    value: "github.com/Dylan-Ven",
    link: "https://github.com/Dylan-Ven"
  },
  {
    label: "LINKEDIN",
    value: "linkedin.com/in/dylan-van-der-ven",
    link: "https://www.linkedin.com/in/dylan-van-der-ven-766a94240/"
  },
  {
    label: "INSTAGRAM",
    value: "@ven.dylan",
    link: "https://www.instagram.com/ven.dylan/"
  },
  {
    label: "DISCORD",
    value: "DylanNST",
    link: "#"
  }
];
