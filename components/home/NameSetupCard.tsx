"use client";

import { FormEvent } from "react";

interface NameSetupCardProps {
  draftName: string;
  onChange: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function NameSetupCard({
  draftName,
  onChange,
  onSubmit,
}: NameSetupCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
        Before you start
      </p>
      <h2 className="font-display text-xl font-bold text-stone-900 mb-4">
        What should we call you?
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={draftName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your name"
          required
          className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 focus:bg-white"
        />
        <button
          type="submit"
          className="rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 active:scale-95 transition-all"
        >
          Continue →
        </button>
      </form>
    </div>
  );
}