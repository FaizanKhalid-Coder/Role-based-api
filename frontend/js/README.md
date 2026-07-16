# Role Based API — Admin Console (Frontend)

A plain HTML/CSS/JS frontend for your Role Based API. No build tools, no npm install — just open it in a browser.

## Pages
- `index.html` — Sign in
- `register.html` — Create an account
- `dashboard.html` — User management (promote / block / delete) — admin only
- `logs.html` — Activity log / audit trail — admin only

## Before you run it
Make sure your backend is running first:
```powershell
node server.js
```
It should be live at `http://localhost:5000`.

## Running the frontend
Easiest option — use VS Code's **Live Server** extension:
1. Right-click `index.html` in the file explorer
2. Click **"Open with Live Server"**

Or just double-click `index.html` to open it directly in your browser (works fine too, since this makes plain `fetch` calls to `localhost:5000`).

## Notes
- The API base URL is set in `js/api.js` — change `API_BASE` if your backend runs on a different port.
- Non-admin accounts can log in, but `dashboard.html` and `logs.html` will show an "Admin access required" message, since those routes are protected on the backend.
- Session (token + user info) is stored in `localStorage` under `rba_token` / `rba_user`. Sign out clears it.