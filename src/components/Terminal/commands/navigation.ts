import type { ExactCommandHandlers } from './index';

export const buildHomeOutput = (activity: string): string => `  ____            _    __       _ _
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

interface NavigationCommandDeps {
	addOutput: (content: string, type?: 'output' | 'error') => void;
	clearHistory: () => void;
	showLoading: (callback: () => void) => Promise<void>;
	showHomeContent: () => void;
	buildHomeOutput: (activity: string) => string;
	discordActivity: string;
	setSectionsVisited: (updater: (prev: Set<string>) => Set<string>) => void;
	currentSubsection: string | null;
	currentSection: 'home' | 'about' | 'projects' | 'contact';
	setCurrentSubsection: (value: string | null) => void;
	showAboutOverview: () => void;
	showProjectsOverview: () => void;
	showProjectsAliasListing: () => void;
}

export const createNavigationCommandHandlers = ({
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
}: NavigationCommandDeps): ExactCommandHandlers => ({
	home: () => {
		setSectionsVisited((prev) => new Set(prev).add('home'));
		void showLoading(() => {
			clearHistory();
			showHomeContent();
			addOutput(buildHomeOutput(discordActivity));
		});
	},
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
	ls: showProjectsAliasListing,
});

interface CdCommandDeps {
	trimmedCmd: string;
	currentVirtualPathParts: string[];
	createProjectSlug: (value: string) => string;
	majorProjects: Array<{ name: string }>;
	minorProjects: Array<{ name: string }>;
	openProjectDetails: (category: 'major' | 'minor', projectIndex: number) => void;
	executeCommand: (command: string) => void;
	addOutput: (content: string, type?: 'output' | 'error') => void;
	openContactByPath: (contactPath: string) => boolean;
	triggerResumeDownload: () => void;
}

export const handleCdCommand = ({
	trimmedCmd,
	currentVirtualPathParts,
	createProjectSlug,
	majorProjects,
	minorProjects,
	openProjectDetails,
	executeCommand,
	addOutput,
	openContactByPath,
	triggerResumeDownload,
}: CdCommandDeps): boolean => {
	if (!trimmedCmd.startsWith('cd ')) {
		return false;
	}

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

	const normalizedTarget = target.replace(/\/+/g, '/').replace(/\/$/, '');

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

		const localParts = resolvedParts[1] === 'dylan' ? resolvedParts.slice(2) : resolvedParts.slice(1);

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
			if (!second || second === 'dylan_van_der_ven_resume.pdf' || second === 'cv-dylan.pdf') {
				triggerResumeDownload();
				return true;
			}
			return false;
		}

		return false;
	};

	if (normalizedTarget === '' || normalizedTarget === '/') {
		executeCommand('home');
		return true;
	}

	const resolvedParts = resolvePathParts(target);
	if (navigateToResolvedPath(resolvedParts)) {
		return true;
	}

	const fallbackSections = ['home', 'about', 'projects', 'contact'];
	if (fallbackSections.includes(normalizedTarget)) {
		executeCommand(normalizedTarget);
		return true;
	}

	addOutput(`cd: ${target}: No such file or directory`, 'error');
	return true;
};
