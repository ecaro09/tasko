import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  DocumentData,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTasks } from './use-tasks'; // Import useTasks to update task status

export interface Offer {
  id: string;
  taskId: string;
  taskerId: string;
  taskerName: string;
  taskerAvatar?: string;
  offerAmount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  dateCreated: string; // ISO string
  dateUpdated?: string; // ISO string
}

interface OffersContextType {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  getOffersForTask: (taskId: string) => Offer[];
  makeOffer: (
    taskId: string,
    offerAmount: number,
    message: string,
  ) => Promise<void>;
  acceptOffer: (offerId: string, taskId: string) => Promise<void>;
  rejectOffer: (offerId: string) => Promise<void>;
  withdrawOffer: (offerId: string) => Promise<void>;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export const OffersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { updateTaskStatus } = useTasks(); // Use the updateTaskStatus from useTasks
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch all offers. In a larger app, this might be filtered by user or task for performance.
    const q = query(collection(db, 'offers'), orderBy('dateCreated', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOffers: Offer[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          taskId: data.taskId,
          taskerId: data.taskerId,
          taskerName: data.taskerName,
          taskerAvatar: data.taskerAvatar,
          offerAmount: data.offerAmount,
          message: data.message,
          status: data.status || 'pending',
          dateCreated: data.dateCreated?.toDate().toISOString() || new Date().toISOString(),
          dateUpdated: data.dateUpdated?.toDate().toISOString(),
        };
      });
      setOffers(fetchedOffers);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching offers:", err);
      setError("Failed to fetch offers.");
      setLoading(false);
      toast.error("Failed to load offers.");
    });

    return () => unsubscribe();
  }, []);

  const getOffersForTask = useCallback((taskId: string) => {
    return offers.filter(offer => offer.taskId === taskId);
  }, [offers]);

  const makeOffer = async (
    taskId: string,
    offerAmount: number,
    message: string,
  ) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to make an offer.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'offers'), {
        taskId,
        taskerId: user.uid,
        taskerName: user.displayName || 'Anonymous',
        taskerAvatar: user.photoURL || null,
        offerAmount,
        message,
        status: 'pending',
        dateCreated: serverTimestamp(),
        dateUpdated: serverTimestamp(),
      });
      toast.success("Offer made successfully!");
    } catch (err: any) {
      console.error("Error making offer:", err);
      toast.error(`Failed to make offer: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOfferStatus = async (offerId: string, status: Offer['status']) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to update an offer.");
      return;
    }

    setLoading(true);
    try {
      const offerRef = doc(db, 'offers', offerId);
      await updateDoc(offerRef, {
        status,
        dateUpdated: serverTimestamp(),
      });
      toast.success(`Offer ${status} successfully!`);
    } catch (err: any) {
      console.error(`Error updating offer status to ${status}:`, err);
      toast.error(`Failed to update offer status: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptOffer = async (offerId: string, taskId: string) => {
    try {
      await updateOfferStatus(offerId, 'accepted');
      const acceptedOffer = offers.find(o => o.id === offerId);
      if (acceptedOffer) {
        await updateTaskStatus(taskId, 'assigned', acceptedOffer.taskerId, offerId);
        // Optionally, reject all other pending offers for this task
        const otherOffers = offers.filter(o => o.taskId === taskId && o.id !== offerId && o.status === 'pending');
        for (const offer of otherOffers) {
          await updateOfferStatus(offer.id, 'rejected');
        }
      }
      toast.success("Offer accepted and task assigned!");
    } catch (err: any) {
      console.error("Error accepting offer:", err);
      toast.error(`Failed to accept offer: ${err.message}`);
    }
  };

  const rejectOffer = async (offerId: string) => {
    await updateOfferStatus(offerId, 'rejected');
  };

  const withdrawOffer = async (offerId: string) => {
    await updateOfferStatus(offerId, 'withdrawn');
  };

  const value = {
    offers,
    loading,
    error,
    getOffersForTask,
    makeOffer,
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