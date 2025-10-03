import React, { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

interface FileUploadResult {
  uploadFile: (file: File, path: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export const useFileUpload = (): FileUploadResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      toast.success("File uploaded successfully!");
      return downloadURL;
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(`Failed to upload file: ${err.message}`);
      toast.error(`Failed to upload file: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, loading, error };
};