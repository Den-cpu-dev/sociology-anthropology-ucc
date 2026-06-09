/**
 * Determine winner(s) for a position from vote tallies.
 */
export function computeWinnerDeclaration(candidates, abstentions) {
  const list = (candidates || []).map((c) => ({
    ...c,
    votes: Number(c.votes) || 0,
  }));

  const totalBallots = list.reduce((s, c) => s + c.votes, 0) + (Number(abstentions) || 0);

  if (!list.length) {
    return {
      status: 'no_candidates',
      winner: null,
      tied: [],
      is_tie: false,
      total_ballots: totalBallots,
      message: 'No candidates registered for this office.',
    };
  }

  const maxVotes = Math.max(...list.map((c) => c.votes));
  if (maxVotes === 0) {
    return {
      status: 'awaiting_votes',
      winner: null,
      tied: [],
      is_tie: false,
      total_ballots: totalBallots,
      message: 'No votes cast yet for this office.',
    };
  }

  const top = list.filter((c) => c.votes === maxVotes);
  if (top.length > 1) {
    return {
      status: 'tie',
      winner: null,
      tied: top,
      is_tie: true,
      total_ballots: totalBallots,
      message: `Tie between ${top.length} candidates (${maxVotes} votes each). Electoral Commissioner must resolve.`,
    };
  }

  const winner = top[0];
  const share =
    totalBallots > 0 ? Math.round((1000 * winner.votes) / totalBallots) / 10 : 0;

  return {
    status: 'declared',
    winner: { ...winner, vote_share_percent: share },
    tied: [],
    is_tie: false,
    total_ballots: totalBallots,
    message: `Declared winner with ${winner.votes} vote${winner.votes === 1 ? '' : 's'} (${share}% of ballots cast).`,
  };
}
