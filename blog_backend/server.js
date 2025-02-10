const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup: Create or open the SQLite database
const dbPath = path.resolve(__dirname, 'blog.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Create the posts table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);
});

// Fetch all posts
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching posts', error: err.message });
    }
    res.json(rows);
  });
});

// Create a new post
app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const stmt = db.prepare('INSERT INTO posts (title, content) VALUES (?, ?)');
  stmt.run([title, content], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error creating post', error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      title,
      content,
    });
  });
  stmt.finalize();
});

// Update a post
app.put('/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const stmt = db.prepare('UPDATE posts SET title = ?, content = ? WHERE id = ?');
  stmt.run([title, content, id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error updating post', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({
      id,
      title,
      content,
    });
  });
  stmt.finalize();
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  stmt.run([id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting post', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(204).send(); // No content
  });
  stmt.finalize();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
