import { getElectionConfig, getElectionStatus } from '../../lib/election.js';
import { getSupabase } from '../../lib/db.js';
import { json, methodNotAllowed } from '../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const config = await getElectionConfig();
    const election = getElectionStatus(config);

    const supabase = getSupabase();
    const { count: eligible } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    const { count: voted } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('has_voted', true);

    const total = eligible || 0;
    const votedCount = voted || 0;

    return json(res, 200, {
      title: config.title,
      ...election,
      results_published: config.results_published,
      turnout: {
        eligible: total,
        voted: votedCount,
        percent: total ? Math.round((1000 * votedCount) / total) / 10 : 0,
      },
    });
  } catch (err) {
    console.error('status error', err);
    return json(res, 500, { error: 'server_error' });
  }
}
