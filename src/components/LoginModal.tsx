import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, LogIn, Google } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignup }) => {
  const { loginWithEmailPassword, signInWithGoogle, sendLoginLinkToEmail, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLinkInput, setShowMagicLinkInput] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmailPassword(email, password);
      onClose();
    } catch (error) {
      // Error handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      // Error handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email to receive a magic link.");
      return;
    }
    setIsLoading(true);
    try {
      await sendLoginLinkToEmail(email);
      // No direct close, user needs to check email
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
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Login to Tasko</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Enter your credentials to access your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          {!showMagicLinkInput && (
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
          )}
          <Button
            onClick={handleLogin}
            disabled={isFormDisabled || showMagicLinkInput}
            className="w-full bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white flex items-center gap-2"
          >
            {isFormDisabled && !showMagicLinkInput ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn size={18} />}
            Login
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isFormDisabled}
            className="w-full flex items-center gap-2"
          >
            {isFormDisabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Google size={18} />}
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowMagicLinkInput(!showMagicLinkInput)}
            disabled={isFormDisabled}
            className="w-full flex items-center gap-2"
          >
            <Mail size={18} />
            {showMagicLinkInput ? "Login with Password" : "Login with Magic Link"}
          </Button>
          {showMagicLinkInput && (
            <Button
              onClick={handleSendMagicLink}
              disabled={isFormDisabled || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isFormDisabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail size={18} />}
              Send Magic Link
            </Button>
          )}
        </div>
        <DialogFooter className="flex flex-col gap-2">
          <p className="text-sm text-center text-[hsl(var(--text-light))]">
            Don't have an account?{' '}
            <Button variant="link" onClick={onSwitchToSignup} className="p-0 h-auto text-[hsl(var(--primary-color))]">
              Sign Up
            </Button>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;