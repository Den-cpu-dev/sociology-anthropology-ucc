import { getSession } from '../../lib/auth.js';
import { getElectionConfig, getElectionStatus, getStudentById } from '../../lib/election.js';
import { json, methodNotAllowed } from '../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const session = await getSession(req);
    if (!session) {
      return json(res, 401, { error: 'not_authenticated' });
    }

    const student = await getStudentById(session.studentId);
    if (!student) {
      return json(res, 401, { error: 'not_authenticated' });
    }

    const config = await getElectionConfig();
    const election = getElectionStatus(config);

    return json(res, 200, {
      student: {
        index_number: student.index_number,
        full_name: student.full_name,
        level: student.level,
        has_voted: student.has_voted,
        voted_at: student.voted_at,
      },
      election: {
        title: config.title,
        ...election,
      },
    });
  } catch (err) {
    console.error('me error', err);
    return json(res, 500, { error: 'server_error' });
  }
}
