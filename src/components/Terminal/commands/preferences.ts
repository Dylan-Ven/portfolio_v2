import type { ExactCommandHandlers } from './index';

interface PreferenceCommandDeps {
	setTypingPreference: (enabled: boolean) => void;
	setSoundPreference: (enabled: boolean) => void;
	setCrtPreference: (enabled: boolean) => void;
}

export const createPreferenceCommandHandlers = ({
	setTypingPreference,
	setSoundPreference,
	setCrtPreference,
}: PreferenceCommandDeps): ExactCommandHandlers => ({
	'typing-on': () => setTypingPreference(true),
	'typing-off': () => setTypingPreference(false),
	'sound-on': () => setSoundPreference(true),
	'sound-off': () => setSoundPreference(false),
	'crt-on': () => setCrtPreference(true),
	'crt-off': () => setCrtPreference(false),
});
