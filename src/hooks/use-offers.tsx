import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile'; // To check if user is a tasker
import { useSupabaseProfile } from './use-supabase-profile'; // Import useSupabaseProfile
import { DEFAULT_AVATAR_URL } from '@/utils/image-placeholders'; // Import default avatar URL

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
  const { profile: currentUserProfile } = useSupabaseProfile(); // Get current user's Supabase profile
  const { isTasker, loading: taskerLoading } = useTaskerProfile(); // Destructure taskerLoading
  const { fetchProfile: fetchSupabaseProfile } = useSupabaseProfile(); // Function to fetch any user's profile
  const [allOffers, setAllOffers] = useState<Offer[]>([]); // Use useState
  const [loadingOffers, setLoadingOffers] = useState(true); // Renamed to avoid conflict with taskerLoading
  const [error, setError] = useState<string | null>(null); // Use useState

  const fetchOffers = useCallback(async () => { // Memoize fetchOffers
    setLoadingOffers(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .order('date_created', { ascending: false });

      if (fetchError) {
        console.error("Error fetching offers:", fetchError);
        setError("Failed to load offers.");
        toast.error("Failed to load offers.");
        return; // Return early on error
      }

      // Fetch all unique tasker profiles to avoid N+1 queries
      const uniqueTaskerIds = Array.from(new Set(data.map(item => item.tasker_id)));
      const taskerProfiles = await Promise.all(
        uniqueTaskerIds.map(id => fetchSupabaseProfile(id))
      );
      const taskerProfileMap = new Map(taskerProfiles.filter(p => p).map(p => [p!.id, p!]));

      const fetchedOffers: Offer[] = data.map((item: any) => {
        const taskerProfile = taskerProfileMap.get(item.tasker_id);
        const taskerAvatar = taskerProfile?.avatar_url || DEFAULT_AVATAR_URL;
        const taskerName = taskerProfile?.first_name && taskerProfile?.last_name
          ? `${taskerProfile.first_name} ${taskerProfile.last_name}`
          : item.tasker_name || "Anonymous Tasker"; // Fallback to stored name if profile not found

        return {
          id: item.id,
          taskId: item.task_id,
          taskerId: item.tasker_id,
          taskerName: taskerName,
          taskerAvatar: taskerAvatar,
          clientId: item.client_id,
          offerAmount: item.offer_amount,
          message: item.message,
          status: item.status,
          dateCreated: new Date(item.date_created).toISOString(),
          dateUpdated: item.date_updated ? new Date(item.date_updated).toISOString() : undefined,
        };
      });
      setAllOffers(fetchedOffers);
    } catch (err: any) {
      console.error("Error fetching all offers:", err);
      setError(`Failed to load offers: ${err.message}`);
      toast.error(`Failed to load offers: ${err.message}`);
    } finally {
      setLoadingOffers(false);
    }
  }, [fetchSupabaseProfile]); // Dependencies for useCallback

  useEffect(() => {
    fetchOffers();

    const subscription = supabase
      .channel('public:offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, payload => {
        console.log('Offer change received!', payload);
        fetchOffers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchOffers]); // Depend on memoized fetchOffers

  const addOffer = useCallback(async (
    taskId: string,
    clientId: string,
    offerAmount: number,
    message: string,
  ) => {
    if (!isAuthenticated || !user || !isTasker || !currentUserProfile) {
      toast.error("You must be logged in as a tasker to make an offer.");
      return;
    }

    setLoadingOffers(true); // Use loadingOffers
    try {
      const { error: insertError } = await supabase
        .from('offers')
        .insert({
          task_id: taskId,
          tasker_id: user.id,
          tasker_name: currentUserProfile.first_name && currentUserProfile.last_name
            ? `${currentUserProfile.first_name} ${currentUserProfile.last_name}`
            : user.email || "Anonymous Tasker",
          tasker_avatar: currentUserProfile.avatar_url || DEFAULT_AVATAR_URL,
          client_id: clientId,
          offer_amount: offerAmount,
          message: message,
          status: 'pending',
        });

      if (insertError) throw insertError;
      toast.success("Offer submitted successfully!");
    } catch (err: any) {
      console.error("Error adding offer:", err);
      toast.error(`Failed to submit offer: ${err.message}`);
      throw err;
    } finally {
      setLoadingOffers(false); // Use loadingOffers
    }
  }, [isAuthenticated, user, isTasker, currentUserProfile, setLoadingOffers]);

  const getOffersForTask = useCallback((taskId: string): Offer[] => {
    return allOffers.filter(offer => offer.taskId === taskId);
  }, [allOffers]); // Dependency on allOffers

  const acceptOffer = useCallback(async (offerId: string, taskId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to accept an offer.");
      return;
    }

    setLoadingOffers(true); // Use loadingOffers
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
        setLoadingOffers(false); // Use loadingOffers
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
      setLoadingOffers(false); // Use loadingOffers
    }
  }, [isAuthenticated, user, setLoadingOffers]);

  const rejectOffer = useCallback(async (offerId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to reject an offer.");
      return;
    }

    setLoadingOffers(true); // Use loadingOffers
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
      setLoadingOffers(false); // Use loadingOffers
    }
    }, [isAuthenticated, user, setLoadingOffers]);

  const withdrawOffer = useCallback(async (offerId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to withdraw an offer.");
      return;
    }

    setLoadingOffers(true); // Use loadingOffers
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
      setLoadingOffers(false); // Use loadingOffers
    }
  }, [isAuthenticated, user, setLoadingOffers]);

  const value = React.useMemo(() => ({
    offers: allOffers,
    loading: loadingOffers || taskerLoading, // Use loadingOffers
    error,
    addOffer,
    getOffersForTask,
    acceptOffer,
    rejectOffer,
    withdrawOffer,
  }), [
    allOffers,
    loadingOffers,
    taskerLoading,
    error,
    addOffer,
    getOffersForTask,
    acceptOffer,
    rejectOffer,
    withdrawOffer,
  ]);

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
};

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};