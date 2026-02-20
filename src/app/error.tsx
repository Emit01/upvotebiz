"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  const isDbError =
    error.message?.includes("Can't reach database server") ||
    error.message?.includes("PrismaClient") ||
    error.message?.includes("database");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h2 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] mb-3">
        {isDbError ? "Service temporarily unavailable" : "Something went wrong"}
      </h2>
      <p className="text-[14px] text-[#6e6e73] max-w-md mb-6">
        {isDbError
          ? "We're having trouble connecting to our servers. Please try again in a moment."
          : "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-[#0071e3] px-6 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
