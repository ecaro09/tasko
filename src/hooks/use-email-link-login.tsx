import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { toast } from 'sonner';

export function useEmailLinkLogin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt("Please provide your email for confirmation");
        }

        if (!email) {
          setError("Email not provided for sign-in confirmation.");
          setLoading(false);
          toast.error("Email not provided for sign-in confirmation.");
          return;
        }

        try {
          await signInWithEmailLink(auth, email, window.location.href);
          console.log("User signed in successfully with email link.");
          localStorage.removeItem("emailForSignIn");
          setLoading(false);
          // toast.success("Successfully logged in!"); // Moved toast to FinishSignInPage for better UX
        } catch (err: any) {
          console.error("Error during email link sign-in:", err);
          setError(err.message || "Failed to sign in with email link.");
          setLoading(false);
          toast.error(`Failed to sign in: ${err.message}`);
        }
      } else {
        setLoading(false); // Not an email link sign-in URL
      }
    };

    handleSignIn();
  }, []);

  return { loading, error };
}