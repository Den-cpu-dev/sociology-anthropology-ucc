import { getSupabase } from '../../lib/db.js';
import { json, methodNotAllowed, requireAdmin } from '../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const admin = requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('positions')
      .select('id, slug, title, sort_order, max_winners')
      .order('sort_order');

    if (error) throw error;
    return json(res, 200, { positions: data || [] });
  } catch (err) {
    console.error('positions error', err);
    return json(res, 500, { error: 'server_error' });
  }
}
