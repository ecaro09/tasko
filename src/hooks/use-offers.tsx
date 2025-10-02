import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, DocumentData, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile'; // To check if user is a tasker

export interface Offer {
  id: string;
  taskId: string;
  taskerId: string;
  taskerName: string;
  taskerAvatar?: string;
  clientId: string; // The ID of the user who posted the task
  offerAmount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  dateCreated: string;
  dateUpdated?: string;
}

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
  acceptOffer: (offerId: string, taskId: string) => Promise<void>;
  rejectOffer: (offerId: string) => Promise<void>;
  withdrawOffer: (offerId: string) => Promise<void>;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export const OffersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { taskerProfile, isTasker, loading: taskerLoading } = useTaskerProfile();
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const offersCollectionRef = collection(db, 'offers');
    const q = query(offersCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOffers: Offer[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          taskId: data.taskId,
          taskerId: data.taskerId,
          taskerName: data.taskerName,
          taskerAvatar: data.taskerAvatar,
          clientId: data.clientId,
          offerAmount: data.offerAmount,
          message: data.message,
          status: data.status,
          dateCreated: data.dateCreated?.toDate().toISOString() || new Date().toISOString(),
          dateUpdated: data.dateUpdated?.toDate().toISOString(),
        };
      });
      setAllOffers(fetchedOffers);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching offers:", err);
      setError("Failed to fetch offers.");
      setLoading(false);
      toast.error("Failed to load offers.");
    });

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
      await addDoc(collection(db, 'offers'), {
        taskId,
        taskerId: user.uid,
        taskerName: taskerProfile.displayName,
        taskerAvatar: taskerProfile.photoURL,
        clientId,
        offerAmount,
        message,
        status: 'pending',
        dateCreated: serverTimestamp(),
      });
      toast.success("Offer submitted successfully!");
    } catch (err: any) {
      console.error("Error adding offer:", err);
      toast.error(`Failed to submit offer: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOffersForTask = (taskId: string): Offer[] => {
    return allOffers.filter(offer => offer.taskId === taskId);
  };

  const acceptOffer = async (offerId: string, taskId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to accept an offer.");
      return;
    }

    setLoading(true);
    try {
      const offerRef = doc(db, 'offers', offerId);
      const offerSnap = await getDoc(offerRef); // Fetch the offer to get taskerId
      if (!offerSnap.exists()) {
        toast.error("Offer not found.");
        setLoading(false);
        return;
      }
      const offerData = offerSnap.data() as Offer;

      await updateDoc(offerRef, {
        status: 'accepted',
        dateUpdated: serverTimestamp(),
      });

      // Update the task status to 'assigned' and set the correct assignedTaskerId
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'assigned',
        assignedTaskerId: offerData.taskerId, // Correctly assign the tasker's ID
        assignedOfferId: offerId,
      });

      toast.success("Offer accepted!");
    } catch (err: any) {
      console.error("Error accepting offer:", err);
      toast.error(`Failed to accept offer: ${err.message}`);
      throw err;
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
      const offerRef = doc(db, 'offers', offerId);
      await updateDoc(offerRef, {
        status: 'rejected',
        dateUpdated: serverTimestamp(),
      });
      toast.info("Offer rejected.");
    } catch (err: any) {
      console.error("Error rejecting offer:", err);
      toast.error(`Failed to reject offer: ${err.message}`);
      throw err;
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
      const offerRef = doc(db, 'offers', offerId);
      await updateDoc(offerRef, {
        status: 'withdrawn',
        dateUpdated: serverTimestamp(),
      });
      toast.info("Offer withdrawn.");
    } catch (err: any) {
      console.error("Error withdrawing offer:", err);
      toast.error(`Failed to withdraw offer: ${err.message}`);
      throw err;
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