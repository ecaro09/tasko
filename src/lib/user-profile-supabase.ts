import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  rating: number;
  is_verified_tasker: boolean;
  updated_at: string;
}

export const fetchUserProfileSupabase = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
      throw error;
    }

    if (data) {
      return data as UserProfile;
    }
    return null;
  } catch (err: any) {
    console.error("Error fetching Supabase profile:", err);
    toast.error(`Failed to fetch user profile: ${err.message}`);
    throw err;
  }
};

export const createOrUpdateUserProfileSupabase = async (
  userId: string,
  firstName: string | null,
  lastName: string | null,
  phone: string | null,
  avatarUrl: string | null,
  role: string,
  rating: number,
  isVerifiedTasker: boolean
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          avatar_url: avatarUrl,
          role: role,
          rating: rating,
          is_verified_tasker: isVerifiedTasker,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' } // Upsert based on id
      )
      .select()
      .single();

    if (error) throw error;

    if (data) {
      return data as UserProfile;
    }
    return null;
  } catch (err: any) {
    console.error("Error creating or updating Supabase profile:", err);
    toast.error(`Failed to save user profile: ${err.message}`);
    throw err;
  }
};