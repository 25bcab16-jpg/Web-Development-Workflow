const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Limit payload size
app.use(express.json({ limit: '10kb' }));

// SERVE STATIC FILES FROM PROJECT FOLDER
app.use(express.static(__dirname));

// ==================== MESSAGE STORAGE FUNCTIONS ====================
const messagesFile = path.join(__dirname, 'messages.json');

// Initialize messages.json if it doesn't exist
if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, JSON.stringify([], null, 2));
}

// Function to save message to file
function saveMessage(messageData) {
    try {
        let messages = [];
        if (fs.existsSync(messagesFile)) {
            const fileContent = fs.readFileSync(messagesFile, 'utf8');
            messages = JSON.parse(fileContent);
        }
        messages.push(messageData);
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
        return true;
    } catch (error) {
        console.error("❌ Error saving message to file:", error);
        return false;
    }
}

// Function to get all messages
function getAllMessages() {
    try {
        if (fs.existsSync(messagesFile)) {
            const fileContent = fs.readFileSync(messagesFile, 'utf8');
            return JSON.parse(fileContent);
        }
        return [];
    } catch (error) {
        console.error("❌ Error reading messages:", error);
        return [];
    }
}

// ==================== VALIDATION FUNCTIONS ====================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateName(name) {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
}

function validateSubject(subject) {
    return subject && subject.trim().length >= 3 && subject.trim().length <= 100;
}

function validateMessage(message) {
    return message && message.trim().length >= 10 && message.trim().length <= 1000;
}

// ==================== ROUTES ====================

// Test route
app.get("/", (req, res) => {
    res.json({ 
        message: "✅ Portfolio Server is running successfully!",
        version: "1.0.0",
        status: "active"
    });
});

// Contact form submission route
app.post("/contact", (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate each field
        if (!validateName(name)) {
            return res.status(400).json({
                success: false,
                message: "Invalid name format. Use 2-50 characters with letters only"
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        if (!validateSubject(subject)) {
            return res.status(400).json({
                success: false,
                message: "Subject must be 3-100 characters"
            });
        }

        if (!validateMessage(message)) {
            return res.status(400).json({
                success: false,
                message: "Message must be 10-1000 characters"
            });
        }

        // Log the received data
        console.log("📨 NEW MESSAGE RECEIVED:", {
            timestamp: new Date().toLocaleString(),
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim()
        });

        // Save message to JSON file
        const messageData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim()
        };
        
        const saved = saveMessage(messageData);
        
        if (saved) {
            console.log("✅ Message saved to database successfully!");
        } else {
            console.log("⚠️  Message received but storage failed");
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: "Message received successfully! We'll get back to you soon.",
            data: {
                receivedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later."
        });
    }
});

// NEW ROUTE: View all messages
app.get("/messages", (req, res) => {
    const messages = getAllMessages();
    res.json({
        success: true,
        totalMessages: messages.length,
        messages: messages
    });
});

// NEW ROUTE: Get message statistics
app.get("/messages/stats", (req, res) => {
    const messages = getAllMessages();
    res.json({
        success: true,
        stats: {
            totalMessages: messages.length,
            lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
            oldestMessage: messages.length > 0 ? messages[0] : null
        }
    });
});

// NEW ROUTE: Delete a message by ID
app.delete("/messages/:id", (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        let messages = getAllMessages();
        const initialLength = messages.length;
        messages = messages.filter(msg => msg.id !== messageId);
        
        if (messages.length < initialLength) {
            fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
            res.json({
                success: true,
                message: "Message deleted successfully"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting message"
        });
    }
});

// NEW ROUTE: Clear all messages
app.delete("/messages", (req, res) => {
    try {
        fs.writeFileSync(messagesFile, JSON.stringify([], null, 2));
        res.json({
            success: true,
            message: "All messages cleared"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error clearing messages"
        });
    }
});

// ==================== ERROR HANDLING ====================
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// General error handler
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err);
    res.status(500).json({
        success: false,
        message: "An unexpected error occurred"
    });
});

// ==================== SERVER START ====================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  🚀 Portfolio Server Started           ║
║  📍 URL: http://localhost:${PORT}        ║
║  🔄 CORS: Enabled                      ║
║  ✅ Status: Active & Ready             ║
╚════════════════════════════════════════╝
    `);
});