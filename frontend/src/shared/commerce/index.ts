export const PLANT_SIZES = ['small', 'medium', 'large'] as const;
export const POT_STYLES = ['original', 'cream', 'sage', 'terracotta'] as const;
export const DELIVERY_AREAS = ['baku', 'absheron', 'regions'] as const;
export type PlantSize = (typeof PLANT_SIZES)[number];
export type PotStyle = (typeof POT_STYLES)[number];
export type DeliveryArea = (typeof DELIVERY_AREAS)[number];
export interface ProductVariant {
  id: string;
  size: PlantSize;
  heightCm: number;
  pot: PotStyle;
  price: number;
  stock: number;
  imageUrl: string;
}
export interface ProductDelivery {
  areas: DeliveryArea[];
  dispatchDays: number;
}
export const DEFAULT_DELIVERY: ProductDelivery = {
  areas: ['baku', 'absheron', 'regions'],
  dispatchDays: 0,
};
export const FREE_DELIVERY_FROM = 80;
const services = {
  baku: { fee: 4, minDays: 1, maxDays: 2 },
  absheron: { fee: 7, minDays: 2, maxDays: 3 },
  regions: { fee: 10, minDays: 3, maxDays: 5 },
};
export const deliveryQuote = (area: DeliveryArea, subtotal: number, dispatchDays = 0) => ({
  fee: subtotal >= FREE_DELIVERY_FROM ? 0 : services[area].fee,
  minDays: services[area].minDays + dispatchDays,
  maxDays: services[area].maxDays + dispatchDays,
});
export const deliveryDate = (businessDays: number, today = new Date()): Date => {
  const date = new Date(today);
  date.setHours(12, 0, 0, 0);
  for (let left = businessDays; left > 0;) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) left--;
  }
  return date;
};
