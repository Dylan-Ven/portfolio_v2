import type { ExactCommandHandlers } from './index';

interface HelpProjectItem {
	link?: string;
	webapp?: string;
}

export const buildHelpOutput = ({
	currentSection,
	currentSubsection,
	majorProjects,
	minorProjects,
	contactCount,
}: {
	currentSection: 'home' | 'about' | 'projects' | 'contact';
	currentSubsection: string | null;
	majorProjects: HelpProjectItem[];
	minorProjects: HelpProjectItem[];
	contactCount: number;
}): string => {
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
		'  matrix, hack, coffee, sudo, whoami, ping, fortune, joke, secret',
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
			sectionCommands.push(`  Current subsection: ${currentSubsection}`, '  back       - Return to about menu');
		}
	}

	if (currentSection === 'projects') {
		sectionCommands.push('SECTION COMMANDS (PROJECTS):');

		if (!currentSubsection) {
			sectionCommands.push('  major      - View major projects', '  minor      - View minor projects', '  [1-2]      - Use number shortcuts');
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
			`  [1-${contactCount}]      - Copy contact info`,
		);
	}

	return [...globalCommands, '', ...sectionCommands].join('\n');
};

export const buildStatsOutput = ({
	sessionStart,
	commandFrequency,
	sectionsVisited,
	commandCount,
	commandHistoryLength,
}: {
	sessionStart: number;
	commandFrequency: Map<string, number>;
	sectionsVisited: Set<string>;
	commandCount: number;
	commandHistoryLength: number;
}): string => {
	const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);
	const minutes = Math.floor(sessionTime / 60);
	const seconds = sessionTime % 60;
	const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
	const mostUsedCmd = Array.from(commandFrequency.entries()).sort((a, b) => b[1] - a[1])[0];
	const sectionsStr = Array.from(sectionsVisited).join(', ');

	return `SESSION STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session Time:      ${timeStr}
Commands Run:       ${commandCount}
Sections Visited:  ${sectionsVisited.size} (${sectionsStr})
Most Used Command: ${mostUsedCmd ? `${mostUsedCmd[0]} (${mostUsedCmd[1]}x)` : 'N/A'}
Commands in History: ${commandHistoryLength}

Keep exploring!`;
};

export const buildNeofetchOutput = ({
	sessionStart,
	currentTheme,
	discordActivity,
}: {
	sessionStart: number;
	currentTheme: string;
	discordActivity: string;
}): string => {
	const sessionMinutes = Math.max(1, Math.floor((Date.now() - sessionStart) / 60000));
	return ` _   _  ____ _____
| \\ | |/ ___|_   _|  OS: NST.v2 (NiSuTe Kernel)
|  \\| |\\___ \\ | |    Host: Dylan's Portfolio
| |\\  | ___) || |    Uptime: ${sessionMinutes} mins
|_| \\_|____/ |_|     Shell: dsh (dylan-sh)
                     Theme: ${currentTheme}
                     Discord: ${discordActivity}`;
};

interface BacklogItem {
	id: number;
	topic: string;
	status: 'learning' | 'building' | 'researching' | 'done';
	focus: string;
	eta: string;
	priority: 'high' | 'medium' | 'low';
}

export const buildBacklogResponse = (learningBacklog: BacklogItem[], subcommand = 'all'): { content: string; type: 'output' | 'error' } => {
	const statusIcon: Record<'learning' | 'building' | 'researching' | 'done', string> = {
		learning: '📚',
		building: '🛠',
		researching: '🔍',
		done: '✅',
	};

	const formatBacklogItem = (item: BacklogItem) => {
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
		return {
			content: `Invalid backlog option: ${subcommand}\nUse: backlog | backlog next | backlog focus | backlog done`,
			type: 'error',
		};
	}

	if (filteredItems.length === 0) {
		return {
			content: `${title}\n\nNo items found for this filter.`,
			type: 'error',
		};
	}

	const output = filteredItems.map(formatBacklogItem).join('\n\n');
	return {
		content: `${title}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${output}`,
		type: 'output',
	};
};

interface SystemCommandDeps {
	addOutput: (content: string, type?: 'output' | 'error') => void;
	getHelpOutput: () => string;
	clearHistory: () => void;
	toggleTreePanel: () => void;
	runGitPushPrank: () => void;
	showStatsOutput: () => void;
	showNeofetchOutput: () => void;
	showBacklogOutput: (subcommand?: string) => void;
	setDebugPreference: (enabled: boolean) => void;
	setCustomPrompt: (value: string) => void;
}

export const createSystemCommandHandlers = ({
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
}: SystemCommandDeps): ExactCommandHandlers => ({
	help: () => addOutput(getHelpOutput()),
	clear: clearHistory,
	tree: toggleTreePanel,
	'git-push': runGitPushPrank,
	stats: showStatsOutput,
	neofetch: showNeofetchOutput,
	backlog: () => showBacklogOutput(),
	'debug-on': () => setDebugPreference(true),
	'debug-off': () => setDebugPreference(false),
	'prompt-reset': () => {
		setCustomPrompt('$');
		addOutput('✓ Prompt reset to default: $');
	},
});

interface ResumeInstallDeps {
	trimmedCmd: string;
	triggerResumeDownload: () => void;
}

export const handleResumeInstallCommand = ({
	trimmedCmd,
	triggerResumeDownload,
}: ResumeInstallDeps): boolean => {
	if (trimmedCmd !== 'npm install resume' && trimmedCmd !== 'npm i resume') {
		return false;
	}

	triggerResumeDownload();
	return true;
};

interface BacklogFilterDeps {
	trimmedCmd: string;
	showBacklogOutput: (subcommand?: string) => void;
}

export const handleBacklogFilterCommand = ({
	trimmedCmd,
	showBacklogOutput,
}: BacklogFilterDeps): boolean => {
	if (trimmedCmd === 'backlog' || trimmedCmd.startsWith('backlog ')) {
		const subcommand = trimmedCmd.split(' ')[1] ?? 'all';
		showBacklogOutput(subcommand);
		return true;
	}

	return false;
};

interface PromptSetDeps {
	trimmedCmd: string;
	sanitizedCmd: string;
	setCustomPrompt: (value: string) => void;
	addOutput: (content: string, type?: 'output' | 'error') => void;
}

export const handlePromptSetCommand = ({
	trimmedCmd,
	sanitizedCmd,
	setCustomPrompt,
	addOutput,
}: PromptSetDeps): boolean => {
	if (!trimmedCmd.startsWith('prompt set ')) {
		return false;
	}

	const newPrompt = sanitizedCmd.substring('prompt set '.length).trim();
	if (newPrompt && newPrompt.length > 0) {
		setCustomPrompt(newPrompt);
		addOutput(`✓ Prompt changed to: ${newPrompt}`);
	} else {
		addOutput('ERROR: Prompt cannot be empty', 'error');
	}

	return true;
};
