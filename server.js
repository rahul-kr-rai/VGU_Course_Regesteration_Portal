require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000; // Allow configurable port

app.use(cors());
app.use(bodyParser.json());

// MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'course_registration',
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL with error handling
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    process.exit(1); // Stop server if DB connection fails
  }
  console.log("Connected to MySQL!");
});

// Register course
app.post('/register', (req, res) => {
  const { name, enrollment, aec, vac, sec } = req.body;
  const sql = 'INSERT INTO registrations (enrollment, name, aec, vac, sec) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [enrollment, name, aec, vac, sec], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).send('Enrollment number already registered!');
      } else {
        console.error("Database error:", err.message);
        res.status(500).send("Internal server error.");
      }
    } else {
      res.json({ name, enrollment, aec, vac, sec });
    }
  });
});

// Update course
app.put('/update/:enrollment', (req, res) => {
  const { enrollment } = req.params;
  const { name, aec, vac, sec } = req.body;
  const sql = 'UPDATE registrations SET name = ?, aec = ?, vac, sec = ? WHERE enrollment = ?';
  db.query(sql, [name, aec, vac, sec, enrollment], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      res.status(500).send("Internal server error.");
    } else if (results.affectedRows === 0) {
      res.status(404).send('Enrollment not found!');
    } else {
      res.json({ name, enrollment, aec, vac, sec });
    }
  });
});

// Deregister course
app.delete('/deregister/:enrollment', (req, res) => {
  const { enrollment } = req.params;
  const sql = 'DELETE FROM registrations WHERE enrollment = ?';
  db.query(sql, [enrollment], (err) => {
    if (err) {
      console.error("Database error:", err.message);
      res.status(500).send("Internal server error.");
    } else {
      res.sendStatus(200);
    }
  });
});

// Search for a course by enrollment number
app.get('/search/:enrollment', (req, res) => {
  const { enrollment } = req.params;
  const sql = 'SELECT * FROM registrations WHERE enrollment = ?';

  db.query(sql, [enrollment], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      res.status(500).send("Internal server error.");
    } else if (results.length === 0) {
      res.status(404).send('No records found.');
    } else {
      res.json(results[0]); // Send the matching record
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at https://vgu-course-regesteration-portal-1.onrender.com:${port}`);
});
