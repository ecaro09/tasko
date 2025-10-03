import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, DocumentData, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile'; // To check if user is a tasker
import { useChat } from './use-chat'; // New import for useChat
import {
  Offer,
  addOfferFirestore,
  acceptOfferFirestore,
  rejectOfferFirestore,
  withdrawOfferFirestore,
  fetchOffersFirestore,
} from '@/lib/offer-firestore'; // Import new utility functions

interface OffersContextType {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  addOffer: (
    taskId: string,
    clientId: string,
    offerAmount: number,
    message: string,
  ) => Promise<void>;
  getOffersForTask: (taskId: string) => Offer[];
  acceptOffer: (offerId: string, taskId: string) => Promise<string | null>; // Modified return type
  rejectOffer: (offerId: string) => Promise<void>;
  withdrawOffer: (offerId: string) => Promise<void>;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export const OffersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { taskerProfile, isTasker, loading: taskerLoading, fetchTaskerProfileById } = useTaskerProfile(); // Added fetchTaskerProfileById
  const { createChatRoom } = useChat(); // Use createChatRoom from useChat
  const [allOffers, setAllOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = fetchOffersFirestore(
      (fetchedOffers) => {
        setAllOffers(fetchedOffers);
        setLoading(false);
      },
      (errorMessage) => {
        setError(errorMessage);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addOffer = async (
    taskId: string,
    clientId: string,
    offerAmount: number,
    message: string,
  ) => {
    if (!isAuthenticated || !user || !isTasker || !taskerProfile) {
      toast.error("You must be logged in as a tasker to make an offer.");
      return;
    }

    setLoading(true);
    try {
      await addOfferFirestore(taskId, clientId, offerAmount, message, user, taskerProfile);
    } catch (err) {
      // Error handled by addOfferFirestore
    } finally {
      setLoading(false);
    }
  };

  const getOffersForTask = (taskId: string): Offer[] => {
    return allOffers.filter(offer => offer.taskId === taskId);
  };

  const acceptOffer = async (offerId: string, taskId: string): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to accept an offer.");
      return null;
    }

    setLoading(true);
    try {
      const result = await acceptOfferFirestore(offerId, taskId, user);
      if (result) {
        const { taskerId, clientId } = result;

        // Fetch tasker's profile to get display name for chat
        const taskerProfileForChat = await fetchTaskerProfileById(taskerId);
        const taskerDisplayName = taskerProfileForChat?.displayName || "Tasker";
        const clientDisplayName = user.displayName || user.email || "Client";

        // Create or get chat room
        const roomId = await createChatRoom(
          [clientId, taskerId],
          [clientDisplayName, taskerDisplayName]
        );
        return roomId; // Return the roomId for navigation
      }
      return null;
    } catch (err) {
      // Error handled by acceptOfferFirestore
      return null;
    } finally {
      setLoading(false);
    }
  };

  const rejectOffer = async (offerId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to reject an offer.");
      return;
    }

    setLoading(true);
    try {
      await rejectOfferFirestore(offerId, user);
    } catch (err) {
      // Error handled by rejectOfferFirestore
    } finally {
      setLoading(false);
    }
  };

  const withdrawOffer = async (offerId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to withdraw an offer.");
      return;
    }

    setLoading(true);
    try {
      await withdrawOfferFirestore(offerId, user);
    } catch (err) {
      // Error handled by withdrawOfferFirestore
    } finally {
      setLoading(false);
    }
  };

  const value = {
    offers: allOffers,
    loading: loading || taskerLoading, // Consider tasker profile loading as well
    error,
    addOffer,
    getOffersForTask,
    acceptOffer,
    rejectOffer,
    withdrawOffer,
  };

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
};

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};