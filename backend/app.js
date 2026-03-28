const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require('./swaggerDocs.json');

const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, ".env.example");

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else if (fs.existsSync(envExamplePath)) {
    console.warn(".env not found. Loading .env.example for local development.");
    dotenv.config({ path: envExamplePath });
} else {
    dotenv.config();
}

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
};

app.use(cors(corsOptions));
app.use(express.json());

// Root info route
app.get("/", (_req, res) => {
    res.status(200).json({
        message: "AGASEKE backend is running",
        health: "/health",
        docs: "/api/documentation",
    });
});

// Health check — also warms up the DB connection so the first real
// request after a cold start is not the one that pays the connection cost
app.get("/health", async (_req, res) => {
    try {
        await connectDB();
        res.status(200).json({
            status: "ok",
            uptime: process.uptime(),
            db: "connected",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            uptime: process.uptime(),
            db: "disconnected",
            error: err.message,
        });
    }
});

// Swagger docs
app.use("/api/documentation", swaggerUi.serve, swaggerUi.setup(swaggerFile, false, {
    docExpansion: "none"
}));

// DB connection middleware — every API request ensures DB is connected
// before hitting any controller. This is the key fix for the buffering
// timeout: instead of assuming the connection exists, we guarantee it.
app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("DB connection failed for request:", req.path, err.message);
        res.status(503).json({
            error: "Database connection failed. Please try again in a few seconds.",
        });
    }
});

// Routes
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/savingRoutes"));
app.use("/api", require("./routes/withdrawalRoutes"));

// Global error handler — catches anything unhandled above
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: err.message || "Something went wrong." });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
    await connectDB();
    app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
};

if (process.env.VERCEL === "1") {
    // On Vercel: connect to DB at cold-start time so the first request is fast
    connectDB().catch((error) => {
        console.error("Failed to initialize database on Vercel cold start:", error.message);
    });
} else {
    startServer();
}

module.exports = app;