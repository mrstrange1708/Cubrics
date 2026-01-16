const CubieCube = require('./CubieCube');
const CoordCube = require('./CoordCube');
const tables = require('./Tables');

class Search {
    constructor() {
        this.moves = Object.keys(CubieCube.getBasicMoves());
        this.phase2MoveIndices = [0, 6, 7, 5, 16, 17, 8, 10, 12, 14];
        this.bestSolution = null;
        this.minTotalDepth = 99;
    }

    solve(cube) {
        tables.init();
        this.bestSolution = null;
        this.minTotalDepth = 25;
        const startTime = Date.now();
        const MAX_TIME = 10000;

        const startCoord = new CoordCube(cube);

        // IDA* search
        for (let depth1 = 0; depth1 < 21; depth1++) {
            if (this.searchPhase1(
                startCoord.twist,
                startCoord.flip,
                startCoord.slice,
                depth1,
                [],
                startTime,
                MAX_TIME,
                cube
            )) break;
            if (Date.now() - startTime > MAX_TIME) break;
        }

        if (!this.bestSolution) return null;
        return this.simplifyMoves(this.bestSolution).join(' ');
    }

    searchPhase1(twist, flip, slice, depth, path, startTime, maxTime, cubie) {
        const minDist = Math.max(
            tables.twistSlicePruning[twist * 495 + slice],
            tables.flipSlicePruning[flip * 495 + slice],
            tables.twistPruning[twist],
            tables.flipPruning[flip],
            tables.slicePruning[slice]
        );
        if (minDist > depth) return false;

        if (depth === 0) {
            if (twist === 0 && flip === 0 && slice === 0) {
                // Phase 1 Goal! Apply path to actual cubie
                let p2Cubie = cubie;
                const m = CubieCube.getBasicMoves();
                path.forEach(ms => { p2Cubie = p2Cubie.multiply(m[ms]); });

                const p2Coord = new CoordCube(p2Cubie);
                const maxD2 = this.minTotalDepth - path.length;
                for (let d2 = 0; d2 < maxD2; d2++) {
                    const res2 = this.searchPhase2(
                        p2Coord.cp,
                        p2Coord.udep,
                        p2Coord.sliceep,
                        d2,
                        path,
                        startTime,
                        maxTime
                    );
                    if (res2) {
                        this.bestSolution = res2;
                        this.minTotalDepth = res2.length;
                        return true;
                    }
                }
            }
            return false;
        }

        if (Date.now() - startTime > maxTime) return false;

        const lastFace = path.length > 0 ? path[path.length - 1][0] : null;

        for (let i = 0; i < 18; i++) {
            const moveName = this.moves[i];
            if (moveName[0] === lastFace) continue;

            const nextTwist = tables.twistMove[twist][i];
            const nextFlip = tables.flipMove[flip][i];
            const nextSlice = tables.sliceMove[slice][i];

            if (this.searchPhase1(nextTwist, nextFlip, nextSlice, depth - 1, [...path, moveName], startTime, maxTime, cubie)) return true;
        }
        return false;
    }

    searchPhase2(cp, udep, sliceep, depth, path, startTime, maxTime) {
        const minDist = Math.max(
            tables.cpPruning[cp],
            tables.udepPruning[udep],
            tables.sliceepPruning[sliceep]
        );
        if (minDist > depth) return null;

        if (depth === 0) {
            return (cp === 0 && udep === 0 && sliceep === 0) ? path : null;
        }

        if (Date.now() - startTime > maxTime) return null;

        const lastFace = path.length > 0 ? path[path.length - 1][0] : null;

        for (let i = 0; i < this.phase2MoveIndices.length; i++) {
            const moveIdx = this.phase2MoveIndices[i];
            const moveName = this.moves[moveIdx];
            if (moveName[0] === lastFace) continue;

            const res = this.searchPhase2(
                tables.cpMove[cp][moveIdx],
                tables.udepMove[udep][moveIdx],
                tables.sliceepMove[sliceep][moveIdx],
                depth - 1,
                [...path, moveName],
                startTime,
                maxTime
            );
            if (res) return res;
        }
        return null;
    }

    simplifyMoves(moves) {
        if (moves.length === 0) return [];
        const result = [];
        for (let move of moves) {
            if (result.length > 0 && result[result.length - 1][0] === move[0]) {
                const last = result.pop();
                const combined = this.combineMoves(last, move);
                if (combined) result.push(combined);
            } else {
                result.push(move);
            }
        }
        return result;
    }

    combineMoves(m1, m2) {
        const face = m1[0];
        const getV = m => m.endsWith('2') ? 2 : (m.endsWith("'") ? 3 : 1);
        const v = (getV(m1) + getV(m2)) % 4;
        if (v === 0) return null;
        if (v === 1) return face;
        if (v === 2) return face + '2';
        return face + "'";
    }
}

module.exports = new Search();
