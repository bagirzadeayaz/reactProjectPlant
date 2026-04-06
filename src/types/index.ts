export interface Plant {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
}

export interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
}
