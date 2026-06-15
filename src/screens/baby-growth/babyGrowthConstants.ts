/**
 * `month` is the value sent in the URL (`/baby-routine/.../:month`).
 * Many backends use 1–24 (first month of life = 1), so 0-1 maps to 1, not 0.
 */
export const GROWTH_MONTH_BANDS: { labelKey: string; month: number }[] = [
  { labelKey: 'growthBands.m0_1', month: 1 },
  { labelKey: 'growthBands.m2_3', month: 2 },
  { labelKey: 'growthBands.m4_5', month: 4 },
  { labelKey: 'growthBands.m6_7', month: 6 },
  { labelKey: 'growthBands.m8_9', month: 8 },
  { labelKey: 'growthBands.m10_11', month: 10 },
  { labelKey: 'growthBands.m12_13', month: 12 },
  { labelKey: 'growthBands.m14_15', month: 14 },
  { labelKey: 'growthBands.m16_18', month: 16 },
  { labelKey: 'growthBands.m19_24', month: 19 },
];

export type GrowthCategoryId = 'physical' | 'motor' | 'sensory' | 'speech' | 'feeding';

export const GROWTH_CATEGORIES: {
  id: GrowthCategoryId;
  titleKey: string;
  descKey: string;
  emoji: string;
  apiReady: boolean;
}[] = [
  {
    id: 'physical',
    titleKey: 'growth.physicalTitle',
    descKey: 'growth.physicalDesc',
    emoji: '📏',
    apiReady: true,
  },
  {
    id: 'motor',
    titleKey: 'growth.motorTitle',
    descKey: 'growth.motorDesc',
    emoji: '🧸',
    apiReady: true,
  },
  {
    id: 'feeding',
    titleKey: 'growth.feedingTitle',
    descKey: 'growth.feedingDesc',
    emoji: '🍼',
    apiReady: true,
  },
  {
    id: 'sensory',
    titleKey: 'growth.sensoryTitle',
    descKey: 'growth.sensoryDesc',
    emoji: '👁️',
    apiReady: false,
  },
  {
    id: 'speech',
    titleKey: 'growth.speechTitle',
    descKey: 'growth.speechDesc',
    emoji: '💬',
    apiReady: false,
  },
];
