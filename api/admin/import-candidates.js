import { getSupabase } from '../../lib/db.js';
import { json, readJson, methodNotAllowed, requireAdmin } from '../../lib/http.js';

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const slugIdx = header.indexOf('position_slug');
  const nameIdx = header.indexOf('full_name');
  const photoIdx = header.indexOf('photo_url');
  const manifestoIdx = header.indexOf('manifesto_url');
  const orderIdx = header.indexOf('sort_order');

  if (slugIdx === -1 || nameIdx === -1) {
    throw new Error('CSV must include position_slug and full_name columns');
  }

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      position_slug: cols[slugIdx].toLowerCase(),
      full_name: cols[nameIdx],
      photo_url: photoIdx >= 0 ? cols[photoIdx] || null : null,
      manifesto_url: manifestoIdx >= 0 ? cols[manifestoIdx] || null : null,
      sort_order: orderIdx >= 0 ? parseInt(cols[orderIdx], 10) || 0 : 0,
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const admin = requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });

  try {
    const body = await readJson(req);
    let rows = [];

    if (body.csv) {
      rows = parseCsv(body.csv);
    } else if (Array.isArray(body.candidates)) {
      rows = body.candidates;
    } else {
      return json(res, 400, { error: 'provide_csv_or_candidates_array' });
    }

    if (body.replace) {
      await getSupabase().from('candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const supabase = getSupabase();
    const { data: positions } = await supabase.from('positions').select('id, slug');
    const slugToId = Object.fromEntries((positions || []).map((p) => [p.slug, p.id]));

    const payload = [];
    for (const row of rows) {
      const positionId = slugToId[row.position_slug];
      if (!positionId || !row.full_name) continue;
      payload.push({
        position_id: positionId,
        full_name: row.full_name,
        photo_url: row.photo_url || null,
        manifesto_url: row.manifesto_url || null,
        sort_order: row.sort_order || 0,
        is_active: true,
      });
    }

    if (!payload.length) {
      return json(res, 400, { error: 'no_valid_rows' });
    }

    const { data, error } = await supabase.from('candidates').insert(payload).select('id');
    if (error) throw error;

    return json(res, 200, { imported: data?.length || 0 });
  } catch (err) {
    console.error('import-candidates error', err);
    return json(res, 500, { error: err.message || 'server_error' });
  }
}
