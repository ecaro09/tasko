import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void; // New prop
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signupWithEmailPassword, loading: authLoading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [isLoadingLocal, setIsLoadingLocal] = React.useState(false);

  const isFormDisabled = isLoadingLocal || authLoading;

  const handleEmailPasswordSignup = async () => {
    if (!email || !password || !firstName || !lastName) {
      toast.error("Please fill in all required fields (Email, Password, First Name, Last Name).");
      return;
    }
    setIsLoadingLocal(true);
    try {
      await signupWithEmailPassword(email, password, firstName, lastName, phone);
      onClose();
    } catch (error) {
      // Error handled by useAuth hook, toast already shown
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    onSwitchToLogin();
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
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Dela Cruz"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isFormDisabled}
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
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+639171234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <Button
            onClick={handleEmailPasswordSignup}
            disabled={isFormDisabled}
            className="w-full bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white"
          >
            {isLoadingLocal ? 'Signing Up...' : 'Sign Up with Email'}
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