import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';

const Header: React.FC = () => {
  const { isAuthenticated, signInWithGoogle, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white p-4 text-center shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src="https://via.placeholder.com/150x50?text=DYAD+Logo" alt="DYAD Logo" className="h-10 inline-block align-middle" />
          <h1 className="text-2xl font-bold inline-block align-middle ml-4">DYAD Full Duplicate</h1>
        </div>
        <div>
          {!isAuthenticated ? (
            <Button onClick={signInWithGoogle} className="bg-white text-blue-600 hover:bg-gray-100">
              Sign In with Google
            </Button>
          ) : (
            <Button onClick={logout} className="bg-white text-blue-600 hover:bg-gray-100">
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;