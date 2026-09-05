import { supabase } from '../supabase';
import { Tour } from '@/types/tour';
import { adaptTourFromSupabase } from './adapters';

export const toursService = {
  // Obtener todos los tours
  async getAll(): Promise<Tour[]> {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tours:', error);
      throw error;
    }

    return (data || []).map(adaptTourFromSupabase);
  },

  // Obtener un tour por ID
  async getById(id: string): Promise<Tour | null> {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tour:', error);
      return null;
    }

    return data ? adaptTourFromSupabase(data) : null;
  },

  // Obtener tours por categoría
  async getByCategory(category: string): Promise<Tour[]> {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tours by category:', error);
      throw error;
    }

    return (data || []).map(adaptTourFromSupabase);
  },

  // Obtener tours destacados
  async getFeatured(): Promise<Tour[]> {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured tours:', error);
      throw error;
    }

    return (data || []).map(adaptTourFromSupabase);
  },

  // Crear un nuevo tour
  async create(tourData: Omit<Tour, 'id' | 'created_at' | 'updated_at'>): Promise<Tour> {
    const { data, error } = await supabase
      .from('tours')
      .insert({
        title: tourData.title,
        description: tourData.description,
        category: tourData.category,
        image: tourData.image,
        duration: tourData.duration,
        price_adult: tourData.priceAdult,
        price_child: tourData.priceChild,
        price_infant: tourData.priceInfant,
        featured: tourData.featured,
        includes: tourData.includes,
        rating: tourData.rating,
        reviews: tourData.reviews,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tour:', error);
      throw error;
    }

    return adaptTourFromSupabase(data);
  },

  // Actualizar un tour
  async update(id: string, updates: Partial<Tour>): Promise<Tour> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.priceAdult !== undefined) updateData.price_adult = updates.priceAdult;
    if (updates.priceChild !== undefined) updateData.price_child = updates.priceChild;
    if (updates.priceInfant !== undefined) updateData.price_infant = updates.priceInfant;
    if (updates.featured !== undefined) updateData.featured = updates.featured;
    if (updates.includes !== undefined) updateData.includes = updates.includes;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.reviews !== undefined) updateData.reviews = updates.reviews;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tours')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tour:', error);
      throw error;
    }

    return adaptTourFromSupabase(data);
  },

  // Eliminar un tour
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tour:', error);
      throw error;
    }
  },
};

