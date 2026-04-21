"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type JoinRoomFormProps = {
  onSubmit: (roomCode: string) => Promise<void>;
  loading?: boolean;
};

export default function JoinRoomForm({
  onSubmit,
  loading = false,
}: JoinRoomFormProps) {
  const [roomCode, setRoomCode] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(roomCode.trim().toUpperCase());
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Join Room</CardTitle>
        <CardDescription>Enter room code to join.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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