"use client";

import { useState, createContext, useContext } from "react";
import { LandingHeader } from "./LandingHeader";
import { AuthModal } from "./AuthModal";

type AuthModalContextType = { openSignIn: () => void; openSignUp: () => void };
const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function useLandingAuth() {
  const ctx = useContext(AuthModalContext);
  return ctx;
}

export function LandingWithAuth({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  const openSignIn = () => {
    setAuthTab("signin");
    setAuthOpen(true);
  };
  const openSignUp = () => {
    setAuthTab("signup");
    setAuthOpen(true);
  };

  const value: AuthModalContextType = { openSignIn, openSignUp };

  return (
    <AuthModalContext.Provider value={value}>
      <LandingHeader onSignInClick={openSignIn} onGetStartedClick={openSignUp} />
      {children}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
    </AuthModalContext.Provider>
  );
}
