"use client";

import { ToggleLeft, ToggleRight, Star } from "lucide-react";

interface Language {
  id: number; ids: string; code: string; country_code: string; is_default: number; status: number;
}

export default function AdminLanguagesClient({ languages }: { languages: Language[] }) {
  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "Code", "Country", "Default", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {languages.map((l) => (
                <tr key={l.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{l.id}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary uppercase">{l.code}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary uppercase">{l.country_code}</td>
                  <td className="px-4 py-3">
                    {l.is_default === 1 ? <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> : <span className="text-[12px] text-label-tertiary">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {l.status === 1 ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-label-tertiary" />}
                  </td>
                </tr>
              ))}
              {languages.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No languages configured</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
