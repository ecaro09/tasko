import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Chrome } from 'lucide-react';
import { useModal } from './ModalProvider';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const { openLoginModal } = useModal();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      // Error handled by useAuth hook, toast will be shown there
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!displayName || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, displayName);
      onClose();
    } catch (error) {
      // Error handled by useAuth hook, toast will be shown there
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    openLoginModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Sign Up for Tasko</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Join our community and start getting tasks done or earning money.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleEmailSignup}
            disabled={isLoading}
            className="w-full bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up with Email'}
          </Button>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <Button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {isLoading ? 'Signing Up...' : (
              <>
                <Chrome size={20} /> Sign Up with Google
              </>
            )}
          </Button>
        </div>
        <DialogFooter className="text-sm text-center text-[hsl(var(--text-light))]">
          Already have an account? <Button variant="link" className="p-0 h-auto text-[hsl(var(--primary-color))] hover:text-[hsl(var(--primary-color))]" onClick={handleSwitchToLogin}>Login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;