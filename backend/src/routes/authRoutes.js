const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();
const SALT_ROUNDS = 12;

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
  if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.json({ accessToken: token });
});

function authJwt(req, res, next) {
  const token = req.query.token;
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.sendStatus(401);
  }
}

router.get('/profile', authJwt, (req, res) => {
  res.json({ userId: req.userId });
});

function authJwtAsParam(req, res, next) {
  const token = req.params.token;
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.sendStatus(401);
  }
}

module.exports = {router,authJwt,authJwtAsParam};