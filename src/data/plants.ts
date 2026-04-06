import type { Plant } from '../types';
import plant1 from '../assets/plant1.png';
import plant2 from '../assets/plant2.png';
import plant3 from '../assets/plant3.png';
import plant4 from '../assets/plant4.png';
import plant5 from '../assets/plant5.png';
import plant6 from '../assets/plant6.png';
import hero from '../assets/hero.png';

export const trendyPlants: Plant[] = [
  {
    id: 1,
    name: 'Monstera Deliciosa',
    description: 'Swiss cheese plant with unique splits',
    price: 1299,
    image: plant1,
    category: 'trendy',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Fiddle Leaf Fig',
    description: 'Elegant statement indoor tree',
    price: 2499,
    image: plant2,
    category: 'trendy',
    rating: 4.6,
  },
  {
    id: 3,
    name: 'Snake Plant',
    description: 'Low maintenance air purifier',
    price: 899,
    image: plant3,
    category: 'trendy',
    rating: 4.9,
  },
];

export const topSellingPlants: Plant[] = [
  {
    id: 4,
    name: 'Peace Lily',
    description: 'Beautiful white blooms indoors',
    price: 1099,
    image: plant4,
    category: 'top-selling',
    rating: 4.7,
  },
  {
    id: 5,
    name: 'Pothos Golden',
    description: 'Trailing vine perfect for shelves',
    price: 599,
    image: plant5,
    category: 'top-selling',
    rating: 4.5,
  },
  {
    id: 6,
    name: 'Rubber Plant',
    description: 'Glossy dark leaves, easy care',
    price: 1499,
    image: plant6,
    category: 'top-selling',
    rating: 4.8,
  },
  {
    id: 7,
    name: 'Bird of Paradise',
    description: 'Tropical statement plant',
    price: 2999,
    image: plant1,
    category: 'top-selling',
    rating: 4.9,
  },
  {
    id: 8,
    name: 'ZZ Plant',
    description: 'Nearly indestructible houseplant',
    price: 799,
    image: plant2,
    category: 'top-selling',
    rating: 4.6,
  },
  {
    id: 9,
    name: 'Calathea Orbifolia',
    description: 'Stunning round silver-green leaves',
    price: 1799,
    image: plant3,
    category: 'top-selling',
    rating: 4.7,
  },
];

export const featuredPlant: Plant = {
  id: 10,
  name: 'Olive Tree',
  description: 'Mediterranean elegance indoors',
  price: 3499,
  image: hero,
  category: 'featured',
  rating: 4.9,
};
