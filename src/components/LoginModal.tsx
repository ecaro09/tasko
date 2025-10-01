import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useModal } from './ModalProvider'; // Import useModal

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmailPassword } = useAuth();
  const { openSignupModal } = useModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailPasswordLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmailPassword(email, password);
      onClose();
    } catch (error) {
      // Error handled by useAuth hook, toast already shown
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignup = () => {
    onClose();
    openSignupModal();
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
            onClick={handleEmailPasswordLogin}
            disabled={isLoading}
            className="w-full bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white"
          >
            {isLoading ? 'Logging In...' : 'Login with Email'}
          </Button>
        </div>
        <DialogFooter className="text-sm text-center text-[hsl(var(--text-light))]">
          Don't have an account? <Button variant="link" className="p-0 h-auto text-[hsl(var(--primary-color))] hover:text-[hsl(var(--primary-color))]" onClick={handleSwitchToSignup}>Sign Up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;