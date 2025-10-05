import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/'); // Redirect to home if already authenticated
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-[hsl(var(--primary-color))] text-center mb-6">Welcome to Tasko</h1>
        <Auth
          supabaseClient={supabase}
          providers={['google']} // Only Google for now, can add more later
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary-color))',
                  brandAccent: 'hsl(var(--secondary-color))',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/'} // Redirect to home after login
          magicLink={true}
        />
      </div>
    </div>
  );
};

export default Login;