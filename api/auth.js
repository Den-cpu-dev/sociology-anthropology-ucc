import { getSupabase } from '../lib/db.js';
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
  clearSessionCookie,
  getSession,
} from '../lib/auth.js';
import { getElectionConfig, getElectionStatus, getStudentById } from '../lib/election.js';
import { json, readJson, methodNotAllowed, normalizeIndex } from '../lib/http.js';

// Login handler logic
async function handleLogin(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const body = await readJson(req);
  const indexNumber = normalizeIndex(body.index_number);
  const password = String(body.password || '');

  if (!indexNumber || !password) {
    return json(res, 400, { error: 'missing_credentials' });
  }

  const config = await getElectionConfig();
  const election = getElectionStatus(config);

  const supabase = getSupabase();
  const { data: student, error } = await supabase
    .from('students')
    .select('id, index_number, full_name, level, password_hash, has_voted, voted_at')
    .eq('index_number', indexNumber)
    .maybeSingle();

  if (error) throw error;

  if (!student) {
    return json(res, 401, { error: 'invalid_credentials' });
  }

  const valid = await verifyPassword(password, student.password_hash);
  if (!valid) {
    return json(res, 401, { error: 'invalid_credentials' });
  }

  const token = await createSessionToken(student);
  setSessionCookie(res, token);

  return json(res, 200, {
    student: {
      index_number: student.index_number,
      full_name: student.full_name,
      level: student.level,
      has_voted: student.has_voted,
      voted_at: student.voted_at,
    },
    election: {
      title: config.title,
      ...election,
    },
  });
}

// Logout handler logic
async function handleLogout(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  clearSessionCookie(res);
  return json(res, 200, { ok: true });
}

// Me handler logic
async function handleMe(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const session = await getSession(req);
  if (!session) {
    return json(res, 401, { error: 'not_authenticated' });
  }

  const student = await getStudentById(session.studentId);
  if (!student) {
    return json(res, 401, { error: 'not_authenticated' });
  }

  const config = await getElectionConfig();
  const election = getElectionStatus(config);

  return json(res, 200, {
    student: {
      index_number: student.index_number,
      full_name: student.full_name,
      level: student.level,
      has_voted: student.has_voted,
      voted_at: student.voted_at,
    },
    election: {
      title: config.title,
      ...election,
    },
  });
}

export default async function handler(req, res) {
  let endpoint = req.query?.endpoint;
  if (!endpoint && req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      endpoint = urlObj.searchParams.get('endpoint');
      if (!endpoint) {
        const parts = urlObj.pathname.split('/');
        endpoint = parts[parts.length - 1];
      }
    } catch (e) {
      console.error('URL parsing failed in auth handler', e);
    }
  }

  try {
    if (endpoint === 'login') {
      return await handleLogin(req, res);
    } else if (endpoint === 'logout') {
      return await handleLogout(req, res);
    } else if (endpoint === 'me') {
      return await handleMe(req, res);
    } else {
      return json(res, 404, { error: 'endpoint_not_found' });
    }
  } catch (err) {
    console.error(`auth error [${endpoint}]`, err);
    return json(res, 500, { error: 'server_error' });
  }
}
