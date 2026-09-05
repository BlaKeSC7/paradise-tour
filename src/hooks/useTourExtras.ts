import { useQuery } from '@tanstack/react-query';
import { tourExtrasService } from '@/lib/supabase/tour-extras';
import { TourExtra } from '@/types/tour';

export const useTourExtras = (tourId: string) => {
  return useQuery<TourExtra[]>({
    queryKey: ['tour-extras', tourId],
    queryFn: () => tourExtrasService.getByTourId(tourId),
    enabled: !!tourId,
  });
};
