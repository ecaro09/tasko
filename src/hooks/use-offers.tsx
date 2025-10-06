import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  where,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useChat } from './use-chat'; // Import useChat to create chat rooms
import {
  Offer, // Import Offer interface
  addOfferFirestore,
  updateOfferFirestore,
  deleteOfferFirestore,
  updateOfferStatusFirestore, // New import
  assignTaskToOfferFirestore, // New import
} from '@/lib/offer-firestore'; // Import new utility functions
import { loadOffersFromCache, saveOffersToCache } from '@/lib/offer-local-cache'; // Import caching utilities

interface UseOffersContextType {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  addOffer: (newOffer: Omit<Offer, 'id' | 'taskerId' | 'taskerName' | 'taskerAvatar' | 'dateOffered' | 'status'>) => Promise<void>;
  updateOffer: (offerId: string, updatedOffer: Partial<Omit<Offer, 'id' | 'taskId' | 'taskerId' | 'taskerName' | 'taskerAvatar' | 'dateOffered'>>) => Promise<void>;
  deleteOffer: (offerId: string) => Promise<void>;
  getOffersForTask: (taskId: string) => Offer[];
  getOffersByTasker: (taskerId: string) => Offer[];
  acceptOffer: (offerId: string, taskId: string, taskerId: string, taskerName: string, clientName: string) => Promise<string | null>; // New method
  rejectOffer: (offerId: string) => Promise<void>; // New method
  withdrawOffer: (offerId: string) => Promise<void>; // New method
}

const OffersContext = createContext<UseOffersContextType | undefined>(undefined);

interface OffersProviderProps {
  children: ReactNode;
}

export const OffersProvider: React.FC<OffersProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { createChatRoom } = useChat(); // Use createChatRoom from useChat
  const [allOffers, setAllOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Load from cache immediately
    const cachedOffers = loadOffersFromCache();
    if (cachedOffers.length > 0) {
      setAllOffers(cachedOffers);
      setLoading(false);
      console.log("Offers loaded from cache.");
    } else {
      setLoading(true); // Only show loading if cache is empty
    }

    setError(null);

    const offersCollectionRef = collection(db, 'offers');
    const q = query(offersCollectionRef, orderBy('dateOffered', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOffers: Offer[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          taskId: data.taskId,
          taskerId: data.taskerId,
          taskerName: data.taskerName,
          taskerAvatar: data.taskerAvatar || "https://randomuser.me/api/portraits/lego/2.jpg",
          clientId: data.clientId, // Include clientId
          amount: data.amount,
          message: data.message,
          dateOffered: data.dateOffered?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          status: data.status || 'pending',
        };
      });
      setAllOffers(fetchedOffers);
      saveOffersToCache(fetchedOffers); // Update cache with fresh data
      setLoading(false);
    }, (err) => {
      console.error("Error fetching offers:", err);
      setError("Failed to fetch offers.");
      setLoading(false);
      toast.error("Failed to load offers.");
    });

    return () => unsubscribe();
  }, []); // Empty dependency array to run once on mount

  const addOffer = async (newOfferData: Omit<Offer, 'id' | 'taskerId' | 'taskerName' | 'taskerAvatar' | 'dateOffered' | 'status'>) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to submit an offer.");
      return;
    }
    await addOfferFirestore(newOfferData, user);
  };

  const updateOffer = async (offerId: string, updatedOffer: Partial<Omit<Offer, 'id' | 'taskId' | 'taskerId' | 'taskerName' | 'taskerAvatar' | 'dateOffered'>>) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to update an offer.");
      return;
    }
    await updateOfferFirestore(offerId, updatedOffer, user);
  };

  const deleteOffer = async (offerId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to delete an offer.");
      return;
    }
    await deleteOfferFirestore(offerId, user);
  };

  const acceptOffer = async (offerId: string, taskId: string, taskerId: string, taskerName: string, clientName: string): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to accept an offer.");
      return null;
    }
    try {
      await updateOfferStatusFirestore(offerId, 'accepted', user);
      await assignTaskToOfferFirestore(taskId, offerId, taskerId, user);

      // Create chat room between client and tasker
      const roomId = await createChatRoom(
        [user.uid, taskerId],
        [clientName, taskerName]
      );
      toast.success("Offer accepted and task assigned!");
      return roomId;
    } catch (err: any) {
      console.error("Error accepting offer:", err);
      toast.error(`Failed to accept offer: ${err.message}`);
      throw err;
    }
  };

  const rejectOffer = async (offerId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to reject an offer.");
      return;
    }
    await updateOfferStatusFirestore(offerId, 'rejected', user);
  };

  const withdrawOffer = async (offerId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to withdraw an offer.");
      return;
    }
    await updateOfferStatusFirestore(offerId, 'withdrawn', user);
  };

  const getOffersForTask = (taskId: string): Offer[] => {
    return allOffers.filter(offer => offer.taskId === taskId);
  };

  const getOffersByTasker = (taskerId: string): Offer[] => {
    return allOffers.filter(offer => offer.taskerId === taskerId);
  };

  const value = {
    offers: allOffers,
    loading,
    error,
    addOffer,
    updateOffer,
    deleteOffer,
    getOffersForTask,
    getOffersByTasker,
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