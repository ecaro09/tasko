import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useModal } from './ModalProvider';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"; // Import Drawer components

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const { signupWithEmailPassword } = useAuth();
  const { openLoginModal } = useModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile(); // Use the hook

  const handleEmailPasswordSignup = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await signupWithEmailPassword(email, password);
      onClose();
    } catch (error) {
      // Error handled by useAuth hook, toast already shown
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    openLoginModal();
  };

  const ModalComponent = isMobile ? Drawer : Dialog;
  const ModalContentComponent = isMobile ? DrawerContent : DialogContent;
  const ModalHeaderComponent = isMobile ? DrawerHeader : DialogHeader;
  const ModalTitleComponent = isMobile ? DrawerTitle : DialogTitle;
  const ModalDescriptionComponent = isMobile ? DrawerDescription : DialogDescription;
  const ModalFooterComponent = isMobile ? DrawerFooter : DialogFooter;

  return (
    <ModalComponent open={isOpen} onOpenChange={onClose}>
      <ModalContentComponent className="sm:max-w-[425px]">
        <ModalHeaderComponent>
          <ModalTitleComponent className="text-2xl font-bold text-[hsl(var(--primary-color))]">Sign Up for Tasko</ModalTitleComponent>
          <ModalDescriptionComponent className="text-[hsl(var(--text-light))]">
            Join our community and start getting tasks done or earning money.
          </ModalDescriptionComponent>
        </ModalHeaderComponent>
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
            onClick={handleEmailPasswordSignup}
            disabled={isLoading}
            className="w-full bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up with Email'}
          </Button>
        </div>
        <ModalFooterComponent className="text-sm text-center text-[hsl(var(--text-light))]">
          Already have an account? <Button variant="link" className="p-0 h-auto text-[hsl(var(--primary-color))] hover:text-[hsl(var(--primary-color))]" onClick={handleSwitchToLogin}>Login</Button>
        </ModalFooterComponent>
      </ModalContentComponent>
    </ModalComponent>
  );
};

export default SignupModal;