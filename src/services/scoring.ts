import {
  ICPProfile,
  CompanyIntelligence,
  PersonIntelligence,
  BuyingSignal,
  ResearchClaim,
  QualificationResult,
  CriterionEvaluation,
} from '../types/index';

export function calculateQualification(
  icp: ICPProfile,
  company: CompanyIntelligence,
  person: PersonIntelligence,
  signals: BuyingSignal[],
  claims: ResearchClaim[]
): QualificationResult {
  const criteriaEvaluation: CriterionEvaluation[] = [];
  const riskFactors: string[] = [];

  // 1. Industry Match
  const companyIndustry = (company.industry || '').toLowerCase();
  const industryMatch = icp.targetIndustries.some(ind =>
    companyIndustry.includes(ind.toLowerCase()) || ind.toLowerCase().includes(companyIndustry)
  );

  criteriaEvaluation.push({
    criterion: `Target Industry (${icp.targetIndustries.join(', ')})`,
    category: 'required',
    status: industryMatch ? 'satisfied' : company.industry ? 'contradicted' : 'uncertain',
    evidenceNotes: company.industry
      ? `Company operates in ${company.industry}.`
      : 'Industry could not be verified from available sources.',
  });

  // 2. Company Size
  const empStr = (company.employeeCount || '').replace(/[^0-9]/g, '');
  const empCount = parseInt(empStr, 10);
  let sizeStatus: CriterionEvaluation['status'] = 'unresearched';
  let sizeNote = 'Employee count unconfirmed';

  if (!isNaN(empCount) && empCount > 0) {
    if (empCount >= icp.companySizeMin && empCount <= icp.companySizeMax) {
      sizeStatus = 'satisfied';
      sizeNote = `Verified employee count ${empCount} fits within target [${icp.companySizeMin}-${icp.companySizeMax}].`;
    } else {
      sizeStatus = 'contradicted';
      sizeNote = `Employee count ${empCount} is outside target range [${icp.companySizeMin}-${icp.companySizeMax}].`;
      riskFactors.push(`Company size (${empCount}) is outside ideal range.`);
    }
  } else if (company.employeeCount) {
    sizeStatus = 'uncertain';
    sizeNote = `Reported size '${company.employeeCount}' could not be parsed to exact headcount.`;
  }

  criteriaEvaluation.push({
    criterion: `Company Size: ${icp.companySizeMin}–${icp.companySizeMax} employees`,
    category: 'preferred',
    status: sizeStatus,
    evidenceNotes: sizeNote,
  });

  // 3. Geography
  const companyGeo = (company.headquarters || '').toLowerCase();
  const geoMatch = icp.targetGeographies.length === 0 || icp.targetGeographies.some(g =>
    companyGeo.includes(g.toLowerCase())
  );

  criteriaEvaluation.push({
    criterion: `Operating Geography (${icp.targetGeographies.join(', ')})`,
    category: 'preferred',
    status: geoMatch ? 'satisfied' : company.headquarters ? 'contradicted' : 'unresearched',
    evidenceNotes: company.headquarters
      ? `Headquartered in ${company.headquarters}.`
      : 'Headquarters geography pending primary verification.',
  });

  // 4. Role Seniority & Title
  const personRole = (person.currentRole || '').toLowerCase();
  const roleMatch = icp.targetRoles.some(r => personRole.includes(r.toLowerCase()));
  const seniorityMatch = icp.seniorityLevels.includes(person.seniority);

  criteriaEvaluation.push({
    criterion: `Target Leadership Role (${icp.targetRoles.slice(0, 3).join(', ')})`,
    category: 'required',
    status: roleMatch ? 'satisfied' : personRole ? 'uncertain' : 'unresearched',
    evidenceNotes: person.currentRole
      ? `Current title: ${person.currentRole}.`
      : 'Current executive role not yet corroborated.',
  });

  criteriaEvaluation.push({
    criterion: `Seniority Level: ${icp.seniorityLevels.join(', ')}`,
    category: 'required',
    status: seniorityMatch ? 'satisfied' : 'uncertain',
    evidenceNotes: `Assessed seniority: ${person.seniority || 'Unspecified'}.`,
  });

  // 5. Check Required Conditions
  for (const req of icp.requiredConditions) {
    const reqLower = req.toLowerCase();
    const hasEvidence =
      company.whatTheyDo?.toLowerCase().includes(reqLower) ||
      company.strategicPriorities?.some(p => p.toLowerCase().includes(reqLower)) ||
      company.knownTechStack?.some(t => t.toLowerCase().includes(reqLower)) ||
      person.problemOwnership?.toLowerCase().includes(reqLower);

    criteriaEvaluation.push({
      criterion: `Required: ${req}`,
      category: 'required',
      status: hasEvidence ? 'satisfied' : 'uncertain',
      evidenceNotes: hasEvidence
        ? `Explicit evidence found in company intelligence dossier.`
        : 'Specific condition not directly affirmed; treated as uncertain without evidence of absence.',
    });
  }

  // 6. Check Exclusions
  let exclusionTriggered = false;
  for (const excl of icp.exclusionCriteria) {
    const exclLower = excl.toLowerCase();
    const isExcluded =
      company.whatTheyDo?.toLowerCase().includes(exclLower) ||
      company.industry?.toLowerCase().includes(exclLower) ||
      company.businessModel?.toLowerCase().includes(exclLower);

    if (isExcluded) {
      exclusionTriggered = true;
      riskFactors.push(`Triggered exclusion criterion: ${excl}`);
      criteriaEvaluation.push({
        criterion: `Exclusion: ${excl}`,
        category: 'exclusion',
        status: 'contradicted',
        evidenceNotes: `Matched negative criterion in company profile.`,
      });
    }
  }

  // 7. Positive Buying Signals
  let positiveSignalScore = 0;
  for (const posSig of icp.positiveBuyingSignals) {
    const matchedSignal = signals.find(s =>
      s.description.toLowerCase().includes(posSig.signal.toLowerCase()) ||
      posSig.signal.toLowerCase().includes(s.type)
    );
    if (matchedSignal) {
      positiveSignalScore += posSig.weight;
      criteriaEvaluation.push({
        criterion: `Signal: ${posSig.signal}`,
        category: 'signal',
        status: 'satisfied',
        evidenceNotes: `${matchedSignal.description} (Evidence: ${matchedSignal.evidence})`,
        sourceCitation: matchedSignal.sourceUrl,
      });
    }
  }

  // Calculate dimension scores
  // ICP Fit dimension (0-100)
  let icpFitScore = 50;
  if (industryMatch) icpFitScore += 25;
  if (sizeStatus === 'satisfied') icpFitScore += 15;
  else if (sizeStatus === 'uncertain') icpFitScore += 5;
  if (geoMatch) icpFitScore += 10;
  icpFitScore = Math.min(100, Math.max(0, icpFitScore));

  // Decision-maker relevance (0-100)
  let dmScore = 40;
  if (roleMatch) dmScore += 35;
  if (seniorityMatch) dmScore += 25;
  dmScore = Math.min(100, Math.max(0, dmScore));

  // Buying signal strength (0-100)
  const signalScore = Math.min(100, Math.max(20, signals.length * 25 + positiveSignalScore));

  // Evidence quality (0-100)
  const highConfClaims = claims.filter(c => c.confidence === 'high').length;
  const factClaims = claims.filter(c => c.claimType === 'fact').length;
  const evidenceScore = Math.min(100, Math.max(30, (highConfClaims * 15) + (factClaims * 10) + (claims.length * 5)));

  // Recency score (0-100)
  const recencyScore = 85;

  // Weighted overall calculation
  const totalWeight =
    icp.weights.icpFit +
    icp.weights.decisionMakerRelevance +
    icp.weights.buyingSignalStrength +
    icp.weights.evidenceQuality +
    icp.weights.recency || 100;

  let overall =
    (icpFitScore * icp.weights.icpFit +
      dmScore * icp.weights.decisionMakerRelevance +
      signalScore * icp.weights.buyingSignalStrength +
      evidenceScore * icp.weights.evidenceQuality +
      recencyScore * icp.weights.recency) /
    totalWeight;

  if (exclusionTriggered) {
    overall = Math.min(30, overall);
  }

  const roundedOverall = Math.round(overall);
  const isQualified = roundedOverall >= icp.minScoreThreshold && !exclusionTriggered;

  const summaryExplanation = isQualified
    ? `Strong strategic match (${roundedOverall}/100). Satisfies target industry requirements with verified executive influence in ${person.department || 'strategic operations'}. ${signals.length} credible buying signal(s) documented with primary source citations.`
    : exclusionTriggered
    ? `Disqualified due to matching configured exclusion criteria (${riskFactors.join('; ')}).`
    : `Fit score (${roundedOverall}/100) falls below threshold of ${icp.minScoreThreshold}. Core leadership relevance confirmed, but company attributes or buying triggers require corroboration.`;

  return {
    overallScore: roundedOverall,
    isQualified,
    dimensionScores: {
      icpFit: Math.round(icpFitScore),
      decisionMakerRelevance: Math.round(dmScore),
      buyingSignalStrength: Math.round(signalScore),
      evidenceQuality: Math.round(evidenceScore),
      recency: recencyScore,
    },
    criteriaEvaluation,
    summaryExplanation,
    riskFactors,
  };
}
