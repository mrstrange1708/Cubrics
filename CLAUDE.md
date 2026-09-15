# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Cubrics is a speedcubing platform: a Rubik's cube solver with 3D playback, a timer, a leaderboard, a social feed, friends and real-time chat. It has two independent npm projects and no root workspace:

- `backend/`: Express 5 + Socket.io + Prisma 6 (PostgreSQL/Neon), CommonJS JavaScript
- `frontend/`: Next.js 16 App Router + React 19 + TypeScript + Tailwind 4, with Three.js through `@react-three/fiber`. The README says Next 15, but `package.json` pins 16.1.1.

## Commands

Backend (`cd backend`):
```bash
npm run dev            # nodemon index.js (nodemon is not a dependency; needs a global install or npx)
npm start              # node index.js, port 7777 by default
npx prisma generate    # also what `npm run build` runs
npx prisma db push     # sync schema.prisma to the DB (a migrations/ folder also exists)
```
Backend `.env`: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (used for CORS on both REST and Socket.io).

Frontend (`cd frontend`):
```bash
npm run dev     # localhost:3000
npm run build
npm run lint    # eslint (flat config, eslint-config-next)
```
Frontend `.env.local`: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:7777`; REST and the socket both use it).

Tests: there is no test runner, and `npm test` is a stub. The solver checks are plain Node scripts run from `backend/`:
```bash
node tests/solver/test_solver.js   # scrambles 13 cases, solves each, verifies the result is solved
node tests/solver/test_moves.js    # checks sticker moves against CubieCube moves
```

## Architecture

### Solver (the core of the project)
Flow: the frontend sends a sticker map `{U,D,L,R,F,B: string[9]}` (color names, row-major indices 0–8) to `POST /solve`. Then, in the backend:
1. `solver.service.js` `mapToCubie` converts stickers to a `CubieCube` (cp/co/ep/eo arrays). Colors are mapped to faces **by center sticker**, so no fixed color scheme is assumed. The corner/edge facelet tables there follow Kociemba ordering (URF, UFL, …; UR, UF, …).
2. `CubieCube.verify()` checks solvability.
3. `Search.js` runs Kociemba two-phase IDA*: phase 1 on the twist/flip/slice coordinates (`CoordCube`), then phase 2 with a restricted move set. It has a 25s time cap and returns `null` on timeout.
4. The response is `{valid, solution: "R U ...", phases: [{name, moves[]}]}`.

`Tables.js` is a singleton that builds move and pruning tables lazily in `init()`. `index.js` calls it at startup so the first solve is fast, which makes server boot slower. Changing the move definitions or coordinate encodings in `CubieCube`/`CoordCube` invalidates these tables and the facelet mappings in `solver.service.js`. After such a change, re-run `tests/solver/test_solver.js`.

`solver.service.js` also has its own sticker-level `applyMove`/`rotate`, used by `GET /scramble` and the tests. It must stay consistent with the `CubieCube` moves; `test_moves.js` checks this.

`services/solver/cube.js` is an unused legacy model. `Notes.md`, `backendnotes.md` and `rubik'sLogic.md` are design notes: the first two describe an abandoned layer-by-layer/F2L approach, and `rubik'sLogic.md` explains the switch to Kociemba. The code is the source of truth.

On the frontend, `CubeContext` holds the sticker state and solution phases, which are shared across `/solver/manual` (net input), `/solver/scan` (camera + `lib/colorDetection.ts`) and `/solution` (3D playback in `components/solver/Cube3D.tsx`). The solution page reads phases from context, so reloading it loses them.

### Backend layout
`index.js` wires everything: routes → services → the single shared Prisma client in `src/lib/prisma.js` (don't create new `PrismaClient`s). Controllers exist only for auth and the solver; the other route files contain their handlers inline. Routes under `/timer`, `/friends`, `/posts`, `/messages` and `/users` go through `authMiddleware`. `/leaderboard` uses `optionalAuthMiddleware`, and `/auth`, `/solve`, `/scramble` and `/health` are public. JWT uses `JWT_SECRET` and expires after 7 days.

The acting user always comes from the token (`req.user.userId`). Never trust a `userId`/`senderId` sent in the body. Routes with a `:userId` param that must be the caller use `requireSelf()` from `auth.middleware.js`. The frontend API clients still send `userId` fields, and the server ignores them.

Post list endpoints (feed, user posts, liked posts) share `feedInclude(viewerId)` in `posts.service.js`. `likes` there contains only the viewer's own like, and comments aren't loaded. Fetch a single post to get its comments.

`src/socket.js` handles chat. The connection is authenticated with the JWT sent in the handshake (`auth: { token }`), and `socket.userId` comes from the token. It keeps an in-memory `onlineUsers` map (userId → socketId); events are `user-online`, `send-message` (saves to Prisma, then emits `receive-message` / `message-sent`), `typing`, `get-online-users` and `disconnect`.

### Frontend layout
- `components/Providers.tsx` nests `AuthProvider` → `SocketProvider` → `CubeProvider`.
- Auth is client-only: the token and user are stored in `localStorage` (`token`, `user`, plus the legacy `Cubrics_user_id`). `lib/api.ts` is the shared axios instance. It attaches the Bearer token, and on a 401 it clears storage and redirects to `/auth/signin`. Pages that need login wrap their content in `components/ProtectedRoute.tsx`.
- There is one API module per domain in `frontend/api/*.api.ts`, and all of them use `lib/api.ts`.
- The import alias is `@/*`, which maps to the frontend root. UI components are shadcn (new-york style) plus Aceternity/MagicUI registry components in `components/ui`. Both `sonner` and `react-toastify` are mounted; newer code uses `sonner`.
