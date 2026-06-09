import { getSession } from '../lib/auth.js';
import { getElectionConfig, getElectionStatus, getStudentById } from '../lib/election.js';
import { getSupabase } from '../lib/db.js';
import { json, methodNotAllowed } from '../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
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

    if (election.status !== 'open') {
      return json(res, 403, { error: 'election_not_open', election });
    }

    if (student.has_voted) {
      return json(res, 403, { error: 'already_voted' });
    }

    const supabase = getSupabase();

    const { data: positions, error: posErr } = await supabase
      .from('positions')
      .select('id, slug, title, sort_order, max_winners')
      .order('sort_order');

    if (posErr) throw posErr;

    const { data: candidates, error: candErr } = await supabase
      .from('candidates')
      .select('id, position_id, full_name, photo_url, manifesto_url, sort_order')
      .eq('is_active', true)
      .order('sort_order');

    if (candErr) throw candErr;

    const ballot = positions.map((pos) => ({
      ...pos,
      candidates: candidates.filter((c) => c.position_id === pos.id),
    }));

    return json(res, 200, {
      student: {
        full_name: student.full_name,
        index_number: student.index_number,
        level: student.level,
      },
      election: { title: config.title, ...election },
      ballot,
    });
  } catch (err) {
    console.error('ballot error', err);
    return json(res, 500, { error: 'server_error' });
  }
}
