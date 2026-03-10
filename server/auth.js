import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_ISSUER = 'futurescope';

export function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export async function hashPassword(password) {
  // bcryptjs avoids native module build issues on EC2.
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function signToken({ userId, email }) {
  const secret = requiredEnv('JWT_SECRET');
  return jwt.sign(
    { sub: userId, email },
    secret,
    { expiresIn: '7d', issuer: JWT_ISSUER }
  );
}

export function verifyToken(token) {
  const secret = requiredEnv('JWT_SECRET');
  return jwt.verify(token, secret, { issuer: JWT_ISSUER });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Missing Authorization header.' });

  try {
    const payload = verifyToken(match[1]);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

