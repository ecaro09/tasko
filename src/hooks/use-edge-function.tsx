import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseEdgeFunctionResult<TData, TError> {
  data: TData | null;
  loading: boolean;
  error: TError | null;
  invoke: (payload?: object) => Promise<TData | null>;
}

export const useEdgeFunction = <TData = any, TError = any>(
  functionName: string
): UseEdgeFunctionResult<TData, TError> => {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);

  const invoke = useCallback(async (payload?: object): Promise<TData | null> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const { data: responseData, error: invokeError } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (invokeError) {
        throw invokeError;
      }

      if (responseData) {
        setData(responseData as TData);
        return responseData as TData;
      }
      return null;
    } catch (err: any) {
      console.error(`Error invoking Edge Function '${functionName}':`, err);
      setError(err as TError);
      toast.error(`Failed to call '${functionName}': ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [functionName]);

  return { data, loading, error, invoke };
};