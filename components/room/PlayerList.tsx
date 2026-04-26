import type { PlayerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PlayerListProps = {
  players: PlayerSummary[];
  currentPlayerId?: string;
};

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
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

          return (
          <div
            key={player.player_id}
            className={`rounded-xl border px-4 py-3 ${style.container}`}
          >
            <div className="font-medium">{player.player_name}</div>
            <div className={`text-sm ${style.meta}`}>
              {player.is_host ? "Host" : "Player"} · {player.connected ? "Connected" : "Disconnected"}
            </div>
          </div>
          );
        })}
      </CardContent>
    </Card>
  );
}