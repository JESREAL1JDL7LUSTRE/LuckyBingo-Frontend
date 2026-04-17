"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HomeHero from "@/components/home/HomeHero";
import CreateRoomForm from "@/components/home/CreateRoomForm";
import JoinRoomForm from "@/components/home/JoinRoomForm";
import { createRoom, joinRoom } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  async function handleCreateRoom(hostName: string) {
    setError("");
    setCreateLoading(true);

    try {
      const data = await createRoom(hostName);

      localStorage.setItem("player_id", data.player_id);
      localStorage.setItem("room_code", data.room_code);
      localStorage.setItem("player_name", hostName);
      localStorage.setItem("player_card", JSON.stringify(data.card));

      router.push(`/room/${data.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoinRoom(playerName: string, roomCode: string) {
    setError("");
    setJoinLoading(true);

    try {
      const data = await joinRoom(roomCode, playerName);

      localStorage.setItem("player_id", data.player_id);
      localStorage.setItem("room_code", data.room_code);
      localStorage.setItem("player_name", playerName);
      localStorage.setItem("player_card", JSON.stringify(data.card));

      router.push(`/room/${data.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <HomeHero />

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <CreateRoomForm onSubmit={handleCreateRoom} loading={createLoading} />
          <JoinRoomForm onSubmit={handleJoinRoom} loading={joinLoading} />
        </div>
      </div>
    </main>
  );
}