// keepAlive.js
// Pings the backend /health endpoint every 4 minutes so Vercel never
// goes fully cold. This prevents the 10s+ delay on the first request
// after a period of inactivity.

import api from "./api";

const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

let intervalId = null;

export const startKeepAlive = () => {
  if (intervalId) return; // already running

  // Ping immediately on start to warm up the connection
  api.get("/health").catch(() => {});

  intervalId = setInterval(() => {
    api.get("/health").catch(() => {
      // Silently ignore — this is just a keep-alive, not critical
    });
  }, PING_INTERVAL_MS);
};

export const stopKeepAlive = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};