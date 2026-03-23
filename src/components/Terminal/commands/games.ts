import type { ExactCommandHandlers } from './index';

interface GameCommandDeps {
	launchTetris: () => void;
	launchSnake: () => void;
}

export const createGameCommandHandlers = ({
	launchTetris,
	launchSnake,
}: GameCommandDeps): ExactCommandHandlers => ({
	tetris: launchTetris,
	snake: launchSnake,
});
