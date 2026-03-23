/**
 * Terminal command runtime — lazy-loaded chunk.
 *
 * Everything in here is only needed when the user types a command, so it is
 * imported dynamically on the first interaction.  Keeping this separate from
 * the boot path lets Next.js/Turbopack split it into its own chunk and defer
 * its parse/evaluation cost until it is actually required.
 */

// ── Portfolio data ─────────────────────────────────────────────────────────
export {
  projectsData,
  majorProjects,
  minorProjects,
  skillsData,
  contactData,
  experienceData,
  learningBacklog,
} from '@/data/portfolio';

// ── Command catalog (resolve / sanitize helpers) ───────────────────────────
export {
  AVAILABLE_COMMANDS,
  normalizeCommandInput,
  resolveExactCommand,
  sanitizeCommandInput,
} from './commandCatalog';

// ── Command output builders ────────────────────────────────────────────────
export {
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

// ── Pure utils needed only at command-execute time ─────────────────────────
export {
  createProjectSlug,
  findSimilarCommand,
} from './utils/commands';
