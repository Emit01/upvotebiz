import { LandingWithAuth } from "@/components/landing/LandingWithAuth";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LandingWithAuth>
      <div className="min-h-screen bg-[#fbfbfd] font-apple text-[#1d1d1f] dark:bg-[var(--surface-secondary)] dark:text-[var(--label-primary)] antialiased pt-11">
        {children}
      </div>
    </LandingWithAuth>
  );
}
