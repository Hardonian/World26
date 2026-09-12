import { MilestoneEvent } from '@world26/schemas';

export function detectMilestones(
  times: number[],
  series: Record<string, number[]>
): MilestoneEvent[] {
  const milestones: MilestoneEvent[] = [];

  const co2 = series['atmospheric_co2_ppm'];
  if (co2) {
    // Check when CO2 crosses 350 ppm (boundary safe threshold)
    for (let i = 1; i < times.length; i++) {
      if (co2[i - 1] <= 350 && co2[i] > 350) {
        milestones.push({
          year: Math.round(times[i]),
          variable: 'atmospheric_co2_ppm',
          type: 'boundary_cross_danger',
          title: 'Planetary Boundary Transgressed: Climate Change (CO2)',
          description: `Atmospheric CO2 exceeded the safe threshold of 350 ppm (${co2[i].toFixed(1)} ppm).`,
          sector: 'climate',
          severity: 'critical',
        });
        break;
      }
    }
    // Check when CO2 crosses 400 ppm
    for (let i = 1; i < times.length; i++) {
      if (co2[i - 1] <= 400 && co2[i] > 400) {
        milestones.push({
          year: Math.round(times[i]),
          variable: 'atmospheric_co2_ppm',
          type: 'boundary_cross_danger',
          title: 'Climate Threshold: Atmospheric CO2 Exceeds 400 ppm',
          description: `Atmospheric greenhouse concentration surpassed 400 ppm (${co2[i].toFixed(1)} ppm).`,
          sector: 'climate',
          severity: 'warning',
        });
        break;
      }
    }
  }

  // Ocean Acidification
  const arag = series['aragonite_saturation_state'];
  if (arag) {
    for (let i = 1; i < times.length; i++) {
      if (arag[i - 1] >= 2.80 && arag[i] < 2.80) {
        milestones.push({
          year: Math.round(times[i]),
          variable: 'aragonite_saturation_state',
          type: 'boundary_cross_danger',
          title: 'Planetary Boundary Transgressed: Ocean Acidification',
          description: `Global mean surface aragonite saturation fell below safe limit 2.80 (${arag[i].toFixed(2)} Ωarag).`,
          sector: 'ocean',
          severity: 'critical',
        });
        break;
      }
    }
  }

  // AI Electricity Share
  const aiElec = series['ai_electricity_share_pct'];
  if (aiElec) {
    for (let i = 1; i < times.length; i++) {
      if (aiElec[i - 1] < 10.0 && aiElec[i] >= 10.0) {
        milestones.push({
          year: Math.round(times[i]),
          variable: 'ai_electricity_share_pct',
          type: 'rebound_trigger',
          title: 'Computing Inflection: AI Consumes >10% Global Electricity',
          description: `Datacenter computing exceeded 10% of total world electric power generation (${aiElec[i].toFixed(1)}%).`,
          sector: 'ai_computing',
          severity: 'warning',
        });
        break;
      }
    }
  }

  // Population Peak
  const pop = series['population'];
  if (pop && pop.length > 10) {
    let maxVal = -Infinity;
    let maxIdx = 0;
    for (let i = 0; i < pop.length; i++) {
      if (pop[i] > maxVal) {
        maxVal = pop[i];
        maxIdx = i;
      }
    }
    if (maxIdx > 0 && maxIdx < pop.length - 1) {
      milestones.push({
        year: Math.round(times[maxIdx]),
        variable: 'population',
        type: 'peak',
        title: 'Demographic Transition: Global Population Peak',
        description: `Human civilization reached its maximum demographic peak of ${(maxVal / 1e9).toFixed(2)} billion.`,
        sector: 'demography',
        severity: 'info',
      });
    }
  }

  // Sort milestones by year
  milestones.sort((a, b) => a.year - b.year);
  return milestones;
}
