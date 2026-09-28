// Upgrade only the original catalog prices; preserve subsequent merchant edits.
const originalPrices: Record<string, readonly [number, number]> = {
  'calathea-plant': [309, 35],
  'desk-plant': [359, 30],
  'calathea-ai-plant': [399, 18],
  'cal-874-plant': [259, 15],
  'show-plant': [759, 70],
  'calat-o2-plant': [659, 45],
};

export const catalogPrice = (slug: string, price: number): number => {
  const original = originalPrices[slug];
  return price === original?.[0] ? original[1] : price;
};
