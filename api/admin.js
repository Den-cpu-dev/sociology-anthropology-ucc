import { getSupabase } from '../lib/db.js';
import { uploadCandidatePhoto } from '../lib/storage.js';
import { getElectionConfig, getElectionStatus } from '../lib/election.js';
import { computeWinnerDeclaration } from '../lib/winners.js';
import { hashPassword } from '../lib/auth.js';
import { json, readJson, methodNotAllowed, requireAdmin, normalizeIndex } from '../lib/http.js';

// candidate (PATCH, DELETE)
async function handleCandidate(req, res, supabase) {
  const id = req.query?.id;
  if (!id) return json(res, 400, { error: 'missing_id' });

  if (req.method === 'PATCH') {
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
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('candidates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, ['PATCH', 'DELETE']);
}

// candidates (GET, POST)
async function handleCandidates(req, res, supabase) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('candidates')
      .select('id, position_id, full_name, photo_url, manifesto_url, sort_order, is_active, positions ( slug, title )')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return json(res, 200, { candidates: data || [] });
  }

  if (req.method === 'POST') {
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
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

// dashboard (GET)
async function handleDashboard(req, res, supabase) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

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
}

// election-config (GET, PATCH)
async function handleElectionConfig(req, res, supabase) {
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
  }

  return methodNotAllowed(res, ['GET', 'PATCH']);
}

// import-candidates (POST)
async function handleImportCandidates(req, res, supabase) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  function parseCandidatesCsv(text) {
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

  const body = await readJson(req);
  let rows = [];

  if (body.csv) {
    rows = parseCandidatesCsv(body.csv);
  } else if (Array.isArray(body.candidates)) {
    rows = body.candidates;
  } else {
    return json(res, 400, { error: 'provide_csv_or_candidates_array' });
  }

  if (body.replace) {
    await supabase.from('candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

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
}

// import-students (POST)
async function handleImportStudents(req, res, supabase) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  function parseStudentsCsv(text) {
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

  const body = await readJson(req);
  let rows = [];

  if (body.csv) {
    rows = parseStudentsCsv(body.csv);
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
}

// positions (GET)
async function handlePositions(req, res, supabase) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const { data, error } = await supabase
    .from('positions')
    .select('id, slug, title, sort_order, max_winners')
    .order('sort_order');

  if (error) throw error;
  return json(res, 200, { positions: data || [] });
}

// results (GET)
async function handleResults(req, res, supabase) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

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
}

export default async function handler(req, res) {
  const admin = requireAdmin(req);
  if (!admin.ok) return json(res, admin.status, { error: admin.error });

  let endpoint = req.query?.endpoint;
  if (!endpoint && req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      endpoint = urlObj.searchParams.get('endpoint');
      if (!endpoint) {
        const parts = urlObj.pathname.split('/');
        endpoint = parts[parts.length - 1];
      }
    } catch (e) {
      console.error('URL parsing failed in admin handler', e);
    }
  }
  const supabase = getSupabase();

  try {
    if (endpoint === 'candidate') {
      return await handleCandidate(req, res, supabase);
    } else if (endpoint === 'candidates') {
      return await handleCandidates(req, res, supabase);
    } else if (endpoint === 'dashboard') {
      return await handleDashboard(req, res, supabase);
    } else if (endpoint === 'election-config') {
      return await handleElectionConfig(req, res, supabase);
    } else if (endpoint === 'import-candidates') {
      return await handleImportCandidates(req, res, supabase);
    } else if (endpoint === 'import-students') {
      return await handleImportStudents(req, res, supabase);
    } else if (endpoint === 'positions') {
      return await handlePositions(req, res, supabase);
    } else if (endpoint === 'results') {
      return await handleResults(req, res, supabase);
    } else {
      return json(res, 404, { error: 'endpoint_not_found' });
    }
  } catch (err) {
    console.error(`admin error [${endpoint}]`, err);
    return json(res, 500, { error: err.message || 'server_error' });
  }
}
