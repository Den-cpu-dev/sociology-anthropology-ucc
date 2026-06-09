import { getSupabase } from '../../lib/db.js';
import { uploadCandidatePhoto } from '../../lib/storage.js';
import { json, readJson, methodNotAllowed, requireAdmin } from '../../lib/http.js';

export default async function handler(req, res) {
  const admin = requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });

  const id = req.query?.id;
  if (!id) return json(res, 400, { error: 'missing_id' });

  const supabase = getSupabase();

  if (req.method === 'PATCH') {
    try {
      const body = await readJson(req);
      const patch = {};

      if (body.full_name !== undefined) patch.full_name = String(body.full_name).trim();
      if (body.position_id !== undefined) patch.position_id = body.position_id;
      if (body.manifesto_url !== undefined) patch.manifesto_url = body.manifesto_url || null;
      if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;

      if (body.photo_base64) {
        patch.photo_url = await uploadCandidatePhoto(body.photo_base64);
      } else if (body.photo_url !== undefined) {
        patch.photo_url = body.photo_url;
      }

      const { data, error } = await supabase
        .from('candidates')
        .update(patch)
        .eq('id', id)
        .select('id, position_id, full_name, photo_url, manifesto_url, sort_order')
        .single();

      if (error) throw error;
      return json(res, 200, { candidate: data });
    } catch (err) {
      console.error('candidate patch', err);
      return json(res, 500, { error: 'server_error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return json(res, 200, { ok: true });
    } catch (err) {
      console.error('candidate delete', err);
      return json(res, 500, { error: 'server_error' });
    }
  }

  return methodNotAllowed(res, ['PATCH', 'DELETE']);
}
