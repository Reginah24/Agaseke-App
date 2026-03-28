const mongoose = require("mongoose");

// On Vercel each serverless function invocation may be a fresh Node process.
// We cache the connection on the global object so it survives across
// invocations within the same warm instance instead of reconnecting every time.
let cached = global._mongoConnection || { conn: null, promise: null };
global._mongoConnection = cached;

const connectDB = async () => {
  // Already connected — reuse
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Connection in progress — wait for it
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error(
      "Missing MONGO_URI environment variable. Add it to backend/.env before starting."
    );
  }

  cached.promise = mongoose.connect(mongoUri, {
    // Keep pool small for serverless — large pools waste connections on free Atlas
    maxPoolSize: 5,
    minPoolSize: 1,
    // Shorter timeouts so failures surface quickly instead of hanging for 30s
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    w: "majority",
    family: 4,
  });

  try {
    cached.conn = await cached.promise;
    console.log("✓ MongoDB Connected Successfully");

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠ MongoDB disconnected — clearing cache so next request reconnects");
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
      cached.conn = null;
      cached.promise = null;
    });

    return cached.conn;
  } catch (err) {
    // Clear cache so the next request tries again fresh
    cached.conn = null;
    cached.promise = null;
    console.error("❌ Database connection failed:", err.message);
    throw err;
  }
};

module.exports = connectDB;