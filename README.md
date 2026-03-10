# Future Scope

App that lets you build your own future based on a goal, writing sub-goals and making achieving your goals more rewarding

## Requirements

### INPUT

- Write down a goal you have, or see yourself in the future
- Start date
- Checklist of requirements and what you’ve already done
- Give time you have to dedicate to your goal.

### OUTPUT

- Reverse timetable
- Checklist to say what you finished
- Description of the goal (weekly, monthly, yearly)
- How that helps you set your goal
- Due dates

### OPTIONS

- Edit your end goal
- Edit your timeline
- Gamefy (Keep a streak of daily goals completed)

## Local Development

1. Start the API:

```powershell
cd hackathon-app\server
cp .env.example .env  # or set env vars in your shell
npm install
node index.js
```

2. Start the React app:

```powershell
cd hackathon-app
npm install
npm start
```

## Database (Postgres)

This app uses Postgres for:
- user accounts (email + password hash)
- per-user saved app state (roadmap/progress) as `JSONB`

Initialize the schema:

```powershell
cd hackathon-app\server
psql -U <user> -d <db> -f migrations\001_init.sql
```

## Deploy (AWS EC2 + Postgres On The Same Box)

High level:

1. Install Postgres on the EC2 instance (and create a DB + user).
2. Run the migration `hackathon-app/server/migrations/001_init.sql`.
3. Build the frontend (`npm run build` in `hackathon-app`).
4. Run the server (`node index.js` in `hackathon-app/server`) behind Nginx (recommended).

Required server env vars:
- `JWT_SECRET`
- `OPENAI_API_KEY`
- Postgres: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` (or `DATABASE_URL`)

Security note: do not commit secrets. If a key was ever committed to git, rotate it.



