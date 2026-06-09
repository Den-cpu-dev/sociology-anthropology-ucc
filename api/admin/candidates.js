import { getSupabase } from '../../lib/db.js';
import { uploadCandidatePhoto } from '../../lib/storage.js';
import { json, readJson, methodNotAllowed, requireAdmin } from '../../lib/http.js';

export default async function handler(req, res) {
  const admin = requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });

  const supabase = getSupabase();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select(
          'id, position_id, full_name, photo_url, manifesto_url, sort_order, is_active, positions ( slug, title )'
        )
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return json(res, 200, { candidates: data || [] });
    } catch (err) {
      console.error('candidates get', err);
      return json(res, 500, { error: 'server_error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await readJson(req);
      const positionId = body.position_id;
      const fullName = String(body.full_name || '').trim();

      if (!positionId || !fullName) {
        return json(res, 400, { error: 'missing_fields' });
      }

      let photoUrl = body.photo_url || null;
      if (body.photo_base64) {
        try {
          photoUrl = await uploadCandidatePhoto(body.photo_base64);
        } catch (uploadErr) {
          console.error('photo upload', uploadErr);
          const msg = uploadErr.message || '';
          if (msg.includes('Bucket not found') || msg.includes('bucket')) {
            return json(res, 503, {
              error: 'storage_not_configured',
              message: 'Create the election-photos bucket in Supabase (see docs).',
            });
          }
          if (msg.includes('image_too_large')) {
            return json(res, 400, { error: 'image_too_large' });
          }
          return json(res, 400, { error: 'invalid_image' });
        }
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert({
          position_id: positionId,
          full_name: fullName,
          photo_url: photoUrl,
          manifesto_url: body.manifesto_url || null,
          sort_order: Number(body.sort_order) || 0,
          is_active: true,
        })
        .select('id, position_id, full_name, photo_url, manifesto_url, sort_order')
        .single();

      if (error) throw error;
      return json(res, 201, { candidate: data });
    } catch (err) {
      console.error('candidates post', err);
      return json(res, 500, { error: 'server_error' });
    }
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
