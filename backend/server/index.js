import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.RDS_HOST || 'localhost',
  user: process.env.RDS_USER || 'admin',
  password: process.env.RDS_PASSWORD || 'password',
  database: process.env.RDS_DATABASE || 'edupapers',
  port: process.env.RDS_PORT || 3306,
  connectionLimit: 10,
});

app.get('/questions/:universityId/:courseId/:semester/:subjectName', async (req, res) => {
  const { universityId, courseId, semester, subjectName } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM questions WHERE university_id = ? AND course_id = ? AND semester = ? AND subject_name = ?',
      [universityId, courseId, semester, subjectName]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.get('/api/makaut/verify', async (req, res) => {
  const { url } = req.query;
  if (!url || !url.startsWith('https://www.makaut.com/papers/')) {
    return res.status(400).json({ error: 'Invalid URL. Must be a MAKAUT papers link.' });
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false, status: response.status });
    }
  } catch (error) {
    console.error('Error verifying link:', error);
    return res.status(500).json({ exists: false, error: 'Failed to verify URL' });
  }
});

app.post('/questions', async (req, res) => {
  const { universityId, courseId, semester, subjectName, content } = req.body;
  try {
    await pool.query(
      'INSERT INTO questions (university_id, course_id, semester, subject_name, content) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = ?',
      [universityId, courseId, semester, subjectName, content, content]
    );
    res.status(200).json({ message: 'Question saved successfully' });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ error: 'Failed to save question' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
