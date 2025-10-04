import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2, UserPlus, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signupWithEmailPassword, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await signupWithEmailPassword(email, password, firstName, lastName, phone);
      onClose(); // Close modal on successful signup (user will be redirected after email verification)
    } catch (error) {
      // Error handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || authLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Sign Up for Tasko</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Create your account to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
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
                placeholder="Dela Cruz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <Button
            onClick={handleSignup}
            disabled={isFormDisabled}
            className="w-full bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white flex items-center gap-2"
          >
            {isFormDisabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus size={18} />}
            Sign Up
          </Button>
        </div>
        <DialogFooter className="flex flex-col gap-2">
          <p className="text-sm text-center text-[hsl(var(--text-light))]">
            Already have an account?{' '}
            <Button variant="link" onClick={onSwitchToLogin} className="p-0 h-auto text-[hsl(var(--primary-color))]">
              Login
            </Button>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;