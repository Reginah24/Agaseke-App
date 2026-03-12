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
app.use(cors());
app.use(express.json());
app.use("/api/documentation", swaggerUi.serve, swaggerUi.setup(swaggerFile, false, {
    docExpansion: "none"
}));

// Routes
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/savingRoutes"));
app.use("/api", require("./routes/withdrawalRoutes"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();