# AGASEKE - Goal-Based Digital Savings Platform

A mobile-first digital savings application that helps African youth build disciplined saving habits through goal tracking, co-signer accountability, and controlled withdrawal approval.

## Quick Start

1. Clone the repository.
2. Deploy backend on Vercel (Root Directory: `backend`).
3. Add required environment variables in Vercel settings.
4. Set frontend API URL in `front_end/.env`:

```env
EXPO_PUBLIC_API_URL=https://<your-vercel-domain>.vercel.app/api
```

5. Install dependencies and start frontend:

```bash
cd front_end
npm install
npx expo start -c
```

6. Open Expo Go on your phone and scan the QR code.

### First Run vs Next Runs

- First run on a machine: `npm install` then `npm start` (or `npx expo start -c`)
- Next runs: only `npm start` is needed
- Run `npm install` again only when dependencies change or `node_modules` was deleted

## Features

- **User Authentication**
  - Register with name, email, password, and co-signer email
  - Secure JWT-based login
  - Password hashing with bcrypt (minimum 6 characters)

- **Savings Goal Management**
  - Create one active savings goal with a target amount and lock date
  - Deposit funds into your savings balance
  - Visual progress tracking toward your goal target

- **Co-signer Withdrawal Control**
  - Request a withdrawal with a stated reason
  - Co-signer receives an email notification automatically
  - Co-signer can approve or reject the request from the app
  - Approved withdrawals deduct from balance; rejected ones do not

- **Activity and History**
  - View all past deposits and withdrawals
  - Filter withdrawals by status (`pending`, `approved`, `rejected`)
  - Co-signer can view all pending requests assigned to them

- **Stability Features**
  - Global MongoDB connection caching for Vercel serverless
  - Automatic DB connection check before every API request
  - Keep-alive ping every 4 minutes to reduce cold starts
  - Health endpoint reports DB connection status

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile app | React Native (Expo) |
| Backend API | Node.js + Express 5 |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | JWT (`jsonwebtoken`) |
| Email notifications | Nodemailer (SMTP) |
| API Docs | Swagger UI |
| Deployment | Vercel (backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo Go app on your phone (iOS or Android)
- MongoDB Atlas account (free tier works)
- Vercel account (free tier works)

## Recommended Setup: Vercel Deployment

This is the recommended setup for submission and grading. It gives you one stable URL that works on any device and network.

### Step 1 - MongoDB Atlas: Allow all connections

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Open your project -> **Network Access**
3. Click **Add IP Address** -> **Allow Access from Anywhere** (adds `0.0.0.0/0`)
4. Click **Confirm**

This is required for Vercel to reach your database.

### Step 2 - Deploy backend to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your GitHub repository
4. Set **Root Directory** to `backend`
5. Add these environment variables in Vercel project settings:

| Key | Value |
|-----|-------|
| `MONGO_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | any long random string |
| `PORT` | `5000` |
| `HOST` | `0.0.0.0` |
| `CORS_ORIGIN` | `*` |
| `NODE_ENV` | `production` |
| `SMTP_HOST` | your SMTP host (for example `smtp.gmail.com`) |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | your email address |
| `SMTP_PASS` | your email app password |
| `EMAIL_FROM` | your email address |

6. Click **Deploy** and wait for completion
7. Verify:

```text
https://<your-vercel-domain>.vercel.app/health
```

Expected response:

```json
{ "status": "ok", "uptime": 12.3, "db": "connected" }
```

### Step 3 - Configure frontend

Create or update `front_end/.env`:

```env
EXPO_PUBLIC_API_URL=https://<your-vercel-domain>.vercel.app/api
```

Do not use a local IP such as `192.168.x.x` for submission.

### Step 4 - Start the mobile app

```bash
cd front_end
npm install
npx expo start -c
```

On first setup, run `npm install` once. After that, use `npm start` for daily development and use `npx expo start -c` only when you need to clear cache.

Scan the QR code with Expo Go.

## Local Development Setup

Use this for development only.

1. Clone the repository
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Create `backend/.env`:

```env
MONGO_URI=<your mongodb atlas uri>
JWT_SECRET=<strong random secret>
PORT=5000
HOST=0.0.0.0
CORS_ORIGIN=*
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your email>
SMTP_PASS=<your app password>
EMAIL_FROM=<your email>
```

4. Start backend:

```bash
npm start
```

5. Install frontend dependencies:

```bash
cd front_end
npm install
```

6. Create `front_end/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

7. Start Expo:

```bash
npx expo start -c
```

`localhost` works for web on the same machine. For a physical phone, prefer Vercel deployment for stability.

If you still want to test local backend on a physical phone, use your computer LAN IP in `EXPO_PUBLIC_API_URL` (for example `http://192.168.1.20:5000/api`) and ensure phone and computer are on the same network.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/auth/me` | Yes | Get logged-in user profile |
| POST | `/api/saving/create` | Yes | Create savings goal |
| POST | `/api/saving/add` | Yes | Deposit funds |
| GET | `/api/saving` | Yes | Get all savings records |
| GET | `/api/saving/:id` | Yes | Get saving by ID |
| POST | `/api/withdrawal/request` | Yes | Request a withdrawal |
| POST | `/api/withdrawal/approve/:id` | Yes | Approve or reject withdrawal (co-signer only) |
| GET | `/api/withdrawal` | Yes | Get own withdrawal history |
| GET | `/api/withdrawal/pending` | Yes | Get pending requests to approve (co-signer) |
| GET | `/health` | No | Backend and DB health status |
| GET | `/api/documentation` | No | Swagger API docs |

## Co-signer Flow

1. User registers and provides a co-signer email
2. User creates a savings goal and deposits funds
3. User submits a withdrawal request with a reason
4. Co-signer receives an email notification automatically
5. Co-signer opens the app and views **Pending Approvals**
6. Co-signer approves or rejects the request
7. If approved, the amount is deducted from savings balance
8. If rejected, the balance remains unchanged

## Auto-Redeploy on Every Push

1. In Vercel settings, connect your GitHub repository
2. Set Production Branch to `main`
3. Enable **Auto Deploy**

Every push to `main` redeploys the backend.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `buffering timed out` | MongoDB IP not whitelisted | Add `0.0.0.0/0` in Atlas Network Access |
| `Login failed - timeout` | Frontend pointing to local IP | Set `EXPO_PUBLIC_API_URL` to Vercel URL in `front_end/.env` |
| `401 on /health` | Vercel deployment protection enabled | Disable password protection in Vercel project settings |
| `Not authorized` on withdrawal approve | Wrong user trying to approve | Only the assigned co-signer email can approve |
| `Withdrawal already processed` | Approving twice | Each withdrawal can only be approved or rejected once |
| Co-signer pending list empty | Email case mismatch | Ensure co-signer email at registration matches login email exactly |
| App slow on first open | Vercel cold start | Open app once before reviewer testing; keep-alive handles the rest |

## Project Structure

```text
Agaseke-App/
|-- backend/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- savingController.js
|   |   `-- withdrawalController.js
|   |-- middleware/
|   |   `-- authMiddleware.js
|   |-- models/
|   |   |-- userModel.js
|   |   |-- savingModel.js
|   |   `-- withdrawalModel.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- savingRoutes.js
|   |   `-- withdrawalRoutes.js
|   |-- app.js
|   `-- vercel.json
`-- front_end/
    |-- src/
    |   |-- components/
    |   |-- context/
    |   |-- screens/
    |   |-- services/
    |   `-- theme/
    `-- App.js
```

## License

This project is open source and available under the project's license.
