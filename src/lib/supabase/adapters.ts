import { Tour } from '@/types/tour';
import { Combo } from './combos';

// Adaptador para convertir datos de Supabase al formato esperado por los componentes
export const adaptTourFromSupabase = (tour: any): Tour => {
  return {
    id: tour.id,
    title: tour.title,
    description: tour.description,
    category: tour.category,
    image: tour.image,
    duration: tour.duration,
    priceAdult: Number(tour.price_adult ?? tour.priceAdult) || 0,
    priceChild: Number(tour.price_child ?? tour.priceChild) || 0,
    priceInfant: Number(tour.price_infant ?? tour.priceInfant) || 0,
    featured: tour.featured,
    includes: Array.isArray(tour.includes) ? tour.includes : (tour.includes ? JSON.parse(tour.includes) : []),
    rating: Number(tour.rating ?? 0) || 0,
    reviews: Number(tour.reviews ?? 0) || 0,
  };
};

// Adaptador para convertir combos de Supabase
export const adaptComboFromSupabase = (combo: any): Combo => {
  return {
    id: combo.id,
    title: combo.title,
    description: combo.description,
    tour_ids: combo.tour_ids || combo.tourIds || [],
    original_price: Number(combo.original_price ?? combo.originalPrice) || 0,
    discounted_price: Number(combo.discounted_price ?? combo.discountedPrice) || 0,
    discount: Number(combo.discount ?? 0) || 0,
    image: combo.image,
    created_at: combo.created_at,
  };
};

