// Illustrative profiles for the sample catalog, not verified botanical specifications.
export interface PlantProfile {
  light: 'low' | 'bright' | 'direct';
  size: 'compact' | 'medium' | 'large';
  care: 'easy' | 'regular';
}
const profiles: Record<string, PlantProfile> = {
  'snake-plant': { light: 'low', size: 'medium', care: 'easy' },
  'zz-plant': { light: 'low', size: 'medium', care: 'easy' },
  'peace-lily': { light: 'bright', size: 'medium', care: 'regular' },
  'monstera-deliciosa': { light: 'bright', size: 'large', care: 'regular' },
  'rubber-plant': { light: 'bright', size: 'large', care: 'regular' },
  'golden-pothos': { light: 'bright', size: 'compact', care: 'easy' },
  'calathea-plant': { light: 'bright', size: 'medium', care: 'regular' },
  'desk-plant': { light: 'low', size: 'compact', care: 'easy' },
  'calathea-ai-plant': { light: 'direct', size: 'compact', care: 'easy' },
  'cal-874-plant': { light: 'direct', size: 'compact', care: 'easy' },
  'show-plant': { light: 'bright', size: 'large', care: 'regular' },
  'calat-o2-plant': { light: 'low', size: 'medium', care: 'easy' },
};
export const plantProfile = (slug: string): PlantProfile | undefined => profiles[slug];
export const matchProfile = (profile: PlantProfile, answers: PlantProfile): number =>
  Number(profile.light === answers.light) * 2 +
  Number(profile.size === answers.size) +
  Number(profile.care === answers.care);
