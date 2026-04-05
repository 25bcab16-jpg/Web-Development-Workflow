const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    (isProduction ? null : "mongodb://127.0.0.1:27017");
const dbName = process.env.MONGODB_DB || process.env.MONGO_DB || "portfolio_db";
const staticDir = __dirname;

let messagesCollection;
let mongoClient;
let databaseStatus = "disconnected";

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticDir));

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateName(name) {
    return /^[a-zA-Z\s]{2,50}$/.test(name);
}

function validateSubject(subject) {
    return typeof subject === "string" && subject.trim().length >= 3 && subject.trim().length <= 100;
}

function validateMessage(message) {
    return typeof message === "string" && message.trim().length >= 10 && message.trim().length <= 1000;
}

async function connectDatabase() {
    if (!mongoUri) {
        databaseStatus = "not_configured";
        console.warn("MongoDB connection skipped. Set MONGODB_URI to enable contact form storage.");
        return;
    }

    try {
        mongoClient = new MongoClient(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });
        await mongoClient.connect();

        const db = mongoClient.db(dbName);
        messagesCollection = db.collection("messages");
        await messagesCollection.createIndex({ createdAt: -1 });
        databaseStatus = "connected";

        console.log(`Connected to MongoDB database "${dbName}"`);
    } catch (error) {
        databaseStatus = "error";
        messagesCollection = null;
        mongoClient = null;
        console.error("MongoDB connection failed. The site will stay online, but contact form submissions are disabled.");
        console.error(error.message);
    }
}

app.get("/", (req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
});

app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        database: databaseStatus
    });
});

app.post("/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (!validateName(name)) {
            return res.status(400).json({
                success: false,
                message: "Name must be 2-50 characters and contain only letters."
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (!validateSubject(subject)) {
            return res.status(400).json({
                success: false,
                message: "Subject must be 3-100 characters."
            });
        }

        if (!validateMessage(message)) {
            return res.status(400).json({
                success: false,
                message: "Message must be 10-1000 characters."
            });
        }

        if (!messagesCollection) {
            return res.status(503).json({
                success: false,
                message: "Contact form is temporarily unavailable."
            });
        }

        await messagesCollection.insertOne({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
            createdAt: new Date()
        });

        return res.status(200).json({
            success: true,
            message: "Message saved successfully."
        });
    } catch (error) {
        console.error("Contact form error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to save your message right now."
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

let server;

async function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }

    if (mongoClient) {
        await mongoClient.close();
    }

    process.exit(0);
}

process.on("SIGINT", () => {
    shutdown("SIGINT").catch((error) => {
        console.error("Error during SIGINT shutdown:", error);
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    shutdown("SIGTERM").catch((error) => {
        console.error("Error during SIGTERM shutdown:", error);
        process.exit(1);
    });
});

async function startServer() {
    await connectDatabase();

    server = app.listen(PORT, () => {
        console.log(`Portfolio server running on port ${PORT}`);
    });
}

startServer();
