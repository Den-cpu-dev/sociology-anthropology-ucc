export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  return json(res, 405, { error: 'method_not_allowed' });
}

export function requireAdmin(req) {
  const adminSecret = process.env.ADMIN_SECRET;
  const ecSecret = process.env.EC_DASHBOARD_PASSWORD;

  if (!adminSecret && !ecSecret) {
    return { ok: false, status: 503, error: 'admin_not_configured' };
  }

  const header = req.headers['x-admin-key'] || req.headers['authorization'];
  const provided =
    typeof header === 'string' && header.startsWith('Bearer ')
      ? header.slice(7)
      : header;

  if (!provided) {
    return { ok: false, status: 401, error: 'unauthorized' };
  }

  const valid =
    (adminSecret && provided === adminSecret) ||
    (ecSecret && provided === ecSecret);

  if (!valid) {
    return { ok: false, status: 401, error: 'unauthorized' };
  }

  return { ok: true, role: ecSecret && provided === ecSecret ? 'commissioner' : 'admin' };
}

export function normalizeIndex(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}
