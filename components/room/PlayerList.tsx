"use client";

import { useState } from "react";
import type { PlayerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PlayerListProps = {
  players: PlayerSummary[];
  currentPlayerId?: string;
  activeQuickChats?: Record<string, string>;
  onSendQuickChat?: (message: string) => Promise<void> | void;
};

const QUICK_CHAT_OPTIONS = [
  "Good luck!",
  "I am close to bingo!",
  "This is getting intense!",
  "GG!",
];

export default function PlayerList({
  players,
  currentPlayerId,
  activeQuickChats = {},
  onSendQuickChat,
}: PlayerListProps) {
  const [showQuickChatMenu, setShowQuickChatMenu] = useState(false);
  const [customQuickChat, setCustomQuickChat] = useState("");

  function sendQuickChat(message: string) {
    const normalized = message.trim();
    if (!normalized) return;
    onSendQuickChat?.(normalized.slice(0, 80));
    setShowQuickChatMenu(false);
    setCustomQuickChat("");
  }

  function getPlayerStyle(player: PlayerSummary) {
    if (player.player_id === currentPlayerId) {
      return {
        container: "border-emerald-300 bg-emerald-100/70",
        meta: "text-emerald-900",
      };
    }

    if (player.is_host) {
      return {
        container: "border-amber-300 bg-amber-100/70",
        meta: "text-amber-900",
      };
    }

    return {
      container: "border-rose-300 bg-rose-100/70",
      meta: "text-rose-900",
    };
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {players.map((player) => {
          const style = getPlayerStyle(player);
          const isCurrentPlayer = player.player_id === currentPlayerId;
          const quickChat = activeQuickChats[player.player_id];

          return (
            <div
              key={player.player_id}
              className={`rounded-xl border px-4 py-3 ${style.container}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{player.player_name}</div>
                  <div className={`text-sm ${style.meta}`}>
                    {player.is_host ? "Host" : "Player"} · {player.connected ? "Connected" : "Disconnected"}
                  </div>
                  {quickChat ? (
                    <div className="mt-1 inline-block rounded-md border border-current/20 bg-white/65 px-2 py-1 text-xs font-medium">
                      {quickChat}
                    </div>
                  ) : null}
                </div>

                {isCurrentPlayer ? (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowQuickChatMenu((prev) => !prev)}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-current/25 bg-white/65 text-base font-semibold leading-none hover:bg-white/85"
                      aria-label="Open quick chat"
                    >
                      ...
                    </button>
                    {showQuickChatMenu ? (
                      <div className="absolute right-0 top-14 z-20 min-w-52 rounded-lg border bg-background p-2 shadow-lg">
                        <div className="mb-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={customQuickChat}
                            onChange={(event) => setCustomQuickChat(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                sendQuickChat(customQuickChat);
                              }
                            }}
                            placeholder="Type quick chat"
                            maxLength={80}
                            className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <button
                            type="button"
                            onClick={() => sendQuickChat(customQuickChat)}
                            className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-muted"
                          >
                            Send
                          </button>
                        </div>
                        {QUICK_CHAT_OPTIONS.map((message) => (
                          <button
                            key={message}
                            type="button"
                            className="block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                            onClick={() => {
                              sendQuickChat(message);
                            }}
                          >
                            {message}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}