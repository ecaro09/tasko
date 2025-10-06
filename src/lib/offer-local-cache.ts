import { Offer } from './offer-firestore';

const OFFERS_CACHE_KEY = 'offers_cache';

export const saveOffersToCache = (offers: Offer[]) => {
  try {
    localStorage.setItem(OFFERS_CACHE_KEY, JSON.stringify(offers));
  } catch (error) {
    console.error("Error saving offers to local storage:", error);
  }
};

export const loadOffersFromCache = (): Offer[] => {
  try {
    const cachedOffers = localStorage.getItem(OFFERS_CACHE_KEY);
    return cachedOffers ? JSON.parse(cachedOffers) : [];
  } catch (error) {
    console.error("Error loading offers from local storage:", error);
    return [];
  }
};

export const clearOffersCache = () => {
  try {
    localStorage.removeItem(OFFERS_CACHE_KEY);
  } catch (error) {
    console.error("Error clearing offers cache from local storage:", error);
  }
};