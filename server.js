const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGO_DB || "portfolio_db";

let messagesCollection;

app.use(express.json({ limit: "10kb" }));
app.use(express.static(__dirname));

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
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db(dbName);
    messagesCollection = db.collection("messages");
    await messagesCollection.createIndex({ createdAt: -1 });

    console.log(`Connected to MongoDB at ${mongoUri}/${dbName}`);
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
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
            return res.status(500).json({
                success: false,
                message: "Database connection is not available."
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

connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Portfolio server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    });
