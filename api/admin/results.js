import { getSupabase } from '../../lib/db.js';
import { json, methodNotAllowed, requireAdmin } from '../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const admin = requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });

  try {
    const supabase = getSupabase();

    const { data: turnout, error: tErr } = await supabase
      .from('election_turnout')
      .select('*')
      .single();
    if (tErr) throw tErr;

    const { data: results, error: rErr } = await supabase
      .from('election_results')
      .select('*');
    if (rErr) throw rErr;

    const byPosition = {};
    for (const row of results || []) {
      if (!byPosition[row.position_id]) {
        byPosition[row.position_id] = {
          slug: row.slug,
          title: row.position_title,
          candidates: [],
          abstentions: 0,
        };
      }
      if (row.candidate_id) {
        byPosition[row.position_id].candidates.push({
          id: row.candidate_id,
          name: row.candidate_name,
          votes: row.vote_count || 0,
        });
      }
    }

    const { count: abstainRows } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .is('candidate_id', null);

    return json(res, 200, {
      turnout,
      positions: Object.values(byPosition),
      total_abstentions: abstainRows || 0,
    });
  } catch (err) {
    console.error('results error', err);
    return json(res, 500, { error: 'server_error' });
  }
}
