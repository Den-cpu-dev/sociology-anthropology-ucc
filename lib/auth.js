import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { normalizeIndex } from './http.js';

const COOKIE_NAME = 'soasa_vote_session';
const MAX_AGE_SEC = 60 * 60 * 4; // 4 hours on election day

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(student) {
  return new SignJWT({
    name: student.full_name,
    level: student.level || null,
    idx: student.index_number,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(student.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      studentId: payload.sub,
      indexNumber: payload.idx,
      fullName: payload.name,
      level: payload.level,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure}`
  );
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
}

export function getTokenFromRequest(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (match) return decodeURIComponent(match[1]);

  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }

  return null;
}

export async function getSession(req) {
  const token = getTokenFromRequest(req);
  return verifySessionToken(token);
}

export { COOKIE_NAME, normalizeIndex };
