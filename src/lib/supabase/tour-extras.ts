import { supabase } from '../supabase';
import { TourExtra } from '@/types/tour';

const adaptTourExtraFromSupabase = (row: any): TourExtra => ({
  id: row.id,
  tourId: row.tour_id,
  name: row.name,
  description: row.description ?? null,
  price: Number(row.price) || 0,
});

export const tourExtrasService = {
  async getByTourId(tourId: string): Promise<TourExtra[]> {
    const { data, error } = await supabase
      .from('tour_extras')
      .select('*')
      .eq('tour_id', tourId)
      .order('created_at', { ascending: true });

    if (error) {
      // La tabla puede no existir todavía si no se corrió la migración.
      console.error('Error fetching tour extras:', error);
      return [];
    }

    return (data || []).map(adaptTourExtraFromSupabase);
  },
};
