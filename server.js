require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const fields = [
  'course_code', 'course_name', 'lecturer_name',
  'venue', 'day_of_week', 'start_time', 'end_time'
];

function validateTimetable(body) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === '');
  return missing;
}

app.get('/', (_req, res) => {
  res.json({ message: 'Timetable API Running' });
});

// GET /api/timetable - list all records
app.get('/api/timetable', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM timetable ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('List timetable error:', err.message);
    res.status(500).json({ error: 'Could not retrieve timetable records.' });
  }
});

// GET /api/timetable/:id - retrieve one record
app.get('/api/timetable/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM timetable WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get timetable error:', err.message);
    res.status(500).json({ error: 'Could not retrieve the timetable record.' });
  }
});

// POST /api/timetable - create a record
app.post('/api/timetable', async (req, res) => {
  const missing = validateTimetable(req.body);
  if (missing.length) {
    return res.status(400).json({ message: 'All fields are required.', missing });
  }

  try {
    const values = fields.map((field) => req.body[field]);
    const [result] = await db.query(
      `INSERT INTO timetable (${fields.join(', ')}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      values
    );
    const [rows] = await db.query('SELECT * FROM timetable WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create timetable error:', err.message);
    res.status(500).json({ error: 'Could not create the timetable record.' });
  }
});

// PUT /api/timetable/:id - update a record
app.put('/api/timetable/:id', async (req, res) => {
  const missing = validateTimetable(req.body);
  if (missing.length) {
    return res.status(400).json({ message: 'All fields are required.', missing });
  }

  try {
    const values = fields.map((field) => req.body[field]);
    const [result] = await db.query(
      `UPDATE timetable SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`,
      [...values, req.params.id]
    );
    if (!result.affectedRows) {
      const [existing] = await db.query('SELECT id FROM timetable WHERE id = ?', [req.params.id]);
      if (!existing.length) return res.status(404).json({ message: 'Record not found' });
    }
    const [rows] = await db.query('SELECT * FROM timetable WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update timetable error:', err.message);
    res.status(500).json({ error: 'Could not update the timetable record.' });
  }
});

// DELETE /api/timetable/:id - delete a record
app.delete('/api/timetable/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM timetable WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Delete timetable error:', err.message);
    res.status(500).json({ error: 'Could not delete the timetable record.' });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unexpected server error:', err.message);
  res.status(400).json({ error: 'Invalid request.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
