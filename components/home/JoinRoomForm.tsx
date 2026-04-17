"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type JoinRoomFormProps = {
  onSubmit: (playerName: string, roomCode: string) => Promise<void>;
  loading?: boolean;
};

export default function JoinRoomForm({
  onSubmit,
  loading = false,
}: JoinRoomFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(playerName.trim(), roomCode.trim().toUpperCase());
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Join Room</CardTitle>
        <CardDescription>Enter your name and room code to join.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Player name</label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Room code</label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}