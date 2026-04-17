import type { PlayerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PlayerListProps = {
  players: PlayerSummary[];
};

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {players.map((player) => (
          <div key={player.player_id} className="rounded-xl border bg-muted/50 px-4 py-3">
            <div className="font-medium">{player.player_name}</div>
            <div className="text-sm text-muted-foreground">
              {player.is_host ? "Host" : "Player"}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}