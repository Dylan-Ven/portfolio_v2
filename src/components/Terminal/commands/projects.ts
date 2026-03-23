import type { ExactCommandHandlers } from './index';

interface ProjectSummaryItem {
	name: string;
	description: string;
	tech?: string[];
	status?: string;
	link?: string;
	webapp?: string;
}

export const buildProjectsOverviewOutput = (majorCount: number, minorCount: number): string => `PROJECTS

[1] major   - Major projects (${majorCount})
[2] minor   - Minor projects (${minorCount})

Type a number or 'major'/'minor' to view category`;

export const buildProjectsAliasOutput = (projects: ProjectSummaryItem[]): string => {
	const projectsList = projects
		.map((project, index) => `[${index + 1}] ${project.name} - ${project.description}`)
		.join('\n');

	return `PROJECTS\n\n${projectsList}\n\nType a number (1-${projects.length}) to view details`;
};

export const buildProjectListOutput = (title: string, projects: ProjectSummaryItem[]): string => {
	const list = projects.map((project, index) => `[${index + 1}] ${project.name}`).join('\n');
	return `${title}\n\n${list}\n\nType a number (1-${projects.length}) to view details`;
};

export const buildProjectDetailsOutput = (project: ProjectSummaryItem): string => {
	const commands = [
		project.link ? '[1] github - Open GitHub repository' : '',
		project.webapp ? '[2] webapp - Open live application' : '',
	]
		.filter(Boolean)
		.join('\n');

	const commandsSection = commands ? `\n\nCommands:\n${commands}` : '';

	return `PROJECT: ${project.name}

Description: ${project.description}
Technologies: ${project.tech?.join(', ') ?? ''}
Status: ● ${project.status ?? ''}${project.link ? `\nGitHub: ${project.link}` : ''}${project.webapp ? `\nLive: ${project.webapp}` : ''}${commandsSection}

Type 'back' to return`;
};

interface ProjectsCommandDeps {
	setSectionsVisited: (updater: (prev: Set<string>) => Set<string>) => void;
	showLoading: (callback: () => void) => Promise<void>;
	showProjectsOverview: () => void;
	showMajorProjectsList: () => void;
	showMinorProjectsList: () => void;
}

export const createProjectsCommandHandlers = ({
	setSectionsVisited,
	showLoading,
	showProjectsOverview,
	showMajorProjectsList,
	showMinorProjectsList,
}: ProjectsCommandDeps): ExactCommandHandlers => ({
	projects: () => {
		setSectionsVisited((prev) => new Set(prev).add('projects'));
		void showLoading(showProjectsOverview);
	},
	major: showMajorProjectsList,
	minor: showMinorProjectsList,
});

interface ProjectItem {
	link?: string;
	webapp?: string;
}

interface ProjectContextShortcutDeps {
	trimmedCmd: string;
	currentSubsection: string | null;
	majorProjects: ProjectItem[];
	minorProjects: ProjectItem[];
	addOutput: (content: string, type?: 'output' | 'error') => void;
}

export const handleProjectContextShortcutCommand = ({
	trimmedCmd,
	currentSubsection,
	majorProjects,
	minorProjects,
	addOutput,
}: ProjectContextShortcutDeps): boolean => {
	if (!currentSubsection?.includes('-project-')) {
		return false;
	}

	if (trimmedCmd !== 'github' && trimmedCmd !== 'webapp') {
		return false;
	}

	const [category, , projectNum] = currentSubsection.split('-');
	const projects = category === 'major' ? majorProjects : minorProjects;
	const projectIndex = parseInt(projectNum, 10) - 1;
	const project = projects[projectIndex];

	if (!project) {
		addOutput('Project not found', 'error');
		return true;
	}

	if (trimmedCmd === 'github') {
		if (project.link) {
			addOutput(`Opening GitHub: ${project.link}`);
			window.open(project.link, '_blank');
		} else {
			addOutput('No GitHub repository available for this project', 'error');
		}
		return true;
	}

	if (project.webapp) {
		addOutput(`Opening live webapp: ${project.webapp}`);
		window.open(project.webapp, '_blank');
	} else {
		addOutput('No live webapp available for this project', 'error');
	}
	return true;
};
