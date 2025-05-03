const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (Using environment variables for security)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql-1b51f828-vgu-course-registeration.l.aivencloud.com',
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || 'AVNS_TiROloXiWS7zRfsiwPt',
    database: process.env.DB_NAME || 'course_registration',
    port: process.env.DB_PORT || 10282
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
});

// Register a new course
app.post('/register', (req, res) => {
    const { name, enrollment, aec, vac, sec } = req.body;
    const sql = 'INSERT INTO courses (name, enrollment, aec, vac, sec) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, enrollment, aec, vac, sec], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ name, enrollment, aec, vac, sec });
    });
});

// Update an existing course
app.put('/update/:enrollment', (req, res) => {
    const { name, aec, vac, sec } = req.body;
    const enrollment = req.params.enrollment;
    const sql = 'UPDATE courses SET name=?, aec=?, vac=?, sec=? WHERE enrollment=?';
    db.query(sql, [name, aec, vac, sec, enrollment], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ name, enrollment, aec, vac, sec });
    });
});

// Search for a course by enrollment number
app.get('/search/:enrollment', (req, res) => {
    const enrollment = req.params.enrollment;
    const sql = 'SELECT * FROM courses WHERE enrollment=?';
    db.query(sql, [enrollment], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) res.json(results[0]);
        else res.status(404).send('No records found.');
    });
});

// Deregister a course
app.delete('/deregister/:enrollment', (req, res) => {
    const enrollment = req.params.enrollment;
    const sql = 'DELETE FROM courses WHERE enrollment=?';
    db.query(sql, [enrollment], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send('Course deregistered successfully.');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
