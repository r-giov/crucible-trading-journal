const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = 'trades.db';

// Initialize database
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to SQLite database');
    
    db.run(`CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        symbol TEXT NOT NULL,
        type TEXT CHECK(type IN ('BUY', 'SELL')) NOT NULL,
        quantity REAL NOT NULL,
        entry REAL NOT NULL,
        exit REAL,
        notes TEXT
    )`);
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Create trade
app.post('/trades', (req, res) => {
    const { symbol, type, quantity, entry, exit, notes } = req.body;
    
    db.run(
        `INSERT INTO trades (symbol, type, quantity, entry, exit, notes) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [symbol, type, quantity, entry, exit, notes],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Get all trades
app.get('/trades', (req, res) => {
    db.all("SELECT * FROM trades ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});