import { UserProfile } from './user-profile-supabase';

const USER_PROFILE_CACHE_KEY = 'supabase_user_profile_cache';

export const saveUserProfileToCache = (profile: UserProfile | null) => {
  try {
    if (profile) {
      localStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(USER_PROFILE_CACHE_KEY);
    }
  } catch (error) {
    console.error("Error saving user profile to local storage:", error);
  }
};

export const loadUserProfileFromCache = (): UserProfile | null => {
  try {
    const cachedProfile = localStorage.getItem(USER_PROFILE_CACHE_KEY);
    return cachedProfile ? JSON.parse(cachedProfile) : null;
  } catch (error) {
    console.error("Error loading user profile from local storage:", error);
    return null;
  }
};