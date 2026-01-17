# 📦 Project Notes — Cubrics (Rubik’s Cube Solver Platform)

## 1. Project Vision
	•	Build a logic-first Rubik’s Cube solving platform
	•	Primary goal: demonstrate algorithmic thinking and system design in interviews
	•	Secondary goals:
	•	Learning platform for cube beginners
	•	Timer + challenge system for practice
	•	Leaderboard (future)

The project prioritizes correctness, explainability, and clean architecture over flashy UI.

⸻

## 2. Supported Cubes (Planned)
	•	Phase 1: 3×3×3 cube (core solver)
	•	Future:
	•	Visualization support up to 8×8×8
	•	Solver remains focused on 3×3 only
	•	Higher-order cubes are for manual play, timer, and visualization, not solving

⸻   

## 3. High-Level User Flow
	1.	Animated Preloader
	•	Short (1–2s), cube-themed
	•	Establishes product identity
	2.	Landing Page
	•	Explains what the platform does
	•	Highlights solver, learning, and challenge aspects
	3.	Authentication
	•	Login required for:
	•	Timer
	•	Leaderboard
	•	Guest access allowed for solving cube
	4.	Dashboard Sections
	•	Solve Cube
	•	Timer / Challenge
	•	Learn Cube (blog)

⸻

## 4. Core Features (Current Scope)

### A. Solve Cube (Primary Feature)
	•	Cube input via 2D net layout
	•	Manual color selection:
	•	6 faces
	•	Each face = 3×3 grid
	•	Frontend:
	•	Tracks colors only
	•	Converts net → raw cube state
	•	Backend:
	•	Validates cube
	•	Converts to internal piece-based representation
	•	Solves cube
	•	Returns move list

Initial Output:
	•	Text-based solution (e.g., R U R' U')
	•	Move count

Future:
	•	Animated 3D solving using move notation

⸻

### B. Timer / Challenge Mode
	•	Scramble generator
	•	Start/stop timer
	•	Move count tracking
	•	Leaderboard planned later
	•	Login required only for saving results

⸻

### C. Learn Cube
	•	Blog-style learning section
	•	Explains cube-solving concepts
	•	Aligned with the same phases used in the solver
	•	Focus on logic + visuals, not generic content

⸻

## 5. Architecture Principles

### Separation of Concerns
	•	Frontend
	•	UI
	•	Input
	•	Visualization
	•	Animations
	•	Backend
	•	Cube validation
	•	State representation
	•	Solving logic
	•	Deterministic output

Frontend never solves.
Backend never animates.

⸻

### 6. Cube Input Strategy
	•	Use 2D cube net as initial input method
	•	Reasons:
	•	Deterministic
	•	Easy to validate
	•	Debug-friendly
	•	Validation checks:
	•	Each color appears exactly 9 times
	•	Valid edges and corners
	•	Orientation and permutation parity

⸻

### 7. Backend Cube Representation (Critical)
	•	Solver does NOT operate on sticker colors
	•	Internal model is piece-based

Pieces:
	•	12 edges (2 colors each)
	•	8 corners (3 colors each)
	•	6 centers (fixed reference)

Each piece has:
	•	Position
	•	Orientation

Moves are pure transformations:
```
current_state + move → new_state
```
Solver is a deterministic state machine, not a search algorithm.

⸻

### 8. Solving Strategy
	•	Human-style layer-by-layer method
	•	Phase-based approach:
	1.	White Cross
	2.	White Corners
	3.	Middle Layer Edges
	4.	Yellow Cross (orientation)
	5.	Yellow Corners (position)
	6.	Final Orientation

No brute force.
No BFS/DFS.
No external solver libraries.

⸻

### 9. Backend API Contract (Conceptual)
Timer and leaderboard logic live outside the solver.

⸻

### 10. Frontend Visualization Plan
	•	Phase 1:
	•	2D net input
	•	Text-based move output
	•	Phase 2:
	•	3D cube using Three.js
	•	Animate moves step-by-step
	•	Each cubie is a mesh
	•	Rotations applied per face/layer

⸻

### 11. Tech Stack (Planned)

Frontend
	•	Next.js (App Router)
	•	React + TypeScript
	•	Canvas (2D input)
	•	Three.js (3D visualization)
	•	Framer Motion (UI animations)

Backend
	•	Node.js
	•	Express
	•	(Optional later) PostgreSQL for leaderboard
	•	Clear API boundary

⸻

### 12. Development Order (Important)
	1.	Cube state representation
	2.	Move system (U, R, F, etc.)
	3.	Validation logic
	4.	Solver correctness
	5.	2D input UI
	6.	Text-based output
	7.	3D animation
	8.	Timer
	9.	Leaderboard

UI polish comes after logic stability.

⸻

### 13. Key Design Philosophy
	•	Logic first, visuals later
	•	Deterministic > optimal
	•	Explainable > impressive
	•	Scalable architecture
	•	Interview-ready reasoning
