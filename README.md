# AGASEKE - Digital Piggy Bank Application

A modern digital savings application that helps users track and achieve their financial goals through an intuitive mobile interface.

## Repository

**GitHub Repository:** [https://github.com/Shumbusho43/agaseke](https://github.com/Shumbusho43/agaseke)
**Demo video:** [https://youtu.be/zvAvbUQONLk](https://youtu.be/zvAvbUQONLk)

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
- Node.js
- React Native development environment
- Expo CLI

### Installation

Please visit SETUP_GUIDE.md file for the whole process

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

### Vercel Deployment (Alternative)

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

## License

This project is open source and available under the project's license.



--------
