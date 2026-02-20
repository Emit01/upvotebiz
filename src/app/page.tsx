import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOption } from "@/lib/options";
import Link from "next/link";
import Image from "next/image";
import { LandingWithAuth } from "@/components/landing/LandingWithAuth";
import { HeroAuthButtons } from "@/components/landing/HeroAuthButtons";
import { SnooRain } from "@/components/landing/SnooRain";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/new-order");
  const currencySymbol = await getOption("currency_symbol", "$");

  return (
    <LandingWithAuth>
    <div className="relative min-h-screen bg-[#fbfbfd] font-apple text-[#1d1d1f] antialiased">
      {/* Animated Snoo rain - covers the entire landing page */}
      <SnooRain />

      {/* Hero - Apple-style with Snoo imagery (upvote.biz-like) */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-11">

        <div className="relative z-10 mx-auto flex max-w-[600px] flex-col items-center text-center">
          {/* Main hero Snoo - teeth smile */}
          <div className="mb-5 w-24 sm:w-28">
            <Image
              src="/images/landing/snoo-teethsmile.png"
              alt=""
              width={112}
              height={112}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <h1 className="text-[32px] font-semibold leading-[1.08] tracking-[-0.028em] text-[#1d1d1f] sm:text-[40px]">
            Upvote<span className="text-[#0071e3]">Biz</span>
          </h1>
          <p className="mt-1.5 text-[21px] font-normal leading-snug tracking-[-0.016em] text-[#1d1d1f]">
            Social media growth.
          </p>
          <p className="mt-4 text-[12px] font-normal text-[#6e6e73]">
            &lt;1min delivery · 99.9% uptime · 10K+ users · Competitive pricing · API available
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-3">
            <HeroAuthButtons />
          </div>
        </div>
      </section>

      {/* Service types - card summary (between Hero and What we offer) */}
      <section className="relative bg-[#fbfbfd] py-14">
        <div className="mx-auto max-w-[980px] px-6">
          <h2 className="mb-10 text-center text-[24px] font-semibold tracking-[-0.022em] sm:text-[28px] text-[#1d1d1f] dark:text-[var(--label-primary)]">
            Our services
          </h2>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:justify-center">
            {[
              {
                title: "Post Upvotes & Downvotes",
                price: `from ${currencySymbol}0.50/1K`,
                desc: "Real upvotes or downvotes on posts with dynamic delivery speed. High-quality engagement, dripfeed support, and optional refill.",
                href: "/explore",
                featured: false,
                comingSoon: false,
              },
              {
                title: "Comment Upvotes & Downvotes",
                price: `from ${currencySymbol}0.40/1K`,
                desc: "Targeted engagement on comments. Adjustable speed and volume, reliable delivery. Perfect for highlighting or moderating discussion threads.",
                href: "/explore",
                featured: true,
                comingSoon: false,
              },
              {
                title: "Custom Comments",
                price: `from ${currencySymbol}1.00/1K`,
                desc: "Unique, custom comments from real users. Set delay windows, one comment per line. Best for authentic-looking discussions and replies.",
                href: "/explore",
                featured: false,
                comingSoon: true,
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`relative flex w-full max-w-[340px] flex-col items-center overflow-hidden rounded-3xl bg-white px-8 text-center transition-shadow hover:shadow-lg ${
                  card.featured
                    ? "border-2 border-dashed border-[#0071e3] py-12 sm:-my-4 sm:shadow-md"
                    : "border border-[#e8e8ed] py-10"
                }`}
              >
                {card.comingSoon && (
                  <div className="absolute -right-[30px] top-[22px] rotate-45 bg-gradient-to-r from-[#7c5cfc] to-[#a855f7] px-10 py-1">
                    <span className="text-[11px] font-semibold text-white">Coming soon</span>
                  </div>
                )}
                <h3 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#1d1d1f] sm:text-[32px]">
                  {card.title}
                </h3>
                <p className="mt-4 text-[16px] font-semibold text-[#0071e3]">
                  {card.price}
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-[#6e6e73] flex-1">
                  {card.desc}
                </p>
                <Link
                  href={card.href}
                  className={`mt-8 w-full rounded-full py-3.5 text-center text-[16px] font-semibold transition-all ${
                    card.featured
                      ? "bg-gradient-to-r from-[#7c5cfc] to-[#a855f7] text-white shadow-lg shadow-purple-200 hover:opacity-90"
                      : "border border-[#e0e0e0] bg-[#f8f8f8] text-[#1d1d1f] hover:bg-[#f0f0f0]"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we offer - Snoo per feature, Apple styling */}
      <section className="relative bg-[#f5f5f7] py-14">
        <div className="mx-auto max-w-[980px] px-6">
          <h2 className="mb-10 text-center text-[24px] font-semibold tracking-[-0.022em] sm:text-[28px]">
            <span className="text-[#1d1d1f]">What we </span>
            <span className="text-[#0071e3]">offer</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Automatic", desc: "Lightning-fast panel setup. No waiting, no hassle. Just sign up and start ordering.", snoo: "snoo-happy" },
              { title: "Support", desc: "Friendly help when you need it. Our team responds quickly to questions and issues.", snoo: "snoo-tongue" },
              { title: "High quality services", desc: "Premium upvotes, karma, and engagement. Reliable delivery and competitive pricing.", snoo: "snoo-teethsmile" },
              { title: "Updates", desc: "We keep improving the panel and adding new services. You always get the latest features.", snoo: "snoo-wink" },
              { title: "API Support", desc: "Full-featured REST API for resellers and automation. Integrate in minutes.", snoo: "snoo-happy" },
              { title: "Secure Payments", desc: "Safe checkout and encrypted payment handling. Multiple payment options available.", snoo: "snoo-wink" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl bg-[#fbfbfd] p-6 text-center transition-opacity hover:opacity-95"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                  <Image
                    src={`/images/landing/${feature.snoo}.png`}
                    alt=""
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-[14px] font-semibold tracking-[-0.016em] text-[#1d1d1f]">
                  {feature.title}
                </h3>
                <p className="text-[12px] leading-relaxed tracking-[-0.01em] text-[#6e6e73]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d2d2d7]/60 bg-[#fbfbfd]">
        <div className="mx-auto flex max-w-[980px] items-center justify-between px-6 py-4">
          <span className="text-[11px] text-[#6e6e73]">
            &copy; {new Date().getFullYear()} UpvoteBiz
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-[11px] text-[#0071e3] transition-opacity hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-[11px] text-[#0071e3] transition-opacity hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
    </LandingWithAuth>
  );
}
