"use client";

export function SnooAvatar({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="#FF4500" />
      <ellipse cx="20" cy="23.5" rx="11" ry="8.5" fill="white" />
      <circle cx="14.8" cy="22" r="2.2" fill="#FF4500" />
      <circle cx="25.2" cy="22" r="2.2" fill="#FF4500" />
      <circle cx="15" cy="21.5" r="1" fill="white" />
      <circle cx="25" cy="21.5" r="1" fill="white" />
      <path d="M16.5 27.2c0 0 1.5 1.8 3.5 1.8s3.5-1.8 3.5-1.8" stroke="#FF4500" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="13" r="4.5" fill="white" />
      <line x1="20" y1="8.5" x2="24" y2="5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="25" cy="5" r="2.2" fill="#FF4500" />
      <circle cx="25" cy="5" r="1.2" fill="white" opacity="0.3" />
    </svg>
  );
}

export function SnooMark({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="#FF4500" />
      <ellipse cx="12" cy="14" rx="6.6" ry="5.1" fill="white" />
      <circle cx="8.9" cy="13.2" r="1.3" fill="#FF4500" />
      <circle cx="15.1" cy="13.2" r="1.3" fill="#FF4500" />
      <circle cx="9" cy="13" r="0.55" fill="white" />
      <circle cx="15" cy="13" r="0.55" fill="white" />
      <path d="M10 16.3c0 0 .9 1.1 2 1.1s2-1.1 2-1.1" stroke="#FF4500" strokeWidth="0.75" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="7.8" r="2.7" fill="white" />
      <line x1="12" y1="5.1" x2="14.4" y2="3" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="15" cy="3" r="1.3" fill="#FF4500" />
    </svg>
  );
}

export function RedditWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <SnooAvatar size={30} />
      <span className="text-[19px] font-bold tracking-[-0.02em] text-label-primary">
        reddit<span className="text-reddit">panel</span>
      </span>
    </div>
  );
}
