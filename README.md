# Friends Included Finance

Minimal wedding-guest finance control room for the Day 4 homework. The same server-side rules validate role permissions, duplicate references, positive values, 100% commission splits, approvals, cents rounding, and non-duplicated decisions. The selected demonstration role is held in a server-only cookie, so simply hiding a control cannot authorize an action.

## Run locally

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor.
2. Create a Google Sheet with `Sales` and `Expenses` tabs. Add the headers specified in the homework and share it with the Google service account as Editor.
3. Copy `.env.example` to `.env.local` and add the credentials. Do not commit it.
4. Install and start:

```powershell
pnpm install
pnpm dev
```

## Deployment

Import the repository in Vercel and set every `.env.example` variable in Vercel Project Settings. Give the instructor Viewer access to the Sheet. Connect the Telegram webhook to `https://YOUR-VERCEL-URL/api/telegram` after setting the Telegram token. Staff can send `/help` in the bot for the two supported submission formats; Svetlana must link their Telegram user ID and chat ID first.

## Test data

Enter and approve the supplied S01-S05 and E01-E07 examples through the UI. The dashboard is calculated from database records, never hard-coded; pending sales and awaiting-allocation expenses are treated exactly as the brief requires.
