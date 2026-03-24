# AGASEKE - Digital Piggy Bank Application

A modern digital savings application that helps users track and achieve their financial goals through an intuitive mobile interface.

## Features

- **User Authentication**
  - User signup/registration form
  - Secure login system
  - Password protection (min 6 characters)
  
- **Goal Management**
  - Create and track savings goals
  - Visual progress tracking
  - Goal achievement notifications
  
- **Financial Operations**
  - Deposit funds
  - Download transaction history
  - Real-time balance updates
  
- **User Interface**
  - Clean and modern UI design
  - Mobile-responsive layout
  - Intuitive navigation

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Expo Go app (for physical device testing) or Android/iOS emulator

### Local Setup (Step by Step)

1. Clone the repository and open the project root.
2. Install backend dependencies:
  - `cd backend`
  - `npm install`
3. Create `backend/.env` and set:
  - `MONGO_URI=<your mongodb atlas uri>`
  - `JWT_SECRET=<your strong random secret>`
  - `PORT=5000`
  - `HOST=0.0.0.0`
  - `APP_URL=http://localhost:5000`
  - `CORS_ORIGIN=*`
4. Start the backend:
  - `npm start`
5. In a new terminal, install frontend dependencies:
  - `cd front_end`
  - `npm install`
6. Create `front_end/.env` and set:
  - `EXPO_PUBLIC_API_URL=http://localhost:5000/api`
7. Start Expo:
  - `npx expo start -c`
8. Open the app using Expo Go or emulator and test signup/login.

### Local Verification

1. Backend health: open `http://localhost:5000/health`
2. API docs: open `http://localhost:5000/api/documentation`
3. If login fails, confirm `EXPO_PUBLIC_API_URL` matches your running backend URL.

## Permanent Submission Setup

For stable reviewer testing, use a deployed backend (not local LAN IPs).

1. Deploy the backend and get a fixed HTTPS URL (example: https://api.your-domain.com).
2. In front_end/.env set:
  EXPO_PUBLIC_API_URL=https://api.your-domain.com/api
3. In backend/.env set production values (see backend/.env.example):
  MONGO_URI, JWT_SECRET, HOST, PORT, CORS_ORIGIN, APP_URL.
4. Verify backend health endpoint:
  GET /health should return status ok.

This removes the need to keep changing laptop IP addresses before demos or grading.

### Vercel Deployment (Recommended for Submission)

You can deploy the backend on Vercel using the backend/vercel.json config.

1. Push code to GitHub.
2. In Vercel, create a new project and set Root Directory to backend.
3. Add environment variables in Vercel Project Settings:
  MONGO_URI=<your mongodb atlas uri>
  JWT_SECRET=<strong random secret>
  APP_URL=https://<your-vercel-domain>.vercel.app
  CORS_ORIGIN=*
  NODE_ENV=production
4. Deploy and verify:
  https://<your-vercel-domain>.vercel.app/health
5. In front_end/.env set:
  EXPO_PUBLIC_API_URL=https://<your-vercel-domain>.vercel.app/api
6. Restart Expo with cache clear:
  npx expo start -c

This gives you one permanent backend URL for submission.

### Important: Mobile App vs Website

This project frontend is a React Native Expo mobile app.

1. The Vercel URL is for the backend API, not a browser website UI.
2. Open the mobile app through Expo Go or emulator to test user flows.
3. Use these endpoints for backend checks:
  / -> API running message
  /health -> health status JSON
  /api/documentation -> Swagger docs

### Auto-Redeploy on Every Push

In Vercel project settings:

1. Connect the correct GitHub repository.
2. Set Production Branch to main.
3. Enable Auto Deploy.

After that, every push to main redeploys production automatically.

### Troubleshooting Quick Guide

1. 401 on /health:
  Deployment protection is enabled in Vercel. Disable project authentication/password protection for testing.
2. Cannot GET /:
  Backend is up but root route may be missing in old deployment. Redeploy latest commit.
3. Login timeout from mobile app:
  Ensure front_end/.env points to Vercel API URL, not local IP.
4. Environment variable already exists:
  Edit existing variable instead of adding a duplicate.

## License

This project is open source and available under the project's license.
