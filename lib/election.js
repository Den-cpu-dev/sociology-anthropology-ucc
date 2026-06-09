import { getSupabase } from './db.js';

export async function getElectionConfig() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('election_config')
    .select('title, opens_at, closes_at, results_published')
    .eq('id', 1)
    .single();

  if (error) throw error;
  return data;
}

export function getElectionStatus(config) {
  const now = Date.now();
  const opens = config.opens_at ? new Date(config.opens_at).getTime() : null;
  const closes = config.closes_at ? new Date(config.closes_at).getTime() : null;

  if (opens && now < opens) {
    return { status: 'not_open', opensAt: config.opens_at, closesAt: config.closes_at };
  }
  if (closes && now > closes) {
    return { status: 'closed', opensAt: config.opens_at, closesAt: config.closes_at };
  }
  return { status: 'open', opensAt: config.opens_at, closesAt: config.closes_at };
}

export async function getStudentById(studentId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('students')
    .select('id, index_number, full_name, level, has_voted, voted_at')
    .eq('id', studentId)
    .single();

  if (error) return null;
  return data;
}
