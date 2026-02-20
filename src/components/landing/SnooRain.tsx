"use client";

import { useEffect, useMemo, useState } from "react";

const SNOO_IMAGES = [
  "/images/landing/snoo-happy.png",
  "/images/landing/snoo-tongue.png",
  "/images/landing/snoo-teethsmile.png",
  "/images/landing/snoo-wink.png",
  "/images/landing/snoo-logo.png",
];

const PARTICLE_COUNT = 35;

interface Particle {
  id: number;
  src: string;
  size: number;
  startX: number;
  startY: number;
  delay: number;
  duration: number;
  opacity: number;
  rotation: number;
}

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      src: SNOO_IMAGES[Math.floor(Math.random() * SNOO_IMAGES.length)],
      size: 24 + Math.random() * 32,
      // Spread starting positions along the top and right edges
      startX: 20 + Math.random() * 120,
      startY: -20 - Math.random() * 60,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 10,
      opacity: 0.06 + Math.random() * 0.14,
      rotation: -30 + Math.random() * 60,
    });
  }
  return particles;
}

export function SnooRain() {
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(() => generateParticles(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style jsx>{`
        @keyframes snoo-fall {
          0% {
            transform: translate(0, 0) rotate(var(--rot));
            opacity: var(--op);
          }
          10% {
            opacity: var(--op);
          }
          90% {
            opacity: var(--op);
          }
          100% {
            transform: translate(-120vw, 140vh) rotate(calc(var(--rot) + 180deg));
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={
            {
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              width: p.size,
              height: p.size,
              "--rot": `${p.rotation}deg`,
              "--op": p.opacity,
              animation: `snoo-fall ${p.duration}s ${p.delay}s linear infinite`,
              opacity: 0,
            } as React.CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt=""
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
