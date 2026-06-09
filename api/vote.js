import { getSession } from '../lib/auth.js';
import { getStudentById } from '../lib/election.js';
import { getSupabase } from '../lib/db.js';
import { json, readJson, methodNotAllowed } from '../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const session = await getSession(req);
    if (!session) {
      return json(res, 401, { error: 'not_authenticated' });
    }

    const student = await getStudentById(session.studentId);
    if (!student) {
      return json(res, 401, { error: 'not_authenticated' });
    }

    if (student.has_voted) {
      return json(res, 403, { error: 'already_voted' });
    }

    const body = await readJson(req);
    const choices = Array.isArray(body.choices) ? body.choices : [];

    if (!choices.length) {
      return json(res, 400, { error: 'empty_ballot' });
    }

    const supabase = getSupabase();

    const { data: positions } = await supabase.from('positions').select('id');
    const positionIds = new Set((positions || []).map((p) => p.id));

    const normalized = [];
    const seen = new Set();

    for (const item of choices) {
      const positionId = item.position_id;
      if (!positionId || seen.has(positionId)) continue;
      if (!positionIds.has(positionId)) {
        return json(res, 400, { error: 'invalid_position' });
      }
      seen.add(positionId);
      normalized.push({
        position_id: positionId,
        candidate_id: item.candidate_id || null,
      });
    }

    if (seen.size !== positionIds.size) {
      return json(res, 400, { error: 'incomplete_ballot', required: positionIds.size });
    }

    const { error } = await supabase.rpc('submit_ballot', {
      p_student_id: student.id,
      p_choices: normalized,
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('already_voted')) {
        return json(res, 403, { error: 'already_voted' });
      }
      if (msg.includes('election_not_open')) {
        return json(res, 403, { error: 'election_not_open' });
      }
      if (msg.includes('election_closed')) {
        return json(res, 403, { error: 'election_closed' });
      }
      if (msg.includes('invalid_candidate') || msg.includes('invalid_position')) {
        return json(res, 400, { error: 'invalid_ballot' });
      }
      throw error;
    }

    return json(res, 200, {
      ok: true,
      message: 'Your vote has been recorded. Thank you for participating.',
    });
  } catch (err) {
    console.error('vote error', err);
    return json(res, 500, { error: 'server_error' });
  }
}
