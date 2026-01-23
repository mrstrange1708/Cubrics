const CubieCube = require('./CubieCube');
const CoordCube = require('./CoordCube');

class Tables {
    constructor() {
        this.twistMove = null;
        this.flipMove = null;
        this.sliceMove = null;

        this.twistPruning = null;
        this.flipPruning = null;
        this.slicePruning = null;

        this.twistSlicePruning = null;
        this.flipSlicePruning = null;

        this.cpMove = null;
        this.udepMove = null;
        this.sliceepMove = null;

        this.cpPruning = null;
        this.udepPruning = null;
        this.sliceepPruning = null;
    }

    init() {
        if (this.twistMove) return;

        console.log('[Solver] Generating Phase 1 tables...');
        this.twistMove = this.generateMoveTable('twist', 2187);
        this.flipMove = this.generateMoveTable('flip', 2048);
        this.sliceMove = this.generateMoveTable('slice', 495);

        // Standard pruning for single coordinates (fallback/P1)
        this.twistPruning = this.generatePruningTable(this.twistMove, 2187);
        this.flipPruning = this.generatePruningTable(this.flipMove, 2048);
        this.slicePruning = this.generatePruningTable(this.sliceMove, 495);

        // COMBINED HIGH-PERFORMANCE PRUNING
        console.log('[Solver] Generating combined pruning tables...');
        this.twistSlicePruning = this.generateCombinedPruningTable(this.twistMove, this.sliceMove, 2187, 495);
        this.flipSlicePruning = this.generateCombinedPruningTable(this.flipMove, this.sliceMove, 2048, 495);

        console.log('[Solver] Generating Phase 2 tables...');
        this.cpMove = this.generateMoveTable('cp', 40320);
        this.udepMove = this.generateMoveTable('udep', 40320);
        this.sliceepMove = this.generateMoveTable('sliceep', 24);

        const p2Moves = [0, 6, 7, 5, 16, 17, 8, 10, 12, 14];
        this.cpPruning = this.generatePruningTable(this.cpMove, 40320, p2Moves);
        this.udepPruning = this.generatePruningTable(this.udepMove, 40320, p2Moves);
        this.sliceepPruning = this.generatePruningTable(this.sliceepMove, 24, p2Moves);

        console.log('[Solver] Tables ready.');
    }

    generateMoveTable(type, size) {
        const table = new Array(size);
        const moves = CubieCube.getBasicMoves();
        const moveKeys = Object.keys(moves);

        for (let i = 0; i < size; i++) {
            table[i] = new Int32Array(moveKeys.length);
            const cubie = this.createCubieFromCoord(type, i);

            moveKeys.forEach((key, moveIdx) => {
                const moved = cubie.multiply(moves[key]);
                const coord = new CoordCube(moved);
                table[i][moveIdx] = coord[type];
            });
        }
        return table;
    }

    generatePruningTable(moveTable, size, allowedMoves = null) {
        const table = new Int8Array(size).fill(20);
        table[0] = 0;
        let visited = 1;
        let depth = 0;

        const actualMoves = allowedMoves || [...Array(18).keys()];

        while (visited < size && depth < 15) {
            for (let i = 0; i < size; i++) {
                if (table[i] === depth) {
                    for (let m of actualMoves) {
                        const next = moveTable[i][m];
                        if (table[next] === 20) {
                            table[next] = depth + 1;
                            visited++;
                        }
                    }
                }
            }
            depth++;
            if (depth > 14 && visited < size) break; // Safety
        }
        return table;
    }

    generateCombinedPruningTable(moveTable1, moveTable2, size1, size2) {
        const totalSize = size1 * size2;
        const table = new Int8Array(totalSize).fill(20);
        table[0] = 0;

        let queue = [0];
        let depth = 0;

        while (queue.length > 0 && depth < 12) {
            let nextQueue = [];
            for (let i = 0; i < queue.length; i++) {
                const idx = queue[i];
                const c1 = Math.floor(idx / size2);
                const c2 = idx % size2;

                for (let m = 0; m < 18; m++) {
                    const n1 = moveTable1[c1][m];
                    const n2 = moveTable2[c2][m];
                    const nextIdx = n1 * size2 + n2;
                    if (table[nextIdx] === 20) {
                        table[nextIdx] = depth + 1;
                        nextQueue.push(nextIdx);
                    }
                }
            }
            queue = nextQueue;
            depth++;
        }
        return table;
    }
    createCubieFromCoord(type, coord) {
        const c = new CubieCube();
        if (type === 'twist') {
            let twist = coord;
            let check = 0;
            for (let i = 6; i >= 0; i--) {
                c.co[i] = twist % 3;
                check += c.co[i];
                twist = Math.floor(twist / 3);
            }
            c.co[7] = (3 - (check % 3)) % 3;
        } else if (type === 'flip') {
            let flip = coord;
            let check = 0;
            for (let i = 10; i >= 0; i--) {
                c.eo[i] = flip % 2;
                check += c.eo[i];
                flip = Math.floor(flip / 2);
            }
            c.eo[11] = (2 - (check % 2)) % 2;
        } else if (type === 'slice') {
            let slice = 494 - coord;
            c.ep.fill(-1);
            let x = 4;
            for (let i = 11; i >= 0; i--) {
                if (slice >= this.C(i, x)) {
                    c.ep[i] = 7 + x; // x=4->11, x=3->10, x=2->9, x=1->8
                    slice -= this.C(i, x);
                    x--;
                }
            }
            // Fill remaining edges
            let fill = 0;
            for (let i = 0; i < 12; i++) {
                if (c.ep[i] === -1) {
                    while (fill >= 8 && fill <= 11) fill++;
                    c.ep[i] = fill++;
                }
            }
        } else if (type === 'cp') {
            let cp = coord;
            let p = [0, 1, 2, 3, 4, 5, 6, 7];
            for (let i = 0; i < 8; i++) {
                let fact = 1;
                for (let j = 1; j <= 7 - i; j++) fact *= j;
                let index = Math.floor(cp / fact);
                cp %= fact;
                c.cp[i] = p.splice(index, 1)[0];
            }
        } else if (type === 'udep') {
            let ep = coord;
            let p = [0, 1, 2, 3, 4, 5, 6, 7];
            for (let i = 0; i < 8; i++) {
                let fact = 1;
                for (let j = 1; j <= 7 - i; j++) fact *= j;
                let index = Math.floor(ep / fact);
                ep %= fact;
                c.ep[i] = p.splice(index, 1)[0];
            }
        } else if (type === 'sliceep') {
            let ep = coord;
            let p = [8, 9, 10, 11];
            for (let i = 8; i < 12; i++) {
                let fact = 1;
                for (let j = 1; j <= 11 - i; j++) fact *= j;
                let index = Math.floor(ep / fact);
                ep %= fact;
                c.ep[i] = p.splice(index, 1)[0];
            }
        }
        return c;
    }

    C(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let res = 1;
        for (let i = 1; i <= k; i++) {
            res = res * (n - i + 1) / i;
        }
        return res;
    }
}

module.exports = new Tables();
