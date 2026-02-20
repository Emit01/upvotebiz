"use client";

import { useState, useMemo } from "react";

interface Category { id: number; name: string; }
interface Service {
  id: number; cate_id: number; name: string; price: number; min: number; max: number;
  type: string; dripfeed: number; refill: number; desc: string;
  api_provider_id: number; api_service_id: string; original_price: number;
}
interface CustomPrice { service_id: number | null; price: number; }

type Tab = "single" | "mass";

const SUBSCRIPTION_DELAYS = [0, 5, 10, 15, 30, 60, 90];
const DRIPFEED_INTERVALS = [0, 5, 10, 15, 30, 60];

export default function NewOrderForm({
  categories, services, customPrices,
}: {
  categories: Category[]; services: Service[]; customPrices: CustomPrice[];
}) {
  const [tab, setTab] = useState<Tab>("single");

  // Single order state
  const [categoryId, setCategoryId] = useState<number>(0);
  const [serviceId, setServiceId] = useState<number>(0);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [agree, setAgree] = useState(false);
  const [isDripFeed, setIsDripFeed] = useState(false);
  const [runs, setRuns] = useState("");
  const [interval_, setInterval_] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // Service-type specific fields
  const [comments, setComments] = useState("");
  const [commentsCustomPackage, setCommentsCustomPackage] = useState("");
  const [usernames, setUsernames] = useState("");
  const [usernamesCustom, setUsernamesCustom] = useState("");
  const [hashtagsField, setHashtagsField] = useState("");
  const [hashtagField, setHashtagField] = useState("");
  const [usernameField, setUsernameField] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [delay1, setDelay1] = useState("");
  const [delay2, setDelay2] = useState("");

  // Position fields (disabled for now)
  const [isPosition, setIsPosition] = useState(false);
  const [position, setPosition] = useState("0");
  const [positionTime, setPositionTime] = useState("");
  const [positionUpvotes, setPositionUpvotes] = useState("");
  const [delayOrder, setDelayOrder] = useState("");

  // Subscription fields
  const [subUsername, setSubUsername] = useState("");
  const [subPosts, setSubPosts] = useState("");
  const [subMin, setSubMin] = useState("");
  const [subMax, setSubMax] = useState("");
  const [subDelay, setSubDelay] = useState("0");
  const [subExpiry, setSubExpiry] = useState("");

  // Mass order state
  const [massOrderText, setMassOrderText] = useState("");
  const [massAgree, setMassAgree] = useState(false);
  const [massLoading, setMassLoading] = useState(false);
  const [massMessage, setMassMessage] = useState<{ type: string; text: string } | null>(null);

  const filteredServices = useMemo(
    () => (categoryId ? services.filter((s) => s.cate_id === categoryId) : []),
    [categoryId, services],
  );
  const selectedService = useMemo(() => services.find((s) => s.id === serviceId), [serviceId, services]);
  const serviceType = selectedService?.type || "default";

  const userPrice = useMemo(() => {
    if (!selectedService) return 0;
    const custom = customPrices.find((p) => p.service_id === selectedService.id);
    return custom?.price || selectedService.price;
  }, [selectedService, customPrices]);

  const showQuantity = !["package", "custom_comments_package", "subscriptions"].includes(serviceType);
  const showLink = serviceType !== "subscriptions";
  const showDripfeed = selectedService && selectedService.dripfeed === 1 && serviceType !== "subscriptions";

  const totalCharge = useMemo(() => {
    if (!selectedService) return 0;

    if (serviceType === "subscriptions") {
      const maxVal = parseInt(subMax) || 0;
      const posts = parseInt(subPosts) || 0;
      return (maxVal * posts * userPrice) / 1000;
    }

    if (serviceType === "package" || serviceType === "custom_comments_package") return userPrice;

    let qty = parseInt(quantity) || 0;
    if (serviceType === "custom_comments") {
      qty = comments.split("\n").filter((l) => l.trim()).length;
    } else if (serviceType === "mentions_custom_list") {
      qty = usernamesCustom.split("\n").filter((l) => l.trim()).length;
    }

    const totalQty = isDripFeed && runs ? parseInt(runs) * qty : qty;
    return (userPrice * totalQty) / 1000;
  }, [selectedService, quantity, userPrice, isDripFeed, runs, serviceType, comments, usernamesCustom, subMax, subPosts]);

  const resetForm = () => {
    setLink(""); setQuantity(""); setAgree(false); setIsDripFeed(false);
    setRuns(""); setInterval_(""); setComments(""); setCommentsCustomPackage("");
    setUsernames(""); setUsernamesCustom(""); setHashtagsField(""); setHashtagField("");
    setUsernameField(""); setMediaUrl(""); setDelay1(""); setDelay2("");
    setIsPosition(false); setPosition("0"); setPositionTime(""); setPositionUpvotes("");
    setDelayOrder(""); setSubUsername(""); setSubPosts(""); setSubMin("");
    setSubMax(""); setSubDelay("0"); setSubExpiry("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const payload: any = {
        category_id: categoryId,
        service_id: serviceId,
        link,
        quantity: parseInt(quantity) || 0,
        agree,
        is_drip_feed: isDripFeed,
        runs: parseInt(runs) || 0,
        interval: parseInt(interval_) || 0,
        is_position: isPosition ? 1 : 0,
        position: parseInt(position) || 0,
        position_time: parseInt(positionTime) || 0,
        position_upvotes: parseInt(positionUpvotes) || 0,
        delay1: parseInt(delay1) || 0,
        delay2: parseInt(delay2) || 0,
        delay_order: parseInt(delayOrder) || 0,
      };

      // Service-type specific
      if (serviceType === "custom_comments") payload.comments = comments;
      if (serviceType === "custom_comments_package") payload.comments_custom_package = commentsCustomPackage;
      if (serviceType === "mentions_with_hashtags") { payload.usernames = usernames; payload.hashtags = hashtagsField; }
      if (serviceType === "mentions_hashtag") payload.hashtag = hashtagField;
      if (serviceType === "comment_likes" || serviceType === "mentions_user_followers") payload.username = usernameField;
      if (serviceType === "mentions_media_likers") payload.media_url = mediaUrl;
      if (serviceType === "mentions_custom_list") payload.usernames_custom = usernamesCustom;
      if (serviceType === "subscriptions") {
        payload.sub_username = subUsername;
        payload.sub_posts = parseInt(subPosts) || 0;
        payload.sub_min = parseInt(subMin) || 0;
        payload.sub_max = parseInt(subMax) || 0;
        payload.sub_delay = parseInt(subDelay) || 0;
        payload.sub_expiry = subExpiry;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "error") {
        setMessage({ type: "error", text: data.message });
      } else {
        setMessage({ type: "success", text: data.message || "Order placed successfully!" });
        resetForm();
      }
    } catch { setMessage({ type: "error", text: "An error occurred" }); }
    finally { setLoading(false); }
  };

  const handleMassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMassMessage(null);
    setMassLoading(true);
    try {
      const lines = massOrderText.split("\n").map((l) => l.trim()).filter(Boolean);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mass_order", mass_order: lines, agree: massAgree }),
      });
      const data = await res.json();
      if (data.status === "error") {
        let msg = data.message;
        if (data.errors) {
          const errLines = Object.entries(data.errors).map(([line, error]) => `${line}: ${error}`);
          msg += "\n" + errLines.join("\n");
          if (data.success_count > 0) msg = `${data.success_count} orders placed. Errors:\n` + errLines.join("\n");
        }
        setMassMessage({ type: "error", text: msg });
      } else {
        setMassMessage({ type: "success", text: data.message });
        setMassOrderText("");
        setMassAgree(false);
      }
    } catch { setMassMessage({ type: "error", text: "An error occurred" }); }
    finally { setMassLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Tabs — Apple-style segmented control */}
      <div className="inline-flex rounded-full border border-[var(--separator)] bg-[var(--surface-primary)] p-0.5 dark:border-separator">
        {(["single", "mass"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-[12px] font-medium tracking-[-0.01em] transition-all ${
              tab === t
                ? "bg-[var(--label-primary)] text-[var(--label-inverse)] dark:bg-[var(--label-primary)] dark:text-[var(--label-inverse)]"
                : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
            }`}
          >
            {t === "single" ? "Single order" : "Mass order"}
          </button>
        ))}
      </div>

      {tab === "single" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="min-w-0">
            <div className="card p-5">
              {message && (
                <div className={`mb-5 ${message.type === "error" ? "alert-error" : "alert-success"}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => { setCategoryId(parseInt(e.target.value)); setServiceId(0); resetForm(); }}
                    className="input-field-neworder"
                  >
                    <option value={0}>Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Service */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">
                    Service
                  </label>
                  <select value={serviceId} onChange={(e) => setServiceId(parseInt(e.target.value))} className="input-field-neworder select-field-neworder">
                    <option value={0}>Select service</option>
                    {filteredServices.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — ${s.price.toFixed(4)}/1K</option>
                    ))}
                  </select>
                </div>

                {/* Link */}
                {selectedService && showLink && (
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">
                      Link
                    </label>
                    <textarea
                      rows={2}
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="input-field-neworder resize-none"
                      placeholder="https://reddit.com/..."
                    />
                  </div>
                )}

                {/* Quantity */}
                {selectedService && showQuantity && serviceType !== "custom_comments" && serviceType !== "mentions_custom_list" && (
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">
                      Quantity
                      <span className="ml-1.5 font-normal text-[var(--label-tertiary)]">
                        Min {selectedService.min.toLocaleString()} – Max {selectedService.max.toLocaleString()}
                      </span>
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="input-field-neworder"
                      min={selectedService.min}
                      max={selectedService.max}
                      placeholder={`${selectedService.min.toLocaleString()} – ${selectedService.max.toLocaleString()}`}
                      disabled={isPosition}
                    />
                  </div>
                )}

                {/* ---- Service Type Specific Fields ---- */}

                {/* Custom Comments */}
                {serviceType === "custom_comments" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Delay start (min)</label>
                        <input type="number" value={delay1} onChange={(e) => setDelay1(e.target.value)} className="input-field-neworder" min={1} max={60} placeholder="Min" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Delay end (min)</label>
                        <input type="number" value={delay2} onChange={(e) => setDelay2(e.target.value)} className="input-field-neworder" min={1} max={60} placeholder="Max" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Comments (one per line)</label>
                      <textarea rows={5} value={comments} onChange={(e) => setComments(e.target.value)} className="input-field-neworder resize-y" placeholder="Enter comments, one per line..." />
                    </div>
                  </>
                )}

                {/* Custom Comments Package */}
                {serviceType === "custom_comments_package" && (
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Comments (one per line)</label>
                    <textarea rows={5} value={commentsCustomPackage} onChange={(e) => setCommentsCustomPackage(e.target.value)} className="input-field-neworder resize-y" placeholder="Enter comments, one per line..." />
                  </div>
                )}

                {/* Mentions with Hashtags */}
                {serviceType === "mentions_with_hashtags" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Usernames</label>
                      <input type="text" value={usernames} onChange={(e) => setUsernames(e.target.value)} className="input-field-neworder" placeholder="usernameA, usernameB, usernameC" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Hashtags</label>
                      <input type="text" value={hashtagsField} onChange={(e) => setHashtagsField(e.target.value)} className="input-field-neworder" placeholder="#goodphoto, #love, #nice" />
                    </div>
                  </>
                )}

                {/* Mentions Hashtag */}
                {serviceType === "mentions_hashtag" && (
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Speed</label>
                    <input type="number" value={hashtagField} onChange={(e) => setHashtagField(e.target.value)} className="input-field-neworder" min={10} max={900} placeholder="Speed" />
                  </div>
                )}

                {/* Comment Likes / Mentions User Followers */}
                {(serviceType === "comment_likes" || serviceType === "mentions_user_followers") && (
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Username</label>
                    <input type="text" value={usernameField} onChange={(e) => setUsernameField(e.target.value)} className="input-field-neworder" placeholder="Username" />
                  </div>
                )}

                {/* Mentions Media Likers */}
                {serviceType === "mentions_media_likers" && (
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Media URL</label>
                    <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="input-field-neworder" placeholder="https://..." />
                  </div>
                )}

                {/* Mentions Custom List */}
                {serviceType === "mentions_custom_list" && (
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Usernames (one per line)</label>
                    <textarea rows={5} value={usernamesCustom} onChange={(e) => setUsernamesCustom(e.target.value)} className="input-field-neworder resize-y" placeholder="Enter usernames, one per line..." />
                  </div>
                )}

                {/* Subscriptions */}
                {serviceType === "subscriptions" && selectedService && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Username</label>
                      <input type="text" value={subUsername} onChange={(e) => setSubUsername(e.target.value)} className="input-field-neworder" placeholder="Username" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">New posts</label>
                      <input type="number" value={subPosts} onChange={(e) => setSubPosts(e.target.value)} className="input-field-neworder" min={1} placeholder="Min 1" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Min quantity</label>
                      <input type="number" value={subMin} onChange={(e) => setSubMin(e.target.value)} className="input-field-neworder" min={selectedService.min} placeholder={`${selectedService.min}`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Max quantity</label>
                      <input type="number" value={subMax} onChange={(e) => setSubMax(e.target.value)} className="input-field-neworder" max={selectedService.max} placeholder={`${selectedService.max}`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Delay (min)</label>
                      <select value={subDelay} onChange={(e) => setSubDelay(e.target.value)} className="input-field-neworder select-field-neworder">
                        {SUBSCRIPTION_DELAYS.map((d) => (
                          <option key={d} value={d}>{d === 0 ? "No delay" : `${d} min`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Expiry</label>
                      <input type="date" value={subExpiry} onChange={(e) => setSubExpiry(e.target.value)} className="input-field-neworder" />
                    </div>
                  </div>
                )}

                {/* Dripfeed */}
                {showDripfeed && (
                  <div className="space-y-4 rounded-lg border border-[var(--separator-light)] bg-[var(--surface-secondary)]/50 p-4">
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input type="checkbox" checked={isDripFeed} onChange={(e) => setIsDripFeed(e.target.checked)} className="h-4 w-4 rounded border-[var(--separator)] text-[var(--accent)] focus:ring-[var(--focus-ring)]" />
                      <span className="text-[13px] font-medium tracking-[-0.01em] text-[var(--label-primary)]">Drip-feed</span>
                    </label>
                    {isDripFeed && (
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                          <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Runs</label>
                          <input type="number" value={runs} onChange={(e) => setRuns(e.target.value)} className="input-field-neworder" placeholder="Runs" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Interval (min)</label>
                          <select value={interval_} onChange={(e) => setInterval_(e.target.value)} className="input-field-neworder select-field-neworder">
                            <option value="">Select</option>
                            {DRIPFEED_INTERVALS.map((v) => <option key={v} value={v}>{v} min</option>)}
                          </select>
                        </div>
                        {runs && quantity && (
                          <div className="col-span-2 space-y-1.5">
                            <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Total quantity</label>
                            <input type="text" className="input-field-neworder bg-[var(--surface-tertiary)]" value={(parseInt(runs) || 0) * (parseInt(quantity) || 0)} readOnly disabled />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Total Charge */}
                <div className="flex items-center justify-between rounded-lg border border-[var(--separator-light)] bg-[var(--surface-primary)] px-4 py-3.5">
                  <span className="text-[13px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Total charge</span>
                  <span className="text-[17px] font-semibold tracking-[-0.022em] text-[var(--label-primary)]">${totalCharge.toFixed(4)}</span>
                </div>

                {/* Agreement */}
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[var(--separator)] text-[var(--accent)] focus:ring-[var(--focus-ring)]" />
                  <span className="text-[13px] font-normal tracking-[-0.01em] text-[var(--label-secondary)]">
                    I confirm the order details and agree to the terms.
                  </span>
                </label>

                <button type="submit" disabled={loading} className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-[13px] font-medium tracking-[-0.01em] text-white transition-colors hover:opacity-95 disabled:opacity-50">
                  {loading ? "Placing order…" : "Submit order"}
                </button>
              </form>
            </div>
          </div>

          {/* Service Details Panel */}
          <div className="lg:min-w-0">
            <div className="card p-5">
              <h3 className="mb-4 text-[13px] font-medium tracking-[-0.01em] text-[var(--label-primary)]">Service details</h3>
              {selectedService ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--label-tertiary)]">Service</p>
                    <p className="mt-1 text-[13px] font-medium tracking-[-0.01em] text-[var(--label-primary)]">{selectedService.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[var(--separator-light)] bg-[var(--surface-secondary)]/50 p-3">
                      <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--label-tertiary)]">Price / 1K</p>
                      <p className="mt-1 text-[13px] font-semibold tracking-[-0.01em] text-[var(--accent)]">${userPrice.toFixed(4)}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--separator-light)] bg-[var(--surface-secondary)]/50 p-3">
                      <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--label-tertiary)]">Min / Max</p>
                      <p className="mt-1 text-[13px] font-medium text-[var(--label-primary)]">{selectedService.min.toLocaleString()} / {selectedService.max.toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedService.desc && (
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--label-tertiary)]">Description</p>
                      <div className="mt-1 max-h-32 overflow-y-auto overflow-x-hidden rounded border border-[var(--separator-light)] bg-[var(--surface-secondary)]/30 px-2.5 py-2">
                        <p className="text-[13px] text-[var(--label-secondary)] leading-relaxed break-words">{selectedService.desc}</p>
                      </div>
                    </div>
                  )}
                  {selectedService.refill === 1 && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:border-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Refill enabled
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="rounded-full bg-[var(--surface-secondary)] p-3.5 mb-2">
                    <svg className="h-5 w-5 text-[var(--label-tertiary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
                  </div>
                  <p className="text-[13px] text-[var(--label-tertiary)]">Select a service to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mass Order Tab */
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <div className="card p-6">
              <h3 className="mb-1.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--label-primary)]">Mass order</h3>
              <p className="mb-4 text-[12px] font-normal tracking-[-0.01em] text-[var(--label-secondary)]">
                One order per line: <code className="rounded bg-[var(--surface-secondary)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--label-primary)]">service_id|quantity|link|speed</code>
              </p>

              {massMessage && (
                <div className={`mb-5 whitespace-pre-wrap text-[13px] ${massMessage.type === "error" ? "alert-error" : "alert-success"}`}>
                  {massMessage.text}
                </div>
              )}

              <form onSubmit={handleMassSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium tracking-[-0.01em] text-[var(--label-secondary)]">Orders</label>
                  <textarea
                    rows={10}
                    value={massOrderText}
                    onChange={(e) => setMassOrderText(e.target.value)}
                    className="input-field-neworder resize-y font-mono text-[12px]"
                    placeholder={"service_id|quantity|link|speed\nservice_id|quantity|link|speed"}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2.5">
                  <input type="checkbox" checked={massAgree} onChange={(e) => setMassAgree(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[var(--separator)] text-[var(--accent)] focus:ring-[var(--focus-ring)]" />
                  <span className="text-[13px] font-normal tracking-[-0.01em] text-[var(--label-secondary)]">
                    I confirm the order details and agree to the terms.
                  </span>
                </label>

                <button type="submit" disabled={massLoading} className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-[13px] font-medium tracking-[-0.01em] text-white transition-colors hover:opacity-95 disabled:opacity-50">
                  {massLoading ? "Placing orders…" : "Place orders"}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="card p-5">
              <h3 className="mb-3 text-[13px] font-medium tracking-[-0.01em] text-[var(--label-primary)]">Note</h3>
              <p className="text-[13px] font-normal tracking-[-0.01em] text-[var(--label-secondary)] leading-relaxed">
                Place multiple orders at once. Check prices and delivery times before submitting. Orders cannot be canceled after submission.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
