import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseFileUploadResult {
  uploadFile: (file: File, filePath: string, bucketName?: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export const useFileUpload = (): UseFileUploadResult => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const uploadFile = async (file: File, filePath: string, bucketName: string = 'avatars'): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        toast.success("File uploaded successfully!");
        return publicUrlData.publicUrl;
      } else {
        throw new Error("Failed to get public URL for the uploaded file.");
      }
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(err.message || "Failed to upload file.");
      toast.error(`File upload failed: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, loading, error };
};