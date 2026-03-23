import type { ExactCommandId } from '../commandCatalog';

export type ExactCommandHandlers = Partial<Record<ExactCommandId, () => void>>;

export { buildHomeOutput, createNavigationCommandHandlers } from './navigation';
export { buildAboutOverviewOutput, buildBioOutput, buildExperienceOutput, buildFrameworksOutput, buildSkillsOutput, createAboutCommandHandlers } from './about';
export { buildProjectDetailsOutput, buildProjectListOutput, buildProjectsAliasOutput, buildProjectsOverviewOutput, createProjectsCommandHandlers, handleProjectContextShortcutCommand } from './projects';
export { buildContactOverviewOutput, createContactCommandHandlers, handleContactByPath, handleContactShortcutCommand } from './contact';
export { buildBacklogResponse, buildHelpOutput, buildNeofetchOutput, buildStatsOutput, createSystemCommandHandlers, handleBacklogFilterCommand, handlePromptSetCommand, handleResumeInstallCommand } from './system';
export { buildThemesOutput, createThemeCommandHandlers, handleThemeCommand } from './themes';
export { createPreferenceCommandHandlers } from './preferences';
export { createGameCommandHandlers } from './games';
export { createEasterEggCommandHandlers, handleHackCommand } from './easter-eggs';
export { handleCdCommand } from './navigation';
