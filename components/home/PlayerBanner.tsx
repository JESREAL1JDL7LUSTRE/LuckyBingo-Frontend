"use client";

interface PlayerBannerProps {
  playerName: string;
  hasPreviousRoom: boolean;
  reEnterLoading: boolean;
  onReEnter: () => void;
  onReset: () => void;
}

export default function PlayerBanner({
  playerName,
  hasPreviousRoom,
  reEnterLoading,
  onReEnter,
  onReset,
}: PlayerBannerProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-sm px-5 py-3.5">
      {/* Avatar + name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-900 font-black text-sm shadow-md shrink-0">
          {playerName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-slate-400">
          Playing as{" "}
          <span className="font-bold text-white">{playerName}</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {hasPreviousRoom && (
          <button
            onClick={onReEnter}
            disabled={reEnterLoading}
            className="rounded-xl border border-indigo-500/50 bg-indigo-500/15 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {reEnterLoading ? "Re-entering…" : "↩ Re-enter Last Room"}
          </button>
        )}
        <button
          onClick={onReset}
          className="rounded-xl border border-white/10 bg-slate-700/40 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:border-white/20 active:scale-95 transition-all"
        >
          Change Name
        </button>
      </div>
    </div>
  );
}