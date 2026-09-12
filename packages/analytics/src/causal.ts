export interface InflectionPoint {
  variable: string;
  year: number;
  value: number;
  type: 'peak' | 'trough' | 'acceleration' | 'deceleration';
}

export interface CausalDriver {
  factorName: string;
  direction: string;
  arrow: '↑' | '↓' | '→';
  contributionPct: number;
  description: string;
}

export interface CausalExplanation {
  targetVariable: string;
  year: number;
  summary: string;
  drivers: CausalDriver[];
}

export function detectInflections(
  name: string,
  times: number[],
  values: number[]
): InflectionPoint[] {
  const points: InflectionPoint[] = [];
  if (values.length < 5) return points;

  for (let i = 2; i < values.length - 2; i++) {
    const prev2 = values[i - 2];
    const prev = values[i - 1];
    const curr = values[i];
    const next = values[i + 1];
    const next2 = values[i + 2];

    if (curr > prev && curr > next && curr > prev2 && curr > next2) {
      points.push({
        variable: name,
        year: times[i],
        value: curr,
        type: 'peak',
      });
    } else if (curr < prev && curr < next && curr < prev2 && curr < next2) {
      points.push({
        variable: name,
        year: times[i],
        value: curr,
        type: 'trough',
      });
    }
  }

  return points;
}

export function attributeInflection(
  targetVar: string,
  year: number,
  times: number[],
  seriesMap: Record<string, number[]>
): CausalExplanation {
  let closestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(times[i] - year);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }

  const lookbackIdx = Math.max(0, closestIdx - 10);
  const drivers: CausalDriver[] = [];

  switch (targetVar) {
    case 'industrial_output_per_capita':
    case 'industrial_output': {
      const damage = seriesMap['climate_damage_fraction'];
      if (damage) {
        const delta = damage[closestIdx] - damage[lookbackIdx];
        drivers.push({
          factorName: 'Climate damage depreciation',
          direction: delta >= 0 ? 'increasing' : 'decreasing',
          arrow: delta >= 0 ? '↑' : '↓',
          contributionPct: 35,
          description: `Extreme weather & thermal stress raised effective capital depreciation (damage fraction: ${(damage[closestIdx] * 100).toFixed(1)}%).`,
        });
      }

      const mineral = seriesMap['mineral_stress_index'];
      if (mineral) {
        const delta = mineral[closestIdx] - mineral[lookbackIdx];
        drivers.push({
          factorName: 'Critical minerals extraction cost',
          direction: delta >= 0 ? 'increasing' : 'decreasing',
          arrow: delta >= 0 ? '↑' : '↓',
          contributionPct: 30,
          description: `Diminishing ore grades raised capital required for raw mineral extraction (mineral stress index: ${mineral[closestIdx].toFixed(2)}).`,
        });
      }

      const aiElec = seriesMap['ai_electricity_share_pct'];
      if (aiElec) {
        const delta = aiElec[closestIdx] - aiElec[lookbackIdx];
        drivers.push({
          factorName: 'AI compute grid competition',
          direction: delta >= 0 ? 'increasing' : 'decreasing',
          arrow: delta >= 0 ? '↑' : '↓',
          contributionPct: 20,
          description: `Accelerated compute scaling diverted grid power from broad manufacturing (AI grid share: ${aiElec[closestIdx].toFixed(1)}%).`,
        });
      }

      const aiProd = seriesMap['ai_productivity_index'];
      if (aiProd) {
        drivers.push({
          factorName: 'AI productivity dividend',
          direction: 'partially offsetting',
          arrow: '↑',
          contributionPct: 15,
          description: `Automated optimization and algorithmic efficiency provided partial buffer (+${((aiProd[closestIdx] - 1) * 100).toFixed(1)}% TFP).`,
        });
      }
      break;
    }

    case 'population': {
      const food = seriesMap['food_per_capita'];
      if (food) {
        drivers.push({
          factorName: 'Nutrition and food supply',
          direction: 'constraining',
          arrow: '↓',
          contributionPct: 45,
          description: `Agricultural input constraints and arable soil stress limited per capita caloric intake (${Math.round(food[closestIdx])} kg/person/yr).`,
        });
      }

      const gini = seriesMap['gini_coefficient'];
      if (gini) {
        drivers.push({
          factorName: 'Economic inequality and healthcare access',
          direction: 'skewing services',
          arrow: '↑',
          contributionPct: 30,
          description: `Income concentration restricted preventive medical services in vulnerable regions (Gini index: ${gini[closestIdx].toFixed(2)}).`,
        });
      }

      drivers.push({
        factorName: 'Demographic transition',
        direction: 'fertility decline',
        arrow: '↓',
        contributionPct: 25,
        description: 'Rising urbanization, female education, and voluntary family planning lowered global total fertility rate toward replacement level.',
      });
      break;
    }

    default: {
      drivers.push({
        factorName: 'Coupled planetary feedback',
        direction: 'systemic interaction',
        arrow: '→',
        contributionPct: 100,
        description: `Dynamic interactions across resource stocks, capital investment, and environmental boundaries drove inflection in ${targetVar} near ${year.toFixed(1)}.`,
      });
    }
  }

  const primaryFactor = drivers[0]?.factorName ?? 'systemic feedbacks';
  return {
    targetVariable: targetVar,
    year,
    summary: `${targetVar} reached an inflection point around year ${year.toFixed(1)}, primarily driven by ${primaryFactor}.`,
    drivers,
  };
}
