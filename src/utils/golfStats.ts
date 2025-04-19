interface RoundScore {
  total_score: number;
  date_played: string;
}

export function calculateHandicap(rounds: RoundScore[], courseRating = 72): number {
  if (rounds.length === 0) return 0;

  // Sort rounds by date, most recent first
  const sortedRounds = [...rounds].sort((a, b) => 
    new Date(b.date_played).getTime() - new Date(a.date_played).getTime()
  );

  // Take the most recent 20 rounds
  const recentRounds = sortedRounds.slice(0, 20);

  // Calculate differentials (score - course rating)
  const differentials = recentRounds.map(round => round.total_score - courseRating);

  // If less than 20 rounds, use a modified calculation
  if (recentRounds.length < 20) {
    const handicapDifferentials = differentials.sort((a, b) => a - b);
    const roundsToUse = Math.min(Math.floor(recentRounds.length * 0.4), differentials.length);
    const bestDifferentials = handicapDifferentials.slice(0, roundsToUse);
    return Number((bestDifferentials.reduce((sum, diff) => sum + diff, 0) / roundsToUse).toFixed(1));
  }

  // For 20 rounds, use the best 8 differentials
  const bestEightDifferentials = differentials
    .sort((a, b) => a - b)
    .slice(0, 8);

  return Number((bestEightDifferentials.reduce((sum, diff) => sum + diff, 0) / 8).toFixed(1));
}

export function calculateAverageScore(rounds: RoundScore[]): number {
  if (rounds.length === 0) return 0;
  const total = rounds.reduce((sum, round) => sum + round.total_score, 0);
  return Math.round(total / rounds.length);
}

export function calculateHandicapTrend(rounds: RoundScore[]): 'improving' | 'steady' | 'declining' {
  if (rounds.length < 5) return 'steady';

  // Sort rounds by date, oldest first
  const sortedRounds = [...rounds].sort((a, b) => 
    new Date(a.date_played).getTime() - new Date(b.date_played).getTime()
  );

  // Calculate moving average for first and last 5 rounds
  const firstFive = sortedRounds.slice(0, 5);
  const lastFive = sortedRounds.slice(-5);

  const firstAvg = firstFive.reduce((sum, round) => sum + round.total_score, 0) / 5;
  const lastAvg = lastFive.reduce((sum, round) => sum + round.total_score, 0) / 5;

  const difference = lastAvg - firstAvg;

  if (difference <= -1) return 'improving';
  if (difference >= 1) return 'declining';
  return 'steady';
} 