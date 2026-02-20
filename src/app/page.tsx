import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOption } from "@/lib/options";
import Link from "next/link";
import Image from "next/image";
import { LandingWithAuth } from "@/components/landing/LandingWithAuth";
import { HeroAuthButtons } from "@/components/landing/HeroAuthButtons";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/new-order");
  const currencySymbol = await getOption("currency_symbol", "$");

  return (
    <LandingWithAuth>
    <div className="min-h-screen bg-[#fbfbfd] font-apple text-[#1d1d1f] antialiased">

      {/* Hero - Apple-style with Snoo imagery (upvote.biz-like) */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-11">
        {/* Floating decorative Snoos - subtle, clean */}
        <div className="pointer-events-none absolute inset-0 max-w-[980px] mx-auto">
          <div className="absolute left-[8%] top-[22%] w-16 opacity-40 sm:w-20">
            <Image src="/images/landing/snoo-wink.png" alt="" width={80} height={80} className="object-contain" />
          </div>
          <div className="absolute right-[10%] top-[28%] w-14 opacity-35 sm:w-[72px]">
            <Image src="/images/landing/snoo-tongue.png" alt="" width={72} height={72} className="object-contain" />
          </div>
          <div className="absolute left-[12%] bottom-[30%] w-12 opacity-30 sm:w-14">
            <Image src="/images/landing/snoo-happy.png" alt="" width={56} height={56} className="object-contain" />
          </div>
          <div className="absolute right-[8%] bottom-[25%] w-14 opacity-35 sm:w-16">
            <Image src="/images/landing/snoo-logo.png" alt="" width={64} height={64} className="object-contain" />
          </div>
        </div>

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
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Post Upvotes & Downvotes",
                price: `${currencySymbol}0.50`,
                priceLabel: "per 1K",
                desc: "Real upvotes or downvotes on posts with dynamic delivery speed (10–900/hr). High-quality engagement, dripfeed support, and optional refill. Ideal for boosting or controlling post visibility.",
                href: "/explore",
                featured: true,
              },
              {
                title: "Comment Upvotes & Downvotes",
                price: `${currencySymbol}0.40`,
                priceLabel: "per 1K",
                desc: "Targeted engagement on comments. Adjustable speed and volume, reliable delivery. Perfect for highlighting or moderating discussion threads.",
                href: "/explore",
                featured: false,
              },
              {
                title: "Custom Comments",
                price: `${currencySymbol}1.00`,
                priceLabel: "per 1K",
                desc: "Unique, custom comments from real users. Set delay windows (1–60 min), one comment per line. Package options available. Best for authentic-looking discussions and replies.",
                href: "/explore",
                featured: false,
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`flex flex-col rounded-2xl border bg-[#fbfbfd] dark:bg-[var(--surface-primary)] p-6 transition-shadow hover:shadow-md ${
                  card.featured
                    ? "border-[#0071e3] ring-1 ring-[#0071e3] dark:border-[var(--accent)] dark:ring-[var(--accent)]"
                    : "border-[#e8e8ed] dark:border-[var(--separator)]"
                }`}
              >
                <h3 className="text-[18px] font-semibold tracking-[-0.016em] text-[#1d1d1f] dark:text-[var(--label-primary)]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[14px] font-medium text-[#0071e3] dark:text-[var(--accent)]">
                  from {card.price}/{card.priceLabel}
                </p>
                <p className="mt-3 text-[12px] leading-relaxed tracking-[-0.01em] text-[#6e6e73] dark:text-[var(--label-secondary)] flex-1">
                  {card.desc}
                </p>
                <Link
                  href={card.href}
                  className={`mt-6 w-full rounded-full py-2.5 text-center text-[12px] font-medium transition-all ${
                    card.featured
                      ? "bg-gradient-to-r from-[#0071e3] to-[#5856d6] text-white hover:opacity-90 dark:from-[var(--accent)] dark:to-[var(--accent)]"
                      : "border border-[#e8e8ed] bg-[#fbfbfd] text-[#1d1d1f] hover:bg-[#f5f5f7] dark:border-[var(--separator)] dark:bg-[var(--surface-primary)] dark:text-[var(--label-primary)] dark:hover:bg-[var(--surface-secondary)]"
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
