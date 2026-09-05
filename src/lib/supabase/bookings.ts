import { supabase } from '../supabase';
import { SelectedExtra } from '@/types/tour';

export interface Booking {
  id: string;
  booking_number: string;
  tour_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  adults: number;
  children: number;
  infants: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  referral_code: string | null;
  extras?: SelectedExtra[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingData {
  tour_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  adults: number;
  children: number;
  infants: number;
  total_price: number;
  notes?: string;
  referral_code?: string;
  extras?: SelectedExtra[];
}

export const bookingsService = {
  // Crear una nueva reserva
  async create(bookingData: CreateBookingData): Promise<Booking> {
    let { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    // Si todavía no se corrió la migración que agrega la columna "extras",
    // reintentamos sin ella para no romper la reserva completa por eso.
    if (error?.code === '42703' && bookingData.extras) {
      const { extras, ...withoutExtras } = bookingData;
      ({ data, error } = await supabase
        .from('bookings')
        .insert(withoutExtras)
        .select()
        .single());
    }

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return data;
  },

  // Obtener todas las reservas
  async getAll(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener una reserva por ID
  async getById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return null;
    }

    return data;
  },

  // Obtener reservas por número de reserva
  async getByBookingNumber(bookingNumber: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_number', bookingNumber)
      .single();

    if (error) {
      console.error('Error fetching booking by number:', error);
      return null;
    }

    return data;
  },

  // Obtener reservas por email del cliente
  async getByCustomerEmail(email: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings by email:', error);
      throw error;
    }

    return data || [];
  },

  // Actualizar estado de una reserva
  async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }

    return data;
  },
};

