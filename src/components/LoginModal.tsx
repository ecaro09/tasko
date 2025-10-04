import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Chrome } from 'lucide-react'; // Import Google icon

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void; // New prop
}

const LoginModal: React.FC<LoginModalProps> = React.memo(({ isOpen, onClose, onSwitchToSignup }) => {
  const { loginWithEmailPassword, signInWithGoogle, loading: authLoading } = useAuth(); // Get authLoading
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoadingLocal, setIsLoadingLocal] = React.useState(false); // Local loading for email/password

  const isFormDisabled = isLoadingLocal || authLoading; // Combine local and global auth loading

  const handleEmailPasswordLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setIsLoadingLocal(true);
    try {
      await loginWithEmailPassword(email, password);
      onClose();
    } catch (error) {
      // Error handled by useAuth hook, toast already shown
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingLocal(true); // Set local loading for immediate feedback
    try {
      onClose(); // Close the modal immediately before initiating the redirect
      await signInWithGoogle();
      // No onClose() here, as the page will redirect.
      // The AuthProvider's useEffect will handle the post-redirect state.
    } catch (error) {
      // Error handled by useAuth hook, toast already shown
      // If an error occurs before redirect, ensure loading state is reset
      setIsLoadingLocal(false);
    }
  };

  const handleSwitchToSignup = () => {
    onClose();
    onSwitchToSignup(); // Use the prop
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Login to Tasko</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Access your tasks and connect with taskers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <Button
            onClick={handleEmailPasswordLogin}
            disabled={isFormDisabled}
            className="w-full bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white"
          >
            {isLoadingLocal ? 'Logging In...' : 'Login with Email'}
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            onClick={handleGoogleLogin}
            disabled={isFormDisabled}
            variant="outline"
            className="w-full flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Chrome size={20} /> {isFormDisabled ? 'Signing In...' : 'Sign in with Google'}
          </Button>
        </div>
        <DialogFooter className="text-sm text-center text-[hsl(var(--text-light))]">
          Don't have an account? <Button variant="link" className="p-0 h-auto text-[hsl(var(--primary-color))] hover:text-[hsl(var(--primary-color))]" onClick={handleSwitchToSignup}>Sign Up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default LoginModal;