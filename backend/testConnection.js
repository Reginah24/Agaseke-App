const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

async function testConnection() {
  console.log("\n🔍 Testing MongoDB Connection...");
  console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Present" : "❌ Missing");
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: "majority",
      family: 4,
    });
    
    console.log("✓ MongoDB connection successful!");
    console.log("Database:", mongoose.connection.name);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("\nTroubleshooting steps:");
    console.error("1. Check MongoDB Atlas cluster is running");
    console.error("2. Verify IP whitelist includes your network (or set to 0.0.0.0/0 for testing)");
    console.error("3. Check database user credentials are correct");
    console.error("4. Verify network connectivity to MongoDB service");
    process.exit(1);
  }
}

testConnection();
