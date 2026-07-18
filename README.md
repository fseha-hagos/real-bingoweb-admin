# Winner Bingo — Admin (`bingo-admin`)

Next.js admin dashboard for users, games, and **deposit / withdraw approval**.

## Login credentials

| Field | Value |
|--------|--------|
| **Phone Number** | Digits only — e.g. `251985596125` |
| **Password** | `ADMIN_PASSWORD` from `bingo-tg-bot/.env` |

Create/reset admin from the backend:

```bash
cd ../bingo-tg-bot
npx tsx scripts/seed-admin.ts
```

## Local setup

**Important:** Auth is at `/api/auth` (proxied to the backend). Admin REST is at `/api/admin` → backend `/admin`. Do **not** point the auth client at `/admin`.

```bash
# .env
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

npm install
npm run dev -- -p 3002
```

Open `http://localhost:3002/login`.

Backend (`bingo-tg-bot`) must be running on `:3001`.

## Approve deposits & withdrawals

1. Log in as ADMIN / OPERATOR  
2. Sidebar → **Deposit Requests**  
3. Open a request → **Approve** or **Reject**

## Related

Backend docs: `../bingo-tg-bot/README.md`
