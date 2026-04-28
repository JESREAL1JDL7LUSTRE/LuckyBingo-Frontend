"use client";

interface QuickPlayBannerProps {
  loading: boolean;
  onQuickPlay: () => void;
}

export default function QuickPlayBanner({ loading, onQuickPlay }: QuickPlayBannerProps) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-black shadow shadow-orange-200 shrink-0">
            ↯
          </div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">Quick Play</div>
            <div className="text-xs text-stone-400 mt-0.5">
              Instantly drop into a random public room.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onQuickPlay}
          disabled={loading}
          className="rounded-xl border border-orange-200 bg-white px-6 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
        >
          {loading ? "Joining…" : "Find a room →"}
        </button>
      </div>
    </div>
  );
}