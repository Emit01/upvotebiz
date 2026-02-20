"use client";

import { useState, useCallback } from "react";

interface ProfileScanItem {
  id: number;
  username: string;
  category: string;
  whitelist: string;
  blacklist: string;
  no_of_upvotes: number;
  no_of_upvotes2: number;
  rank: string;
  rank2: string;
  speed: number;
  position_time: number;
  service_id: number;
}

const SERVICE_OPTIONS = [
  { value: 2, label: "Post Upvotes" },
  { value: 1, label: "Post Downvotes" },
  { value: 4, label: "Comment Upvotes" },
  { value: 8, label: "Comment Downvotes" },
];

export default function ProfileScannerClient({ initialItems }: { initialItems: ProfileScanItem[] }) {
  const [items, setItems] = useState<ProfileScanItem[]>(initialItems);
  const [msg, setMsg] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [category, setCategory] = useState<"upvotes" | "rank">("upvotes");
  const [position, setPosition] = useState("");
  const [position2, setPosition2] = useState("");
  const [noOfUpvotes, setNoOfUpvotes] = useState("");
  const [noOfUpvotes2, setNoOfUpvotes2] = useState("");
  const [positionTime, setPositionTime] = useState("");
  const [speed, setSpeed] = useState("");
  const [serviceId, setServiceId] = useState(2);
  const [whitelist, setWhitelist] = useState("");
  const [blacklist, setBlacklist] = useState("");

  const [modalWhitelist, setModalWhitelist] = useState<{ id: number; data: any[] } | null>(null);
  const [modalBlacklist, setModalBlacklist] = useState<{ id: number; data: any[] } | null>(null);

  const [buildWhitelistOpen, setBuildWhitelistOpen] = useState(false);
  const [buildBlacklistOpen, setBuildBlacklistOpen] = useState(false);
  const [whitelistRows, setWhitelistRows] = useState<{ category: string; subreddit: string; start: string; end: string; speed: string; position_time: string }[]>([{ category: "upvotes", subreddit: "", start: "", end: "", speed: "", position_time: "" }]);
  const [blacklistRows, setBlacklistRows] = useState<{ subreddit: string }[]>([{ subreddit: "" }]);

  const refetch = useCallback(async () => {
    const res = await fetch("/api/profile-scan");
    const data = await res.json();
    if (data.status === "success" && data.items) setItems(data.items);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          category,
          rank: category === "rank" ? position : "",
          rank2: category === "rank" ? position2 : "",
          no_of_upvotes: category === "upvotes" ? parseInt(noOfUpvotes) || 0 : 0,
          no_of_upvotes2: category === "upvotes" ? parseInt(noOfUpvotes2) || 0 : 0,
          position_time: category === "rank" ? parseInt(positionTime) || 0 : 0,
          whitelist: whitelist || "",
          blacklist: blacklist || "",
          speed: parseFloat(speed) || 10,
          service_id: serviceId,
        }),
      });
      const data = await res.json();
      if (data.status === "error") {
        setMsg(data.message);
      } else {
        setMsg("Data Added Successfully");
        setUsername("");
        setPosition("");
        setPosition2("");
        setNoOfUpvotes("");
        setNoOfUpvotes2("");
        setPositionTime("");
        setSpeed("");
        setWhitelist("");
        setBlacklist("");
        refetch();
      }
    } catch {
      setMsg("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this profile scan?")) return;
    const res = await fetch(`/api/profile-scan?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "success") {
      setMsg("Data Deleted Successfully");
      refetch();
    }
  };

  const showWhitelist = async (id: number) => {
    const res = await fetch("/api/profile-scan/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.status === "success") setModalWhitelist({ id, data: data.data || [] });
  };

  const showBlacklist = async (id: number) => {
    const res = await fetch("/api/profile-scan/blacklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.status === "success") setModalBlacklist({ id, data: data.data || [] });
  };

  const openWhitelistBuilder = () => {
    setBuildWhitelistOpen(true);
    if (whitelist) {
      try {
        const a = JSON.parse(whitelist);
        setWhitelistRows(Array.isArray(a) && a.length
          ? a.map((x: any) => ({
              category: x["Upvotes/Rank"] || "upvotes",
              subreddit: x.Subreddit || "",
              start: String(x.Upvotes1 ?? ""),
              end: String(x.Upvotes2 ?? ""),
              speed: String(x.Speed ?? ""),
              position_time: String(x.Position_time ?? ""),
            }))
          : [{ category: "upvotes", subreddit: "", start: "", end: "", speed: "", position_time: "" }]);
      } catch {
        setWhitelistRows([{ category: "upvotes", subreddit: "", start: "", end: "", speed: "", position_time: "" }]);
      }
    } else {
      setWhitelistRows([{ category: "upvotes", subreddit: "", start: "", end: "", speed: "", position_time: "" }]);
    }
  };

  const openBlacklistBuilder = () => {
    setBuildBlacklistOpen(true);
    if (blacklist) {
      try {
        const a = JSON.parse(blacklist);
        setBlacklistRows(Array.isArray(a) && a.length
          ? a.map((x: any) => ({ subreddit: x.Subreddit ?? "" }))
          : [{ subreddit: "" }]);
      } catch {
        setBlacklistRows([{ subreddit: "" }]);
      }
    } else {
      setBlacklistRows([{ subreddit: "" }]);
    }
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-title-1 text-label-primary tracking-tight">Profile Scanner</h1>
        <p className="mt-1.5 text-body text-label-secondary">Configure profile scans and manage whitelist/blacklist rules for Reddit usernames.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-separator px-6 py-5">
          <h2 className="text-title-3 text-label-primary">New scan</h2>
          <p className="mt-1 text-callout text-label-secondary">Add a new profile scan with upvotes, rank, and list rules.</p>
        </div>
        <div className="p-6">
          {msg && (
            <div className={`mb-5 rounded-xl px-4 py-3 text-callout ${msg.includes("Added") ? "alert-success" : "alert-error"}`}>
              {msg}
            </div>
          )}

          <button
            type="button"
            onClick={() => setInfoOpen(!infoOpen)}
            className="mb-4 rounded-lg border border-separator bg-surface-secondary px-3 py-1.5 text-[13px] font-medium text-label-primary"
          >
            ℹ️ Info
          </button>
          {infoOpen && (
            <div className="mb-5 rounded-xl border border-separator bg-surface-secondary p-4 text-callout text-label-secondary space-y-1">
              <p><strong className="text-label-primary">Profile Scanner</strong></p>
              <p>This feature will scan the profile you provide (Only username, do not input a link as that&apos;ll not work).</p>
              <p><strong className="text-label-primary">Upvotes/Rank</strong> — Set number of upvotes per post or push to a certain position you need.</p>
              <p><strong className="text-label-primary">Start/End</strong> — Can be a range of upvotes/ranks and we will generate a random number between that range for every new order made. If you want a set amount choose the same number for both options.</p>
              <p><strong className="text-label-primary">Speed</strong> — The speed in which you would like the upvotes delivered (per hour).</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Reddit Profile Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter Reddit Username"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-text">Upvotes/Rank</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as "upvotes" | "rank")}
                  className="select-field"
                >
                  <option value="upvotes">Upvotes</option>
                  <option value="rank">Rank</option>
                </select>
              </div>

              {category === "rank" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-text">Position Start (1–10)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-text">Position End (1–10)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={position2}
                        onChange={(e) => setPosition2(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-text">Position Time (Minute) (0–1440)</label>
                    <input
                      type="number"
                      min={0}
                      max={1440}
                      value={positionTime}
                      onChange={(e) => setPositionTime(e.target.value)}
                      className="input-field"
                      placeholder="Position time"
                    />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-text">Number of Upvotes Start (1–1000)</label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={noOfUpvotes}
                      onChange={(e) => setNoOfUpvotes(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-text">Number of Upvotes End (1–1000)</label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={noOfUpvotes2}
                      onChange={(e) => setNoOfUpvotes2(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="label-text">Service ID</label>
              <select value={serviceId} onChange={(e) => setServiceId(parseInt(e.target.value))} className="select-field">
                {SERVICE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text mb-2 block">List of data</label>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary py-2 px-4 text-[13px]" onClick={openWhitelistBuilder}>
                  White List
                </button>
                <button type="button" className="btn-secondary py-2 px-4 text-[13px]" onClick={openBlacklistBuilder}>
                  Black List
                </button>
              </div>
              <input type="hidden" value={whitelist} readOnly />
              <input type="hidden" value={blacklist} readOnly />
            </div>

            {category === "upvotes" && (
              <div>
                <label className="label-text">Speed (Per Hour) (10–900)</label>
                <input
                  type="number"
                  min={10}
                  max={900}
                  required
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="input-field"
                  placeholder="Speed"
                />
              </div>
            )}

            <div className="flex justify-center">
              <button type="submit" disabled={loading} className="btn-primary min-w-[250px]">
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>

        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-separator px-6 py-5">
          <h2 className="text-title-3 text-label-primary">Profile Scan List</h2>
          <p className="mt-1 text-callout text-label-secondary">Existing profile scans. Use White List / Black List to view rules; Delete to remove.</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-separator bg-surface-secondary/50">
                  <th className="table-header">Profile</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">WhiteList</th>
                  <th className="table-header">BlackList</th>
                  <th className="table-header">Position / No. of Upvotes</th>
                  <th className="table-header">Position2 / No. of Upvotes2</th>
                  <th className="table-header">Speed</th>
                  <th className="table-header">Position Time</th>
                  <th className="table-header">Service ID</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-separator/50 hover:bg-surface-secondary/30">
                    <td className="table-cell">{i.username}</td>
                    <td className="table-cell">{i.category}</td>
                    <td className="table-cell">
                      {i.whitelist !== "" && i.whitelist !== "[]" ? (
                        <button type="button" onClick={() => showWhitelist(i.id)} className="text-[13px] font-medium text-[var(--accent)] hover:underline">
                          White List
                        </button>
                      ) : null}
                    </td>
                    <td className="table-cell">
                      {i.blacklist !== "" && i.blacklist !== "[]" ? (
                        <button type="button" onClick={() => showBlacklist(i.id)} className="text-[13px] font-medium text-[var(--accent)] hover:underline">
                          Black List
                        </button>
                      ) : null}
                    </td>
                    <td className="table-cell">{i.no_of_upvotes !== 0 ? i.no_of_upvotes : i.rank}</td>
                    <td className="table-cell">{i.no_of_upvotes2 !== 0 ? i.no_of_upvotes2 : i.rank2}</td>
                    <td className="table-cell">{i.speed}</td>
                    <td className="table-cell">{i.position_time}</td>
                    <td className="table-cell">{i.service_id}</td>
                    <td className="table-cell">
                      <button
                        type="button"
                        onClick={() => handleDelete(i.id)}
                        className="text-[13px] font-medium text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <p className="py-8 text-center text-callout text-label-tertiary">No profile scans yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Build Whitelist modal */}
      {buildWhitelistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setBuildWhitelistOpen(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-separator bg-surface-primary shadow-float flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-separator">
              <h5 className="text-headline text-label-primary">Whitelist data</h5>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {whitelistRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-3 rounded-xl border border-separator p-4">
                  <div>
                    <label className="label-text">Upvotes/Rank</label>
                    <select value={row.category} onChange={(e) => setWhitelistRows((r) => r.map((x, i) => i === idx ? { ...x, category: e.target.value } : x))} className="select-field">
                      <option value="upvotes">Upvotes</option>
                      <option value="rank">Rank</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Subreddit</label>
                    <input type="text" value={row.subreddit} onChange={(e) => setWhitelistRows((r) => r.map((x, i) => i === idx ? { ...x, subreddit: e.target.value } : x))} className="input-field" placeholder="Subreddit" />
                  </div>
                  <div>
                    <label className="label-text">Start</label>
                    <input type="number" min={1} max={1000} value={row.start} onChange={(e) => setWhitelistRows((r) => r.map((x, i) => i === idx ? { ...x, start: e.target.value } : x))} className="input-field" />
                  </div>
                  <div>
                    <label className="label-text">End</label>
                    <input type="number" min={1} max={1000} value={row.end} onChange={(e) => setWhitelistRows((r) => r.map((x, i) => i === idx ? { ...x, end: e.target.value } : x))} className="input-field" />
                  </div>
                  <div>
                    <label className="label-text">Speed (10–900)</label>
                    <input type="number" min={10} max={900} value={row.speed} onChange={(e) => setWhitelistRows((r) => r.map((x, i) => i === idx ? { ...x, speed: e.target.value } : x))} className="input-field" />
                  </div>
                  <div>
                    <label className="label-text">Position Time (0–1440)</label>
                    <input type="number" min={0} max={1440} value={row.position_time} onChange={(e) => setWhitelistRows((r) => r.map((x, i) => i === idx ? { ...x, position_time: e.target.value } : x))} className="input-field" />
                  </div>
                  {whitelistRows.length > 1 && (
                    <div className="col-span-2">
                      <button type="button" onClick={() => setWhitelistRows((r) => r.filter((_, i) => i !== idx))} className="text-[13px] text-red-500 hover:text-red-600">Remove</button>
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setWhitelistRows((r) => [...r, { category: "upvotes", subreddit: "", start: "", end: "", speed: "", position_time: "" }])} className="btn-secondary">
                Add more
              </button>
            </div>
            <div className="px-6 py-4 border-t border-separator flex justify-end gap-2">
              <button type="button" onClick={() => setBuildWhitelistOpen(false)} className="btn-secondary">Close</button>
              <button type="button" onClick={() => { const arr = whitelistRows.map((r) => ({ "Upvotes/Rank": r.category, "Subreddit": r.subreddit, "Upvotes1": r.start, "Upvotes2": r.end, "Speed": r.speed, "Position_time": r.position_time })); setWhitelist(JSON.stringify(arr)); setBuildWhitelistOpen(false); }} className="btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Build Blacklist modal */}
      {buildBlacklistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setBuildBlacklistOpen(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border border-separator bg-surface-primary shadow-float flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-separator">
              <h5 className="text-headline text-label-primary">Blacklist data</h5>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {blacklistRows.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="label-text">Subreddit</label>
                    <input type="text" value={row.subreddit} onChange={(e) => setBlacklistRows((r) => r.map((x, i) => i === idx ? { ...x, subreddit: e.target.value } : x))} className="input-field" placeholder="Subreddit" />
                  </div>
                  {blacklistRows.length > 1 && (
                    <button type="button" onClick={() => setBlacklistRows((r) => r.filter((_, i) => i !== idx))} className="text-[13px] text-red-500 hover:text-red-600 pb-2">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setBlacklistRows((r) => [...r, { subreddit: "" }])} className="btn-secondary">
                Add more
              </button>
            </div>
            <div className="px-6 py-4 border-t border-separator flex justify-end gap-2">
              <button type="button" onClick={() => setBuildBlacklistOpen(false)} className="btn-secondary">Close</button>
              <button type="button" onClick={() => { const arr = blacklistRows.map((r) => ({ "Subreddit": r.subreddit })); setBlacklist(JSON.stringify(arr)); setBuildBlacklistOpen(false); }} className="btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Whitelist modal */}
      {modalWhitelist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModalWhitelist(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-separator bg-surface-primary p-6 shadow-float" onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-4 text-headline text-label-primary">Whitelist data</h5>
            <div className="max-h-80 overflow-y-auto space-y-3">
              {Array.isArray(modalWhitelist.data) && modalWhitelist.data.length > 0 ? (
                modalWhitelist.data.map((item: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-separator p-3 text-callout text-label-secondary">
                    {typeof item === "object" && item !== null ? (
                      <ul className="space-y-1">
                        {Object.entries(item).map(([k, v]) => (
                          <li key={k}><strong className="text-label-primary">{k}:</strong> {String(v)}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{String(item)}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-label-tertiary">No data</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setModalWhitelist(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist modal */}
      {modalBlacklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModalBlacklist(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-separator bg-surface-primary p-6 shadow-float" onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-4 text-headline text-label-primary">Blacklist data</h5>
            <div className="max-h-80 overflow-y-auto space-y-3">
              {Array.isArray(modalBlacklist.data) && modalBlacklist.data.length > 0 ? (
                modalBlacklist.data.map((item: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-separator p-3 text-callout text-label-secondary">
                    {typeof item === "object" && item !== null ? (
                      <ul className="space-y-1">
                        {Object.entries(item).map(([k, v]) => (
                          <li key={k}><strong className="text-label-primary">{k}:</strong> {String(v)}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{String(item)}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-label-tertiary">No data</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setModalBlacklist(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
