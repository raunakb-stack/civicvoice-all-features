/**
 * Rule-based Priority Score
 * Priority = (votes × 2) + (emergency ? 20 : 0)
 */
const calcPriorityScore = (votes = 0, emergency = false) =>
  votes * 2 + (emergency ? 20 : 0);

/**
 * Determine escalation level based on hours since creation
 * 0 = none, 1 = Senior Officer (>48h), 2 = Commissioner (>120h/5 days)
 */
const getEscalationLevel = (createdAt, status) => {
  if (status === 'Resolved') return 0;
  const hoursElapsed = (Date.now() - new Date(createdAt)) / 3600000;
  if (hoursElapsed > 120) return 2;
  if (hoursElapsed > 48)  return 1;
  return 0;
};

module.exports = { calcPriorityScore, getEscalationLevel };
