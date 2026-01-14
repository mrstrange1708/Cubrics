export const generateScramble = (length: number = 20): string => {
    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    const suffixes = ['', "'", '2'];
    const scramble: string[] = [];

    let lastMove = -1;
    let secondLastMove = -1;

    const getAxis = (m: number) => Math.floor(m / 2);

    for (let i = 0; i < length; i++) {
        let moveIdx;
        while (true) {
            moveIdx = Math.floor(Math.random() * moves.length);

            // 1. Cannot be same as last move
            if (moveIdx === lastMove) continue;

            // 2. If same axis as last move (e.g. U D), and same axis as second last (e.g. U D U), prevent it
            // This prevents "U D U" or "R L R" sequences which are redundant/annoying
            if (lastMove !== -1 && secondLastMove !== -1) {
                if (getAxis(moveIdx) === getAxis(lastMove) && getAxis(moveIdx) === getAxis(secondLastMove)) {
                    continue;
                }
            }
            break;
        }

        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        scramble.push(`${moves[moveIdx]}${suffix}`);

        secondLastMove = lastMove;
        lastMove = moveIdx;
    }

    return scramble.join(' ');
};
