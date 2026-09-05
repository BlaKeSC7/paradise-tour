import { supabase } from '../supabase';

export interface Referral {
  id: string;
  dashboard_user_id: string;
  booking_id: string;
  referral_code: string;
  commission_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at?: string;
  paid_at?: string | null;
}

export const referralsService = {
  // Obtener todos los referidos
  async getAll(): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener referidos de un usuario del dashboard
  async getByDashboardUserId(userId: string): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('dashboard_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals by user:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener referidos por código de referido
  async getByReferralCode(referralCode: string): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', referralCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals by code:', error);
      throw error;
    }

    return data || [];
  },

  // Actualizar estado de un referido
  async updateStatus(id: string, status: Referral['status']): Promise<Referral> {
    const updateData: Partial<Referral> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('referrals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating referral status:', error);
      throw error;
    }

    return data;
  },
};

