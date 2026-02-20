"use client";

import { useLandingAuth } from "./LandingWithAuth";

export function HeroAuthButtons() {
  const auth = useLandingAuth();
  if (!auth) {
    return (
      <>
        <a href="/login" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#0071e3] px-5 py-2 text-[14px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]">
          Panel
        </a>
        <a href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-[#0071e3] bg-transparent px-5 py-2 text-[14px] font-medium text-[#0071e3] transition-all hover:bg-[#0071e3]/5 active:scale-[0.98]">
          Account Marketplace
        </a>
      </>
    );
  }
  return (
    <>
      <button type="button" onClick={auth.openSignIn} className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#0071e3] px-5 py-2 text-[14px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]">
        Panel
      </button>
      <button type="button" onClick={auth.openSignUp} className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-[#0071e3] bg-transparent px-5 py-2 text-[14px] font-medium text-[#0071e3] transition-all hover:bg-[#0071e3]/5 active:scale-[0.98]">
        Account Marketplace
      </button>
    </>
  );
}
