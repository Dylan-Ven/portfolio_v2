import { VALID_THEMES } from '../commandCatalog';
import type { ExactCommandHandlers } from './index';

export const buildThemesOutput = (): string => `AVAILABLE THEMES:

[1]  default         - Modern blue terminal
[2]  green           - Classic green terminal
[3]  amber           - Warm amber terminal
[4]  dracula         - Dracula color scheme
[5]  monokai         - Monokai color scheme
[6]  nord            - Nord color scheme
[7]  high-contrast   - WCAG AAA accessibility
[8]  solarized-dark  - Solarized Dark
[9]  solarized-light - Solarized Light
[10] gruvbox         - Gruvbox retro theme
[11] tokyo-night     - Tokyo Night theme
[12] one-dark        - One Dark theme
[13] synthwave       - Synthwave 80s neon
[14] matrix          - Matrix green code
[15] cyberpunk       - Cyberpunk 2077 style

Use: theme <name>
Example: theme tokyo-night`;

interface ThemeCommandDeps {
	showThemesOutput: () => void;
}

interface ThemeParserDeps {
	trimmedCmd: string;
	addOutput: (content: string, type?: 'output' | 'error') => void;
	applyThemePreference: (themeName: string) => void;
}

export const createThemeCommandHandlers = ({
	showThemesOutput,
}: ThemeCommandDeps): ExactCommandHandlers => ({
	themes: showThemesOutput,
});

export const handleThemeCommand = ({
	trimmedCmd,
	addOutput,
	applyThemePreference,
}: ThemeParserDeps): boolean => {
	if (!trimmedCmd.startsWith('theme ')) {
		return false;
	}

	const themeName = trimmedCmd.substring(6).trim();

	if (VALID_THEMES.includes(themeName as typeof VALID_THEMES[number])) {
		applyThemePreference(themeName);
		addOutput(`✓ Theme changed to: ${themeName}`);
		return true;
	}

	addOutput(`ERROR: Invalid theme '${themeName}'\nAvailable themes: ${VALID_THEMES.join(', ')}`, 'error');
	return true;
};
