import { getSupabase } from '../../lib/db.js';
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
  normalizeIndex,
} from '../../lib/auth.js';
import { getElectionConfig, getElectionStatus } from '../../lib/election.js';
import { json, readJson, methodNotAllowed } from '../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
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
  } catch (err) {
    console.error('login error', err);
    return json(res, 500, { error: 'server_error' });
  }
}
