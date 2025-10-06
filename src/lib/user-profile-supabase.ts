import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { saveUserProfileToCache, loadUserProfileFromCache } from './local-cache'; // Import caching utilities

// Define the structure for the Supabase profile
export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string; // 'user' or 'tasker'
  updated_at: string;
}

export const fetchUserProfileSupabase = async (userId: string): Promise<UserProfile | null> => {
  // Try to load from cache first
  const cachedProfile = loadUserProfileFromCache();
  if (cachedProfile && cachedProfile.id === userId) {
    console.log("Loaded user profile from cache.");
    return cachedProfile;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
      throw error;
    }

    // Save to cache if fetched successfully
    saveUserProfileToCache(data as UserProfile | null);
    return data as UserProfile | null;
  } catch (error: any) {
    console.error("Error fetching Supabase profile:", error);
    toast.error(`Failed to load user profile: ${error.message}`);
    return null;
  }
};

export const createOrUpdateUserProfileSupabase = async (
  userId: string,
  firstName: string | null,
  lastName: string | null,
  phone: string | null,
  avatarUrl: string | null,
  role: string = 'user' // Default role
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        phone: phone,
        role: role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Save to cache after successful upsert
    saveUserProfileToCache(data as UserProfile);
    return data as UserProfile;
  } catch (error: any) {
    console.error("Error creating/updating Supabase profile:", error);
    toast.error(`Failed to save user profile: ${error.message}`);
    return null;
  }
};