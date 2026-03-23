import type { ExactCommandHandlers } from './index';

interface ContactCommandDeps {
	setSectionsVisited: (updater: (prev: Set<string>) => Set<string>) => void;
	showLoading: (callback: () => void) => Promise<void>;
	showContactOverview: () => void;
}

export const createContactCommandHandlers = ({
	setSectionsVisited,
	showLoading,
	showContactOverview,
}: ContactCommandDeps): ExactCommandHandlers => ({
	contact: () => {
		setSectionsVisited((prev) => new Set(prev).add('contact'));
		void showLoading(showContactOverview);
	},
});

interface ContactItem {
	label: string;
	value: string;
	link?: string;
}

export const buildContactOverviewOutput = (contactData: ContactItem[], discordActivity: string): string => {
	const contactOutput = contactData
		.map((contact, index) => {
			let line = `[${index + 1}] ${contact.label.padEnd(10)} ${contact.value}`;
			if (contact.label === 'EMAIL') {
				line += '  ⚠ Slow response';
			}
			return line;
		})
		.join('\n');

	return `CONTACT DYLAN VAN DER VEN

Status: ${discordActivity}
Location: Netherlands 🇳🇱
Timezone: CET (UTC+1)

${contactOutput}

Type a number (1-${contactData.length}) to copy, or use quick commands:
  github     - Open GitHub profile
  linkedin   - Open LinkedIn profile
  email      - Open email client
  instagram  - Open Instagram profile`;
};

interface ContactByPathDeps {
	contactPath: string;
	contactData: ContactItem[];
	addOutput: (content: string, type?: 'output' | 'error') => void;
	handleCopy: (text: string, label: string) => void;
}

export const handleContactByPath = ({
	contactPath,
	contactData,
	addOutput,
	handleCopy,
}: ContactByPathDeps): boolean => {
	const key = contactPath.replace(/\.link$/i, '');
	const contact = contactData.find((item) => item.label.toLowerCase() === key);
	if (!contact) {
		return false;
	}

	if (contact.link && contact.link !== '#') {
		addOutput(`Opening ${key}...`);
		window.open(contact.link, '_blank');
	} else {
		handleCopy(contact.value, contact.label);
	}

	return true;
};

interface ContactShortcutDeps {
	trimmedCmd: string;
	currentSection: 'home' | 'about' | 'projects' | 'contact';
	contactData: ContactItem[];
	addOutput: (content: string, type?: 'output' | 'error') => void;
}

export const handleContactShortcutCommand = ({
	trimmedCmd,
	currentSection,
	contactData,
	addOutput,
}: ContactShortcutDeps): boolean => {
	if (currentSection !== 'contact') {
		return false;
	}

	const contact = contactData.find((item) => item.label.toLowerCase() === trimmedCmd);
	if (!contact || !contact.link || contact.link === '#') {
		return false;
	}

	addOutput(`Opening ${trimmedCmd}...`);
	window.open(contact.link, '_blank');
	return true;
};
