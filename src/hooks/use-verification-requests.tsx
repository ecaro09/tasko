import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  admin_notes: string | null;
  processed_at: string | null;
}

interface VerificationContextType {
  verificationRequest: VerificationRequest | null;
  loading: boolean;
  error: string | null;
  requestVerification: () => Promise<void>;
  cancelVerificationRequest: () => Promise<void>;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const VerificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [verificationRequest, setVerificationRequest] = React.useState<VerificationRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchVerificationRequest = React.useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
        throw error;
      }
      setVerificationRequest(data as VerificationRequest | null);
    } catch (err: any) {
      console.error("Error fetching verification request:", err);
      setError(err.message || "Failed to fetch verification request.");
      toast.error(`Failed to load verification status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      fetchVerificationRequest(user.uid);
    } else {
      setVerificationRequest(null);
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchVerificationRequest]);

  const requestVerification = async () => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to request verification.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: edgeFunctionError } = await supabase.functions.invoke('request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (edgeFunctionError) {
        throw new Error(edgeFunctionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.message === 'Verification request already pending.') {
        toast.info(data.message);
      } else if (data.message === 'User is already verified.') {
        toast.info(data.message);
      } else {
        toast.success(data.message);
      }
      
      // Re-fetch the status to update UI
      await fetchVerificationRequest(user.uid);

    } catch (err: any) {
      console.error("Error requesting verification:", err);
      setError(err.message || "Failed to submit verification request.");
      toast.error(`Failed to submit verification request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelVerificationRequest = async () => {
    if (!isAuthenticated || !user || !verificationRequest || verificationRequest.status !== 'pending') {
      toast.error("No pending request to cancel.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('verification_requests')
        .delete()
        .eq('id', verificationRequest.id)
        .eq('user_id', user.uid)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success("Verification request cancelled.");
      setVerificationRequest(null); // Clear the request from state
    } catch (err: any) {
      console.error("Error cancelling verification request:", err);
      setError(err.message || "Failed to cancel verification request.");
      toast.error(`Failed to cancel request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    verificationRequest,
    loading: loading || authLoading,
    error,
    requestVerification,
    cancelVerificationRequest,
  };

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
};

export const useVerificationRequests = () => {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerificationRequests must be used within a VerificationProvider');
  }
  return context;
};