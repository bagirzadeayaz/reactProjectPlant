import type { Product } from '../model/schema';

export interface PlantProfile {
  light: 'low' | 'bright' | 'direct';
  size: 'compact' | 'medium' | 'large';
  care: 'easy' | 'regular';
}
export const plantProfile = (product: Product): PlantProfile | undefined =>
  product.care && {
    light: product.care.light,
    size: product.care.size,
    care: product.care.effort,
  };
export const matchProfile = (profile: PlantProfile, answers: PlantProfile): number =>
  Number(profile.light === answers.light) * 2 +
  Number(profile.size === answers.size) +
  Number(profile.care === answers.care);
