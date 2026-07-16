# Role Based API

A Node.js + Express REST API with JWT authentication, role-based access control, an admin panel, an activity/audit log, and scheduled background jobs — plus a plain HTML/CSS/JS frontend to interact with it.

## Features

- **Authentication** — register and login with JWT, passwords hashed with bcrypt
- **Role-based access control** — `user` and `admin` roles, enforced via middleware
- **Admin user management** — list, promote, block/unblock, and delete users
- **Activity log / audit trail** — every admin action (and every automated action) is recorded with who, what, and when
- **Scheduled tasks** — auto-unblock users after 7 days, auto-delete activity logs older than 30 days, both run on cron schedules
- **Frontend** — a lightweight dashboard to sign in, manage users, and view the activity log

## Tech stack

- Node.js, Express
- MongoDB, Mongoose
- JWT (jsonwebtoken), bcryptjs
- node-cron
- Vanilla HTML/CSS/JS frontend

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Create a `.env` file in the project root:
PORT=5000
MONGO_URI=mongodb://localhost:27017/role-based-api
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d

### 3. Start the server
```bash
node server.js
```
The API runs at `http://localhost:5000`.

### 4. Run the frontend
Open `frontend/index.html` with VS Code's Live Server extension, or just double-click it to open in your browser.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user (default role: `user`) |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Admin (requires admin role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/promote` | Promote a user to admin |
| PUT | `/api/admin/users/:id/block` | Block or unblock a user |
| DELETE | `/api/admin/users/:id` | Delete a user |
| GET | `/api/admin/logs` | View the activity log |

## Scheduled tasks

| Job | Frequency | What it does |
|---|---|---|
| Auto-unblock | Every hour | Unblocks any user blocked for more than 7 days |
| Log cleanup | Daily at midnight | Deletes activity logs older than 30 days |

Both jobs log their own actions to the activity trail under `System`.