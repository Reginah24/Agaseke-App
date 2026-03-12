const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "Missing MONGO_URI environment variable. Add it to backend/.env before starting the server."
      );
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;