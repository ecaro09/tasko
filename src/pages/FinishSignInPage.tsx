import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const FinishSignInPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          toast.success("Successfully logged in!");
          navigate('/'); // Redirect to home page
        } else {
          // If no session, it might be a fresh redirect from a magic link
          // Supabase's onAuthStateChange listener in useAuth will handle the session.
          // We just need to ensure the URL parameters are processed.
          const { error: parseError } = await supabase.auth.verifyOtp({
            email: localStorage.getItem('emailForSignIn') || '',
            token: new URLSearchParams(window.location.hash.substring(1)).get('access_token') || '',
            type: 'magiclink',
          });

          if (parseError) {
            throw parseError;
          }
          toast.success("Successfully logged in!");
          navigate('/'); // Redirect to home page
        }
      } catch (error: any) {
        console.error("Error finishing sign-in:", error);
        toast.error(`Failed to log in: ${error.message}`);
        navigate('/login'); // Redirect to login page on error
      }
    };

    handleSignIn();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md text-center shadow-lg bg-white dark:bg-gray-800 p-8 rounded-lg">
        <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--primary-color))] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-2">Finishing Sign In...</h1>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default FinishSignInPage;