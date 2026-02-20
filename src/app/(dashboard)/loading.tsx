export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center py-12" aria-hidden>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3] dark:border-separator dark:border-t-[var(--accent)]" />
    </div>
  );
}
