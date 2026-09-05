export interface Tour {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  duration: string;
  priceAdult: number;
  priceChild: number;
  priceInfant: number;
  featured: boolean;
  includes: string[];
  rating: number;
  reviews: number;
}

export interface TourExtra {
  id: string;
  tourId: string;
  name: string;
  description: string | null;
  price: number;
}

export interface SelectedExtra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  tour: Tour;
  adults: number;
  children: number;
  infants: number;
  date: string;
  extras?: SelectedExtra[];
}
