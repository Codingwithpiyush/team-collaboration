const inferCategoryAndDifficulty = (categoryName, xpReward) => {
  let difficulty = 'Medium';
  if (xpReward <= 100) {
    difficulty = 'Easy';
  } else if (xpReward > 200) {
    difficulty = 'Hard';
  }

  let evidence = 'Photo upload / logs';
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('carbon') || cat.includes('footprint') || cat.includes('travel') || cat.includes('commute')) {
    evidence = 'Transit receipts / travel log snapshot';
  } else if (cat.includes('waste') || cat.includes('recycle') || cat.includes('plastic')) {
    evidence = 'Photo of recycling bin / waste receipts';
  } else if (cat.includes('energy') || cat.includes('electricity') || cat.includes('power')) {
    evidence = 'Utility bill copy / meter reading logs';
  } else if (cat.includes('product') || cat.includes('design')) {
    evidence = 'Design documentation (PDF) / product report';
  } else if (cat.includes('csr') || cat.includes('community') || cat.includes('planting') || cat.includes('volunteer')) {
    evidence = 'Participation certificate / group activity picture';
  }

  let icon = '🏆';
  if (cat.includes('carbon') || cat.includes('travel') || cat.includes('commute')) {
    icon = '🚲';
  } else if (cat.includes('waste') || cat.includes('recycle') || cat.includes('plastic')) {
    icon = '♻️';
  } else if (cat.includes('energy') || cat.includes('electricity')) {
    icon = '🔌';
  } else if (cat.includes('product') || cat.includes('design') || cat.includes('idea')) {
    icon = '💡';
  } else if (cat.includes('csr') || cat.includes('planting') || cat.includes('tree') || cat.includes('volunteer')) {
    icon = '🌳';
  }

  return { difficulty, evidenceRequired: evidence, icon };
};

export const mapBackendChallengeToFrontend = (bc) => {
  const { difficulty, evidenceRequired, icon } = inferCategoryAndDifficulty(bc.category_name, bc.xp_reward);
  
  let status = 'Draft';
  if (bc.status === 'active') status = 'Active';
  else if (bc.status === 'completed') status = 'Completed';
  else if (bc.status === 'cancelled') status = 'Archived';
  else if (bc.status === 'under_review') status = 'Under Review';
  else if (bc.status === 'draft') status = 'Draft';

  return {
    id: bc.id,
    title: bc.title,
    category: bc.category_name || (bc.category ? bc.category.toString() : 'Sustainability'),
    categoryId: bc.category,
    description: bc.description || '',
    difficulty,
    xpReward: bc.xp_reward || 0,
    startDate: bc.start_date || '',
    endDate: bc.end_date || '',
    evidenceRequired,
    status,
    participantsCount: bc.participantsCount || 0,
    icon
  };
};

export const mapBackendParticipationToFrontend = (bp) => {
  let status = 'Pending';
  if (bp.status === 'approved') status = 'Approved';
  else if (bp.status === 'rejected') status = 'Rejected';
  else if (bp.status === 'pending') status = 'Pending';

  let proof = 'evidence.pdf';
  if (bp.evidence) {
    proof = bp.evidence.split('/').pop() || 'proof.pdf';
  }

  return {
    id: bp.id,
    employee: bp.employee_name || `Employee #${bp.employee}`,
    employeeId: bp.employee,
    challenge: bp.challenge_title || `Challenge #${bp.challenge}`,
    challengeId: bp.challenge,
    progress: 100, // evidence is uploaded so it is marked fully complete for audit review
    proof,
    evidenceUrl: bp.evidence || null,
    xp: bp.challenge_xp || 0,
    status,
    remarks: 'Submitted proof and details for verification.'
  };
};

export const mapBackendBadgeToFrontend = (bb, index) => {
  // Map standard string icon to emoji
  let icon = '🌱';
  if (bb.icon === 'eco' || bb.icon === 'spa') icon = '🌱';
  else if (bb.icon === 'people' || bb.icon === 'group') icon = '👥';
  else if (bb.icon === 'emoji_events' || bb.icon === 'workspace_premium') icon = '🏆';
  else if (bb.icon === 'workspace_premium' || bb.icon === 'star') icon = '⭐';
  else if (bb.icon.length === 2 || bb.icon.length === 1) icon = bb.icon; // Already an emoji

  return {
    id: bb.id || `BDG-${index}`,
    icon,
    name: bb.name,
    description: bb.description,
    unlockRule: `Earn ${bb.required_xp || bb.criteria_xp || 100} total XP`,
    criteria: `Unlock criteria is automatically handled by XP milestone of ${bb.required_xp || bb.criteria_xp || 100} XP`,
    xpRequired: bb.required_xp || bb.criteria_xp || 100,
    status: bb.unlock_status ? 'Unlocked' : 'Locked',
    earnedBy: []
  };
};

export const mapBackendRewardToFrontend = (br) => {
  let icon = '🎁';
  const name = (br.title || '').toLowerCase();
  if (name.includes('coffee') || name.includes('tumbler') || name.includes('mug')) icon = '☕';
  else if (name.includes('gift') || name.includes('card') || name.includes('voucher')) icon = '💳';
  else if (name.includes('lunch') || name.includes('meal') || name.includes('food') || name.includes('basket')) icon = '🍱';
  else if (name.includes('shirt') || name.includes('cap') || name.includes('merch') || name.includes('bottle')) icon = '👕';
  else if (name.includes('leave') || name.includes('vacation') || name.includes('holiday')) icon = '✈️';

  return {
    id: br.id,
    icon,
    name: br.title,
    description: br.description || '',
    requiredXp: br.xp_cost || 0,
    stock: br.stock || 0,
    status: br.status || 'active'
  };
};

export const mapBackendEmployeeLeaderboardToFrontend = (bel) => ({
  id: `EMP-${bel.id}`,
  rank: bel.rank,
  name: bel.employee_name || `Employee #${bel.employee}`,
  type: 'Employee',
  xp: bel.xp || 0,
  department: bel.department_name || 'Engineering'
});

export const mapBackendDepartmentLeaderboardToFrontend = (bdl) => ({
  id: `DEPT-${bdl.id}`,
  rank: bdl.rank,
  name: bdl.department_name || `Dept #${bdl.department}`,
  type: 'Department',
  xp: Math.round(parseFloat(bdl.total_xp)) || 0,
  department: bdl.department_code || 'EXEC'
});
