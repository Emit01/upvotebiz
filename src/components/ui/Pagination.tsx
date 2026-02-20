import Link from "next/link";

export default function Pagination({
  currentPage, totalPages, baseUrl,
}: {
  currentPage: number; totalPages: number; baseUrl: string;
}) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between border-t border-separator px-5 py-3">
      <p className="text-[11px] font-medium text-label-tertiary">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-0.5">
        {currentPage > 1 && (
          <Link
            href={`${baseUrl}${separator}p=${currentPage - 1}`}
            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-label-secondary transition-colors hover:bg-surface-secondary"
          >
            Prev
          </Link>
        )}
        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span key={i} className="px-1 text-label-tertiary text-[11px]">...</span>
          ) : (
            <Link
              key={i}
              href={`${baseUrl}${separator}p=${p}`}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                p === currentPage
                  ? "bg-reddit text-white shadow-btn"
                  : "text-label-secondary hover:bg-surface-secondary"
              }`}
            >
              {p}
            </Link>
          ),
        )}
        {currentPage < totalPages && (
          <Link
            href={`${baseUrl}${separator}p=${currentPage + 1}`}
            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-label-secondary transition-colors hover:bg-surface-secondary"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
