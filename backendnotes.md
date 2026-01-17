🧠 Cubrics Backend — Solver Architecture (F2L Method)

This document focuses only on backend logic for Cubrics.
UI, animations, timers, and visualization are intentionally excluded.

The backend is responsible for:
	•	Validating cube states
	•	Representing the cube internally
	•	Applying deterministic moves
	•	Solving the cube using F2L (First Two Layers) methodology

⸻

1. Backend Responsibilities (Strict Scope)

The backend must:
	1.	Accept raw cube color input from frontend
	2.	Convert sticker-based input → piece-based cube model
	3.	Validate cube legality (physical constraints)
	4.	Solve the cube using a human-style F2L approach
	5.	Return a deterministic move sequence

The backend:
	•	❌ Does NOT animate
	•	❌ Does NOT render
	•	❌ Does NOT optimize for shortest solution

Correctness and explainability are the priorities.

⸻

2. Input Contract (from Frontend)

The frontend sends only colors, grouped by faces:

{
  U: string[9],
  D: string[9],
  F: string[9],
  B: string[9],
  L: string[9],
  R: string[9]
}

Each face follows index order:

0 1 2
3 4 5
6 7 8

Backend must not assume fixed colors (e.g., white = up).
Centers define orientation.

⸻

3. Internal Cube Representation (Critical)

The solver operates on pieces, not stickers.

Cube Pieces
	•	8 Corners (3 colors each)
	•	12 Edges (2 colors each)
	•	6 Centers (fixed reference)

Piece Model

Each piece is represented as:

{
  position: string,     // e.g. UFR, UF
  piece: string,        // which physical piece it is
  orientation: number   // 0–2 (corner), 0–1 (edge)
}

The full cube state is:

{
  corners: Corner[8],
  edges: Edge[12]
}

This representation is immutable per move.
Moves produce a new cube state.

⸻

4. Validation Logic (Mandatory)

Before solving, the backend validates:

4.1 Color Count
	•	Exactly 9 occurrences of each center color

4.2 Piece Uniqueness
	•	All 8 corners are unique
	•	All 12 edges are unique

4.3 Orientation Constraints
	•	Sum(corner orientations) % 3 == 0
	•	Sum(edge orientations) % 2 == 0

4.4 Permutation Parity
	•	Corner parity == Edge parity

If any check fails:

{ valid: false, reason: "Invalid cube state" }

Solver never runs on invalid input.

⸻

5. Move System (Foundation)

All solving logic is built on atomic face moves:

U, U', U2
D, D', D2
L, L', L2
R, R', R2
F, F', F2
B, B', B2

Each move:
	•	Permutes corner positions
	•	Permutes edge positions
	•	Updates orientations deterministically

Moves are pure functions:

newState = applyMove(currentState, move)


⸻

6. Solving Strategy Overview (F2L)

The solver follows a human-style deterministic F2L method.

High-level phases:
	1.	Cross (first-layer cross)
	2.	F2L pairs (corner + edge insertion)
	3.	Last Layer (basic orientation & permutation)

This document focuses on F2L logic.

⸻

7. F2L Concept (Backend View)

F2L solves:
	•	One corner + edge pair at a time
	•	Inserts them together into the first two layers

Backend treats F2L as pattern detection + algorithm execution, not intuition.

Each F2L pair has:
	•	A target slot (e.g., FR slot)
	•	A current configuration (top layer / middle / misoriented)

⸻

8. F2L Solver Structure

For each of the 4 F2L slots:

FR, FL, BL, BR

The solver performs:

Step 1: Locate Pair
	•	Find corner belonging to the slot
	•	Find corresponding edge

Step 2: Check Solved State
	•	If both are already correctly placed and oriented → skip

Step 3: Extract to Top Layer
	•	If piece is in middle or wrong slot
	•	Apply extraction algorithm to move both to U layer

Step 4: Align Pair
	•	Rotate U layer until edge and corner colors match center references

Step 5: Insert Pair
	•	Apply predefined insertion algorithm (left or right)

This process is fully deterministic.

⸻

9. F2L Algorithm Handling

Backend does not hardcode human intuition.

Instead, it uses:
	•	Slot-based rules
	•	Known F2L insertion algorithms

Example categories:
	•	Pair aligned on right
	•	Pair aligned on left
	•	Misoriented edge
	•	Split pair

Each category maps to:

currentState → fixed move sequence


⸻

10. Determinism Guarantee

Given the same cube state:
	•	Solver always produces the same move sequence
	•	No randomness
	•	No branching search

This makes the solver:
	•	Testable
	•	Explainable
	•	Interview-defensible

⸻

11. Output Contract

Successful solve response:

{
  valid: true,
  solution: string[],
  moveCount: number
}

Failure response:

{
  valid: false,
  reason: string
}


⸻

12. Why F2L (Design Justification)
	•	Mirrors human solving logic
	•	Easier to explain in interviews
	•	Modular and phase-based
	•	Avoids brute-force complexity

Trade-off:
	•	Not optimal in move count
	•	Acceptable by design

⸻

13. Backend Design Philosophy
	•	Piece-based reasoning, not colors
	•	Deterministic state transitions
	•	Validation before execution
	•	Readability over cleverness
	•	Solver correctness over speed

This backend is built to be understood, tested, and defended — not to impress with tricks.