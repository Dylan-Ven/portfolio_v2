import type { ExactCommandHandlers } from './index';

interface EasterEggCommandDeps {
	addOutput: (content: string, type?: 'output' | 'error') => void;
	addOutputWithDelay: (lines: string[]) => Promise<void>;
	setSudoMode: (enabled: boolean) => void;
}

const JOKES: string[][] = [
	['Why do programmers prefer dark mode?', '', 'Because light attracts bugs!'],
	["Why do Java developers wear glasses?", '', "Because they don't C#!"],
	['How many programmers does it take to change a light bulb?', '', "None. It's a hardware problem!"],
	['Why did the programmer quit his job?', '', "Because he didn't get arrays!"],
];

const SECRETS: string[][] = [
	['You found the secret command!', 'There is no secret... or is there?', 'Try exploring more commands!'],
	['Secret discovered!', 'The real secret is the code we wrote along the way.'],
	["Easter egg unlocked!", "Congratulations! You're now officially a command explorer."],
	['Hidden gem found!', "You have excellent curiosity. That's what makes great developers!"],
];

const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const createEasterEggCommandHandlers = ({
	addOutput,
	addOutputWithDelay,
	setSudoMode,
}: EasterEggCommandDeps): ExactCommandHandlers => ({
	matrix: () => {
		void addOutputWithDelay([
			'Wake up, Neo...',
			'The Matrix has you.',
			'Follow the white rabbit.',
			'',
			'Knock, knock, Neo.',
		]);
	},
	coffee: () => {
		void addOutputWithDelay([
			'Setting perfect temperature...',
			'Adding milk...',
			'Brewing coffee...',
			'',
			`       (  )   (   )  )
				) (   )  (  (
				( )  (    ) )
				_____________
			 <_____________> ___
			 |             |/ _ \\
			 |               | | |
			 |               |_| |
		___|             |\\___/
	 /    \\___________/    \\
	 \\_____________________/`,
		]);
	},
	joke: () => {
		void addOutputWithDelay(randomItem(JOKES));
	},
	secret: () => {
		void addOutputWithDelay(randomItem(SECRETS));
	},
	sudo: () => {
		addOutput('[sudo] password for dylan:');
		setSudoMode(true);
	},
	whoami: () => {
		void addOutputWithDelay([
			'You are: A curious developer',
			"Location: Viewing Dylan's portfolio",
			'Mission: Exploring terminal commands',
			'Status: Awesome!',
		]);
	},
	ping: () => {
		void addOutputWithDelay([
			'PING portfolio.dylan.dev',
			'64 bytes from awesome: icmp_seq=1 ttl=64 time=0.1 ms',
			'64 bytes from impressive: icmp_seq=2 ttl=64 time=0.1 ms',
			'64 bytes from hire_me: icmp_seq=3 ttl=64 time=0.1 ms',
		]);
	},
	fortune: () => {
		void addOutputWithDelay([
			'Your fortune: You will discover an amazing developer today.',
			"Hint: You're already looking at his portfolio!",
		]);
	},
});

interface HackLine {
	type: 'input' | 'output' | 'error';
	content: string;
}

interface HackCommandDeps {
	trimmedCmd: string;
	addOutput: (content: string, type?: 'output' | 'error') => void;
	addOutputWithDelay: (lines: string[]) => Promise<void>;
	setHistory: (updater: (prev: HackLine[]) => HackLine[]) => void;
}

export const handleHackCommand = ({
	trimmedCmd,
	addOutput,
	addOutputWithDelay,
	setHistory,
}: HackCommandDeps): boolean => {
	if (trimmedCmd !== 'hack') {
		return false;
	}

	addOutput('[INITIALIZING HACKING SEQUENCE...]');

	let progress = 0;

	const updateProgress = () => {
		if (progress >= 100) {
			progress = 100;
			const filled = 20;
			const bar = '█'.repeat(filled);

			setHistory((prev) => {
				const newHistory = [...prev];
				if (newHistory.length > 0 && newHistory[newHistory.length - 1].content.includes('%')) {
					newHistory[newHistory.length - 1] = { type: 'output', content: `[${bar}] ${progress.toFixed(1)}%` };
				}
				return newHistory;
			});

			setTimeout(() => {
				void addOutputWithDelay([
					'',
					'ACCESS GRANTED',
					"You're in Dylan's gaming library",
					'',
					'Just kidding. Nice try though!',
				]);
			}, 300);
			return;
		}

		const increment = Math.random() * 2.2 + 1.0;
		progress = Math.min(progress + increment, 100);

		const filled = Math.floor((progress / 100) * 20);
		const empty = 20 - filled;
		const bar = '█'.repeat(filled) + '░'.repeat(empty);

		setHistory((prev) => {
			const newHistory = [...prev];
			if (newHistory.length > 0 && newHistory[newHistory.length - 1].content.includes('%')) {
				newHistory[newHistory.length - 1] = { type: 'output', content: `[${bar}] ${progress.toFixed(1)}%` };
			} else {
				newHistory.push({ type: 'output', content: `[${bar}] ${progress.toFixed(1)}%` });
			}
			return newHistory;
		});

		const delay = Math.random() * 100 + 50;
		setTimeout(updateProgress, delay);
	};

	updateProgress();
	return true;
};
