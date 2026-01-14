/**
 * Cubie-based model for Rubik's Cube.
 * Corners: 8, Edges: 12.
 * Each corner/edge has a position and an orientation.
 */

// Corner names/indices
const CP = {
    URF: 0, UFL: 1, ULB: 2, UBR: 3, DFR: 4, DLF: 5, DLB: 6, DBR: 7
};

// Edge names/indices
const EP = {
    UR: 0, UF: 1, UL: 2, UB: 3, DR: 4, DF: 5, DL: 6, DB: 7, FR: 8, FL: 9, BL: 10, BR: 11
};

class CubieCube {
    constructor() {
        // Corners: position (0-7), orientation (0-2)
        this.cp = [0, 1, 2, 3, 4, 5, 6, 7];
        this.co = [0, 0, 0, 0, 0, 0, 0, 0];

        // Edges: position (0-11), orientation (0-1)
        this.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        this.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    // Multiply (multiply this cube by another)
    multiply(b) {
        const res = new CubieCube();

        // Corner multiplication
        for (let i = 0; i < 8; i++) {
            res.cp[i] = this.cp[b.cp[i]];
            let oriA = this.co[b.cp[i]];
            let oriB = b.co[i];
            let ori = 0;
            if (oriA < 3 && oriB < 3) { // Normal corners
                ori = oriA + oriB;
                if (ori >= 3) ori -= 3;
            }
            res.co[i] = ori;
        }

        // Edge multiplication
        for (let i = 0; i < 12; i++) {
            res.ep[i] = this.ep[b.ep[i]];
            res.eo[i] = (this.eo[b.ep[i]] + b.eo[i]) % 2;
        }

        return res;
    }

    verify() {
        // 1. Corner orientation sum must be 0 mod 3
        let coSum = this.co.reduce((a, b) => a + b, 0);
        if (coSum % 3 !== 0) return { valid: false, error: "Invalid corner orientations." };

        // 2. Edge orientation sum must be 0 mod 2
        let eoSum = this.eo.reduce((a, b) => a + b, 0);
        if (eoSum % 2 !== 0) return { valid: false, error: "Invalid edge orientations." };

        // 3. Total parity must be even (CP parity XOR EP parity == 0)
        let cpParity = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = i + 1; j < 8; j++) {
                if (this.cp[i] > this.cp[j]) cpParity++;
            }
        }
        let epParity = 0;
        for (let i = 0; i < 12; i++) {
            for (let j = i + 1; j < 12; j++) {
                if (this.ep[i] > this.ep[j]) epParity++;
            }
        }
        if ((cpParity % 2) !== (epParity % 2)) return { valid: false, error: "Invalid piece permutations (odd parity)." };

        return { valid: true };
    }

    static getBasicMoves() {
        if (CubieCube.basicMoves) return CubieCube.basicMoves;

        const moves = {};

        // Define U move
        const moveU = new CubieCube();
        moveU.cp = [3, 0, 1, 2, 4, 5, 6, 7];
        moveU.co = [0, 0, 0, 0, 0, 0, 0, 0];
        moveU.ep = [3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11];
        moveU.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        moves['U'] = moveU;

        // Define R move
        const moveR = new CubieCube();
        moveR.cp = [4, 1, 2, 0, 7, 5, 6, 3];
        moveR.co = [2, 0, 0, 1, 1, 0, 0, 2];
        moveR.ep = [8, 1, 2, 3, 11, 5, 6, 7, 4, 9, 10, 0];
        moveR.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        moves['R'] = moveR;

        // Define L move
        const moveL = new CubieCube();
        moveL.cp = [0, 2, 6, 3, 4, 1, 5, 7];
        moveL.co = [0, 1, 2, 0, 0, 2, 1, 0];
        moveL.ep = [0, 1, 10, 3, 4, 5, 9, 7, 8, 2, 6, 11]; // UL(2)->FL(9)->DL(6)->BL(10)->UL(2)
        moveL.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        moves['L'] = moveL;

        // Define F move
        const moveF = new CubieCube();
        moveF.cp = [1, 5, 2, 3, 0, 4, 6, 7];
        moveF.co = [1, 2, 0, 0, 2, 1, 0, 0];
        moveF.ep = [0, 9, 2, 3, 4, 8, 6, 7, 1, 5, 10, 11]; // UF(1)->FR(8)->DF(5)->FL(9)->UF(1)
        moveF.eo = [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0];
        moves['F'] = moveF;

        // Define B move
        const moveB = new CubieCube();
        moveB.cp = [0, 1, 3, 7, 4, 5, 2, 6];
        moveB.co = [0, 0, 1, 2, 0, 0, 2, 1];
        moveB.ep = [0, 1, 2, 11, 4, 5, 6, 10, 8, 9, 3, 7]; // UB(3)->BL(10)->DB(7)->BR(11)->UB(3)
        moveB.eo = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1];
        moves['B'] = moveB;

        // Define D move
        const moveD = new CubieCube();
        moveD.cp = [0, 1, 2, 3, 5, 6, 7, 4];
        moveD.co = [0, 0, 0, 0, 0, 0, 0, 0];
        moveD.ep = [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11];
        moveD.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        moves['D'] = moveD;

        // Derived moves (2, ')
        const basic = ['U', 'R', 'L', 'F', 'B', 'D'];
        for (const m of basic) {
            const m2 = moves[m].multiply(moves[m]);
            const m3 = m2.multiply(moves[m]);
            moves[m + '2'] = m2;
            moves[m + "'"] = m3;
        }

        CubieCube.basicMoves = moves;
        return moves;
    }
}

module.exports = CubieCube;
