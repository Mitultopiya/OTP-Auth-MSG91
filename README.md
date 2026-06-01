# Mobile OTP Authentication System

Production-ready full-stack authentication with React, Tailwind CSS, Node.js, Express, and PostgreSQL.

## Features

- Mobile number login via OTP (MSG91 SMS)
- User registration (full name, mobile, password)
- Forgot password with OTP
- bcrypt password hashing
- JWT access + refresh tokens
- express-validator input validation
- Rate limiting on OTP endpoints
- OTP expiry (5 min) and max attempts (5)
- Protected routes (backend middleware + React Router)
- Login audit logs in PostgreSQL
- Responsive Tailwind UI with toast notifications and loading states

## Project Structure

```
├── backend/
│   ├── migrations/          # PostgreSQL SQL migrations
│   └── src/
│       ├── config/          # DB & env
│       ├── controllers/     # HTTP handlers
│       ├── middleware/      # Auth, errors, rate limit
│       ├── models/          # Data access layer
│       ├── routes/          # API routes
│       ├── services/        # Business logic
│       ├── utils/           # Helpers
│       ├── validators/      # express-validator rules
│       ├── scripts/         # Migration runner
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── utils/
└── docker-compose.yml       # PostgreSQL for local dev
```

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your secrets (JWT keys, MSG91 key optional for dev)
npm install
npm run migrate
npm run seed      # creates test user (see below)
npm run dev
```

API runs at `http://localhost:5000`

### Test account (development)

After `npm run seed`:

| Field | Value |
|-------|--------|
| Mobile | `8128187135` |
| Password | `Testing123` |

Sign in at http://localhost:5173/login using the **Password** tab.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/send-otp` | Send registration OTP |
| POST | `/api/auth/register` | Complete registration |
| POST | `/api/auth/login/password` | Login with password |
| POST | `/api/auth/login/otp/send` | Send login OTP |
| POST | `/api/auth/login/otp/verify` | Verify login OTP |
| POST | `/api/auth/forgot-password/send-otp` | Send reset OTP |
| POST | `/api/auth/forgot-password/reset` | Reset password |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/profile` | User profile (protected) |

## MSG91 Setup

1. Create an account at [MSG91](https://msg91.com)
2. Create an OTP template and note the `template_id`
3. Add to `backend/.env`:

```
MSG91_AUTH_KEY=your-auth-key
MSG91_TEMPLATE_ID=your-template-id
MSG91_SENDER_ID=OTPAUTH
```

Without MSG91 configured, OTPs are printed to the server console in development.

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all options.

## Security Notes

- Change JWT secrets in production
- Use HTTPS in production
- OTPs are bcrypt-hashed before storage
- Refresh tokens are SHA-256 hashed in the database
- OTP endpoints are rate-limited per mobile number

## License

MIT
