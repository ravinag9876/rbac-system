const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows the React frontend to talk to this backend
app.use(express.json()); // Parses incoming JSON payloads

// Initialize SQLite Database
const db = new sqlite3.Database('./rbac.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Construct the Schema
        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'Viewer'
            )`);
            
            // Insert a default Admin user if the table is empty
            db.get(`SELECT count(*) as count FROM users`, (err, row) => {
                if (row.count === 0) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync('admin123', salt);
                    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', hash, 'Admin']);
                    console.log('Default Admin user created (username: admin, password: admin123)');
                }
            });
        });
    }
});

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running', database: 'Connected' });
});
// ==========================================
// AUTHENTICATION & SECURITY ENGINE
// ==========================================

// 1. Login Endpoint (Generates JWT)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Verify password
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid password' });

        // Sign the JWT payload
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, role: user.role, username: user.username });
    });
});

// 2. Global Authentication Middleware
const verifyToken = (req, res, next) => {
    // Expecting header format: "Bearer <token>"
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) return res.status(403).json({ error: 'No token provided. Access denied.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid or expired token.' });
        req.user = decoded; // Attach the decoded user data to the request
        next(); // Proceed to the actual route
    });
};

// 3. Role-Based Authorization Middleware (The Gatekeeper)
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
        }
        next();
    };
};

// ==========================================
// PROTECTED API ENDPOINTS
// ==========================================

// This route requires a valid token AND the 'Admin' role
app.get('/api/users', verifyToken, requireRole('Admin'), (req, res) => {
    db.all(`SELECT id, username, role FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows); // Returns the user list to the frontend
    });
});
// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 
