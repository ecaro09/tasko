import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile'; // New import
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void; // New prop
}

// Define Zod schema for signup
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters.").max(50, "First name cannot exceed 50 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters.").max(50, "Last name cannot exceed 50 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().optional().refine((val) => !val || /^\+?\d{10,15}$/.test(val), {
    message: "Invalid phone number format. Use international format (e.g., +639171234567).",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signupWithEmailPassword, loading: authLoading } = useAuth();
  const { updateProfile: updateSupabaseProfile } = useSupabaseProfile();
  const [isLoadingLocal, setIsLoadingLocal] = React.useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  // Reset form fields when modal opens
  React.useEffect(() => {
    if (isOpen) {
      form.reset();
      setIsLoadingLocal(false);
    }
  }, [isOpen, form]);

  const handleEmailPasswordSignup = async (values: SignupFormValues) => {
    setIsLoadingLocal(true);
    try {
      const newUser = await signupWithEmailPassword(values.email, values.password, values.firstName, values.lastName);
      
      if (newUser) {
        await updateSupabaseProfile(
          newUser.uid,
          values.firstName,
          values.lastName,
          values.phone || null,
          newUser.photoURL || null,
          'user'
        );
      }
      
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

  const isFormDisabled = isLoadingLocal || authLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Sign Up for Tasko</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Join our community and start getting tasks done or earning money.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleEmailPasswordSignup)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Juan"
              {...form.register("firstName")}
              disabled={isFormDisabled}
            />
            {form.formState.errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Dela Cruz"
              {...form.register("lastName")}
              disabled={isFormDisabled}
            />
            {form.formState.errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.lastName.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...form.register("email")}
              disabled={isFormDisabled}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              disabled={isFormDisabled}
            />
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+639171234567"
              {...form.register("phone")}
              disabled={isFormDisabled}
            />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isFormDisabled}
            className="w-full bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white"
          >
            {isLoadingLocal ? 'Signing Up...' : 'Sign Up with Email'}
          </Button>
        </form>
        <DialogFooter className="text-sm text-center text-[hsl(var(--text-light))]">
          Already have an account? <Button variant="link" className="p-0 h-auto text-[hsl(var(--primary-color))] hover:text-[hsl(var(--primary-color))]" onClick={handleSwitchToLogin}>Login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;