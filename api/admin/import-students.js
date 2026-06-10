import { getSupabase } from '../../lib/db.js';
import { hashPassword } from '../../lib/auth.js';
import { json, readJson, methodNotAllowed, requireAdmin, normalizeIndex } from '../../lib/http.js';

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = header.indexOf('index_number');
  const nameIdx = header.indexOf('full_name');
  const levelIdx = header.indexOf('level');
  const passIdx = header.indexOf('password');

  if (idx === -1 || nameIdx === -1 || passIdx === -1) {
    throw new Error('CSV must include index_number, full_name, password columns');
  }

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      index_number: normalizeIndex(cols[idx]),
      full_name: cols[nameIdx],
      level: levelIdx >= 0 ? cols[levelIdx] || null : null,
      password: cols[passIdx],
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
    } else if (Array.isArray(body.students)) {
      rows = body.students.map((s) => ({
        index_number: normalizeIndex(s.index_number),
        full_name: String(s.full_name || '').trim(),
        level: s.level ? String(s.level).trim() : null,
        password: String(s.password || ''),
      }));
    } else {
      return json(res, 400, { error: 'provide_csv_or_students_array' });
    }

    const replace = Boolean(body.replace);

    rows = rows.filter((r) => r.index_number && r.full_name && r.password);
    if (!rows.length) {
      return json(res, 400, { error: 'no_valid_rows' });
    }

    const supabase = getSupabase();

    if (replace) {
      const { count: voted } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('has_voted', true);

      if (voted > 0) {
        return json(res, 409, { error: 'cannot_replace_after_votes_cast' });
      }

      await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const payload = [];
    for (const row of rows) {
      payload.push({
        index_number: row.index_number,
        full_name: row.full_name,
        level: row.level,
        password_hash: await hashPassword(row.password),
        has_voted: false,
        voted_at: null,
      });
    }

    const { data, error } = await supabase
      .from('students')
      .upsert(payload, { onConflict: 'index_number' })
      .select('id');

    if (error) throw error;

    return json(res, 200, {
      imported: data?.length || payload.length,
      replace,
    });
  } catch (err) {
    console.error('import-students error', err);
    return json(res, 500, { error: err.message || 'server_error' });
  }
}
