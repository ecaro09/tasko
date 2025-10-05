import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile'; // To check if user is a tasker
import { Task } from './use-tasks'; // Import Task interface from the correct path

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
  const [allOffers, setAllOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null); // Fixed typo: React.useState to setError

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchOffers = async () => {
      const { data, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .order('date_created', { ascending: false });

      if (fetchError) {
        console.error("Error fetching offers:", fetchError);
        setError("Failed to load offers.");
        toast.error("Failed to load offers.");
        setLoading(false);
        return;
      }

      const fetchedOffers: Offer[] = data.map((item: any) => ({
        id: item.id,
        taskId: item.task_id,
        taskerId: item.tasker_id,
        taskerName: item.tasker_name,
        taskerAvatar: item.tasker_avatar || undefined,
        clientId: item.client_id,
        offerAmount: item.offer_amount,
        message: item.message,
        status: item.status,
        dateCreated: new Date(item.date_created).toISOString(),
        dateUpdated: item.date_updated ? new Date(item.date_updated).toISOString() : undefined,
      }));
      setAllOffers(fetchedOffers);
      setLoading(false);
    };

    fetchOffers();

    // Set up real-time subscription for offers
    const subscription = supabase
      .channel('public:offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, payload => {
        console.log('Offer change received!', payload);
        fetchOffers(); // Re-fetch offers on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
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
      const { error: insertError } = await supabase
        .from('offers')
        .insert({
          task_id: taskId,
          tasker_id: user.id,
          tasker_name: taskerProfile.displayName,
          tasker_avatar: taskerProfile.photoURL,
          client_id: clientId,
          offer_amount: offerAmount,
          message: message,
          status: 'pending',
          // date_created will be set by default in Supabase
        });

      if (insertError) throw insertError;
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
      // Fetch the offer to get taskerId
      const { data: offerData, error: fetchOfferError } = await supabase
        .from('offers')
        .select('tasker_id')
        .eq('id', offerId)
        .single();

      if (fetchOfferError) throw fetchOfferError;
      if (!offerData) {
        toast.error("Offer not found.");
        setLoading(false);
        return;
      }

      // Update the offer status to 'accepted'
      const { error: updateOfferError } = await supabase
        .from('offers')
        .update({
          status: 'accepted',
          date_updated: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (updateOfferError) throw updateOfferError;

      // Update the task status to 'assigned' and set the correct assignedTaskerId
      const { error: updateTaskError } = await supabase
        .from('tasks')
        .update({
          status: 'assigned',
          assigned_tasker_id: offerData.tasker_id, // Correctly assign the tasker's ID
          assigned_offer_id: offerId,
          date_updated: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (updateTaskError) throw updateTaskError;

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
      const { error: updateError } = await supabase
        .from('offers')
        .update({
          status: 'rejected',
          date_updated: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (updateError) throw updateError;
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
      const { error: updateError } = await supabase
        .from('offers')
        .update({
          status: 'withdrawn',
          date_updated: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (updateError) throw updateError;
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