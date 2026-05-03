# Takere — Project Context

Personal medication tracking app for personal use. Not production-hardened.

## Repo Structure

Monorepo with two independent parts:

```
takere-interface/
├── src/              # React Native (Expo) frontend
│   ├── screens/      # LoginScreen, HomeScreen, HistoryScreen
│   ├── context/      # AuthContext (JWT auth state)
│   ├── services/     # api.ts (HTTP calls to backend)
│   ├── components/
│   ├── data/
│   └── theme/
├── api/              # Express + SQLite backend (self-contained, removable)
│   └── src/
│       ├── db/       # database.ts (singleton), migrate.ts (schema), seed.ts
│       ├── routes/   # auth.ts, medications.ts, history.ts
│       ├── middleware/
│       └── types/
├── App.tsx
└── app.json
```

## Frontend Stack

- React Native 0.81 + Expo 54
- React Navigation (bottom tabs + native stack)
- AsyncStorage for token persistence
- No state management library — context only

## Backend Stack (`api/`)

- Express 5 + TypeScript
- SQLite via `better-sqlite3` (synchronous, no ORM)
- JWT auth, bcrypt passwords
- DB file: `api/takere.db` (gitignored)
- WAL mode enabled

### DB Schema

3 tables: `users`, `medications`, `medication_logs`

### Running the API

```bash
cd api
npm install
npm run dev   # ts-node-dev, port 3000
```

### Running the Frontend

```bash
npm install
npx expo start
```

## Key Decisions

- `api/` is intentionally isolated — no shared code with frontend. Safe to delete later.
- No ORM — direct SQL with `db.prepare().get/all/run()`
- Test data auto-seeded on first run via `api/src/db/seed.ts`
- Backend is for local/personal use only — not deployed
