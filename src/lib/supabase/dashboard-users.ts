import { supabase } from '../supabase';

export interface DashboardUser {
  id: string;
  email: string;
  name: string;
  referral_code: string;
  referral_link: string;
  discount_percentage: number;
  user_id: string | null;
  role: 'admin' | 'affiliate' | 'manager';
  total_referrals: number;
  total_earnings: number;
  commission_rate: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDashboardUserData {
  email: string;
  name: string;
  referral_code?: string;
  referral_link?: string;
  discount_percentage?: number;
  role?: 'admin' | 'affiliate' | 'manager';
  commission_rate?: number;
  user_id?: string;
}

export const dashboardUsersService = {
  // Crear un nuevo usuario del dashboard
  async create(userData: CreateDashboardUserData): Promise<DashboardUser> {
    const { data, error } = await supabase
      .from('dashboard_users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating dashboard user:', error);
      throw error;
    }

    return data;
  },

  // Obtener todos los usuarios activos
  async getAllActive(): Promise<DashboardUser[]> {
    const { data, error } = await supabase
      .from('dashboard_users')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dashboard users:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener un usuario por ID
  async getById(id: string): Promise<DashboardUser | null> {
    const { data, error } = await supabase
      .from('dashboard_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dashboard user:', error);
      return null;
    }

    return data;
  },

  // Obtener un usuario por código de referido
  async getByReferralCode(referralCode: string): Promise<DashboardUser | null> {
    const { data, error } = await supabase
      .from('dashboard_users')
      .select('*')
      .eq('referral_code', referralCode)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching dashboard user by referral code:', error);
      return null;
    }

    return data;
  },

  // Obtener un usuario por email
  async getByEmail(email: string): Promise<DashboardUser | null> {
    const { data, error } = await supabase
      .from('dashboard_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching dashboard user by email:', error);
      return null;
    }

    return data;
  },

  // Actualizar estadísticas de un usuario
  async updateStats(id: string, stats: Partial<Pick<DashboardUser, 'total_referrals' | 'total_earnings'>>): Promise<DashboardUser> {
    const { data, error } = await supabase
      .from('dashboard_users')
      .update({ ...stats, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dashboard user stats:', error);
      throw error;
    }

    return data;
  },
};

