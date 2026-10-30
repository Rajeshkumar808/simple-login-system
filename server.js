const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// REST API routes
app.use("/api", require("./routes/authRoutes"));

// Health check for Google Cloud Run
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Login API is running"
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
