import { getSupabase } from '../../lib/db.js';
import { getElectionConfig, getElectionStatus } from '../../lib/election.js';
import { computeWinnerDeclaration } from '../../lib/winners.js';
import { json, methodNotAllowed, requireAdmin } from '../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const admin = requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });

  try {
    const supabase = getSupabase();
    const config = await getElectionConfig();
    const election = getElectionStatus(config);

    const { data: turnout, error: tErr } = await supabase
      .from('election_turnout')
      .select('*')
      .single();
    if (tErr) throw tErr;

    const { data: positions, error: pErr } = await supabase
      .from('positions')
      .select('id, slug, title, sort_order')
      .order('sort_order');
    if (pErr) throw pErr;

    const { data: candidates, error: cErr } = await supabase
      .from('candidates')
      .select('id, position_id, full_name, photo_url, manifesto_url, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order');
    if (cErr) throw cErr;

    const { data: voteRows, error: vErr } = await supabase
      .from('votes')
      .select('position_id, candidate_id');
    if (vErr) throw vErr;

    const abstentionByPosition = {};
    const votesByCandidate = {};

    for (const row of voteRows || []) {
      if (!row.candidate_id) {
        abstentionByPosition[row.position_id] =
          (abstentionByPosition[row.position_id] || 0) + 1;
      } else {
        votesByCandidate[row.candidate_id] =
          (votesByCandidate[row.candidate_id] || 0) + 1;
      }
    }

    const notVoted = (turnout.total_eligible || 0) - (turnout.total_voted || 0);

    const positionResults = (positions || []).map((pos) => {
      const posCandidates = (candidates || [])
        .filter((c) => c.position_id === pos.id)
        .map((c) => ({
          id: c.id,
          full_name: c.full_name,
          photo_url: c.photo_url,
          manifesto_url: c.manifesto_url,
          votes: votesByCandidate[c.id] || 0,
        }))
        .sort((a, b) => b.votes - a.votes);

      const abstentions = abstentionByPosition[pos.id] || 0;
      const declaration = computeWinnerDeclaration(posCandidates, abstentions);

      return {
        id: pos.id,
        slug: pos.slug,
        title: pos.title,
        abstentions,
        candidates: posCandidates,
        declaration,
      };
    });

    const declaredCount = positionResults.filter(
      (p) => p.declaration.status === 'declared'
    ).length;
    const tieCount = positionResults.filter((p) => p.declaration.status === 'tie').length;

    return json(res, 200, {
      election: {
        title: config.title,
        results_published: config.results_published,
        ...election,
      },
      turnout: {
        ...turnout,
        not_voted: notVoted,
      },
      summary: {
        offices: positionResults.length,
        declared_winners: declaredCount,
        ties_pending: tieCount,
        candidates_registered: (candidates || []).length,
      },
      positions: positionResults,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('dashboard error', err);
    return json(res, 500, { error: 'server_error' });
  }
}
