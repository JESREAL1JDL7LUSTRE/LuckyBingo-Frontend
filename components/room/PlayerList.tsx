"use client";

import type { PlayerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuickChatMenu from "@/components/room/QuickChatMenu";

type PlayerListProps = {
  players: PlayerSummary[];
  currentPlayerId?: string;
  activeQuickChats?: Record<string, string>;
  onSendQuickChat?: (message: string) => Promise<void> | void;
};

export default function PlayerList({
  players,
  currentPlayerId,
  activeQuickChats = {},
  onSendQuickChat,
}: PlayerListProps) {
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
    <Card className="rounded-2xl overflow-visible">
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
                  <div className="truncate text-sm font-semibold">
                    {player.player_name}
                  </div>
                  <div className={`text-xs ${style.meta}`}>
                    {player.is_host ? "Host" : "Player"} · {player.connected ? "Connected" : "Disconnected"}
                  </div>
                  {quickChat ? (
                    <div className="mt-1 inline-block rounded-md border border-current/20 bg-white/65 px-2 py-1 text-xs font-medium">
                      {quickChat}
                    </div>
                  ) : null}
                </div>

                {isCurrentPlayer ? (
                  <QuickChatMenu onSendQuickChat={onSendQuickChat} />
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}