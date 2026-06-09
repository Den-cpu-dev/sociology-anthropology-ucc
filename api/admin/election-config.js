import { getSupabase } from '../../lib/db.js';
import { json, readJson, methodNotAllowed, requireAdmin } from '../../lib/http.js';

export default async function handler(req, res) {
  const admin = requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });

  const supabase = getSupabase();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('election_config')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) return json(res, 500, { error: 'server_error' });
    return json(res, 200, data);
  }

  if (req.method === 'PATCH') {
    try {
      const body = await readJson(req);
      const patch = { updated_at: new Date().toISOString() };

      if (body.title !== undefined) patch.title = String(body.title);
      if (body.opens_at !== undefined) patch.opens_at = body.opens_at || null;
      if (body.closes_at !== undefined) patch.closes_at = body.closes_at || null;
      if (body.results_published !== undefined) {
        patch.results_published = Boolean(body.results_published);
      }

      const { data, error } = await supabase
        .from('election_config')
        .update(patch)
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      return json(res, 200, data);
    } catch (err) {
      console.error('election-config patch', err);
      return json(res, 500, { error: 'server_error' });
    }
  }

  return methodNotAllowed(res, ['GET', 'PATCH']);
}
