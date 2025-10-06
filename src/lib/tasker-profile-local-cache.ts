import { TaskerProfile } from './tasker-profile-firestore';

const TASKER_PROFILES_CACHE_KEY = 'tasker_profiles_cache';

export const saveTaskerProfilesToCache = (profiles: TaskerProfile[]) => {
  try {
    localStorage.setItem(TASKER_PROFILES_CACHE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error("Error saving tasker profiles to local storage:", error);
  }
};

export const loadTaskerProfilesFromCache = (): TaskerProfile[] => {
  try {
    const cachedProfiles = localStorage.getItem(TASKER_PROFILES_CACHE_KEY);
    return cachedProfiles ? JSON.parse(cachedProfiles) : [];
  } catch (error) {
    console.error("Error loading tasker profiles from local storage:", error);
    return [];
  }
};

export const clearTaskerProfilesCache = () => {
  try {
    localStorage.removeItem(TASKER_PROFILES_CACHE_KEY);
  } catch (error) {
    console.error("Error clearing tasker profiles cache from local storage:", error);
  }
};