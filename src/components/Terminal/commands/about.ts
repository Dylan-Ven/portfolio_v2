import type { ExactCommandHandlers } from './index';

interface SkillsItem {
	name: string;
	level: number;
}

interface SkillsData {
	[key: string]: SkillsItem[];
	frontend: SkillsItem[];
	backend: SkillsItem[];
	tools: SkillsItem[];
}

interface ExperienceItem {
	title: string;
	company: string;
	location: string;
	period: string;
	description: string[];
	tech: string[];
}

export const buildAboutOverviewOutput = (): string => `ABOUT DYLAN VAN DER VEN

[1] bio        - About me
[2] skills     - Technical skills (with levels)
[3] frameworks - Frameworks & libraries
[4] experience - Work history & timeline

Type a number or command to view`;

export const buildBioOutput = (): string => `BIOGRAPHY

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

Type 'back' to return`;

export const buildSkillsOutput = (skillsData: SkillsData): string => {
	const getProgressBar = (level: number) => {
		const filled = '█'.repeat(level);
		const empty = '░'.repeat(5 - level);
		return filled + empty;
	};

	const skillsOutput = Object.entries(skillsData)
		.map(([category, items]) => {
			const skillsList = items
				.map((skill) => {
					const bar = getProgressBar(skill.level);
					return `  ${skill.name.padEnd(20)} [${bar}] ${skill.level}/5`;
				})
				.join('\n');
			return `[${category.toUpperCase()}]\n${skillsList}`;
		})
		.join('\n\n');

	return `TECHNICAL SKILLS\n\n${skillsOutput}\n\nLegend: █ = Proficient, ░ = Learning\nColors: Red (1-2), Yellow (3), Light Green (4), Dark Green (5)\n\nType 'back' to return`;
};

export const buildFrameworksOutput = (skillsData: SkillsData): string => {
	const frontendList = skillsData.frontend.map((skill) => skill.name).join(', ');
	const backendList = skillsData.backend.map((skill) => skill.name).join(', ');
	const toolsList = skillsData.tools.map((skill) => skill.name).join(', ');

	return `FRAMEWORKS & LIBRARIES

Frontend: ${frontendList}
Backend: ${backendList}
Tools: ${toolsList}

Type 'back' to return`;
};

export const buildExperienceOutput = (experienceData: ExperienceItem[]): string => {
	const experienceOutput = experienceData
		.map((experience) => {
			const descriptions = experience.description.map((description) => `    • ${description}`).join('\n');
			const techStack = `    Tech: ${experience.tech.join(', ')}`;
			return `
[█] ${experience.title}
    ${experience.company} | ${experience.location}
    ${experience.period}

${descriptions}
${techStack}`;
		})
		.join('\n\n');

	return `WORK EXPERIENCE${experienceOutput}\n\nType 'back' to return`;
};

interface AboutCommandDeps {
	addOutput: (content: string, type?: 'output' | 'error') => void;
	showLoading: (callback: () => void) => Promise<void>;
	setSectionsVisited: (updater: (prev: Set<string>) => Set<string>) => void;
	currentSection: 'home' | 'about' | 'projects' | 'contact';
	showAboutOverview: () => void;
	showBioContent: () => void;
	showSkillsContent: () => void;
	showFrameworksContent: () => void;
	showExperienceContent: () => void;
}

export const createAboutCommandHandlers = ({
	addOutput,
	showLoading,
	setSectionsVisited,
	currentSection,
	showAboutOverview,
	showBioContent,
	showSkillsContent,
	showFrameworksContent,
	showExperienceContent,
}: AboutCommandDeps): ExactCommandHandlers => ({
	about: () => {
		setSectionsVisited((prev) => new Set(prev).add('about'));
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
});
