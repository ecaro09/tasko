import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmailLinkLogin } from '@/hooks/use-email-link-login'; // Import the hook
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FinishSignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error } = useEmailLinkLogin(); // Use the hook

  useEffect(() => {
    if (!loading && !error) {
      // If sign-in is successful and not loading, navigate to home or profile
      // A small delay can help ensure Firebase auth state is fully updated
      const timer = setTimeout(() => {
        navigate('/profile'); // Redirect to profile page after successful login
        toast.success("Successfully logged in!");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (error) {
      // If there's an error, display it and offer to go home
      toast.error(`Login failed: ${error}`);
    }
  }, [loading, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">
            {loading ? "Logging you in..." : "Sign-in Complete"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary-color))] mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Please wait while we complete your sign-in.</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center">
              <p className="text-red-500 mb-4">An error occurred during sign-in: {error}</p>
              <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
                Go to Home
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">You have successfully logged in.</p>
              <Button onClick={() => navigate('/profile')} className="bg-green-600 hover:bg-green-700 text-white">
                Go to Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinishSignInPage;