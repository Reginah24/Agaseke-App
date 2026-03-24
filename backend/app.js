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
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});
app.use("/api/documentation", swaggerUi.serve, swaggerUi.setup(swaggerFile, false, {
    docExpansion: "none"
}));

// Routes
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/savingRoutes"));
app.use("/api", require("./routes/withdrawalRoutes"));

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
    await connectDB();
    app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
};

if (process.env.VERCEL === "1") {
    // Vercel serverless runtime: establish DB connection without creating a local listener.
    connectDB().catch((error) => {
        console.error("Failed to initialize database on Vercel:", error.message);
    });
} else {
    startServer();
}

module.exports = app;