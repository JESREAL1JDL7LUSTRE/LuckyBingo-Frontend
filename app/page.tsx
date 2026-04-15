"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createRoom, joinRoom } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  const [hostName, setHostName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateRoom(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCreateLoading(true);

    try {
      const data = await createRoom(hostName.trim());

      localStorage.setItem("player_id", data.player_id);
      localStorage.setItem("room_code", data.room_code);
      localStorage.setItem("player_name", hostName.trim());
      localStorage.setItem("player_card", JSON.stringify(data.card));

      router.push(`/room/${data.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoinRoom(e: FormEvent) {
    e.preventDefault();
    setError("");
    setJoinLoading(true);

    try {
      const data = await joinRoom(joinCode.trim().toUpperCase(), joinName.trim());

      localStorage.setItem("player_id", data.player_id);
      localStorage.setItem("room_code", data.room_code);
      localStorage.setItem("player_name", joinName.trim());
      localStorage.setItem("player_card", JSON.stringify(data.card));

      router.push(`/room/${data.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-5xl font-bold">LuckyBingo</h1>
        <p className="mb-10 text-lg text-white/70">
          Create a room, invite players, and play in real time.
        </p>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <form
            onSubmit={handleCreateRoom}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="mb-4 text-2xl font-semibold">Create Room</h2>

            <label className="mb-2 block text-sm text-white/70">Host name</label>
            <input
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Enter host name"
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              required
            />

            <button
              type="submit"
              disabled={createLoading}
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-60"
            >
              {createLoading ? "Creating..." : "Create Room"}
            </button>
          </form>

          <form
            onSubmit={handleJoinRoom}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="mb-4 text-2xl font-semibold">Join Room</h2>

            <label className="mb-2 block text-sm text-white/70">Player name</label>
            <input
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Enter your name"
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              required
            />

            <label className="mb-2 block text-sm text-white/70">Room code</label>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 uppercase outline-none"
              required
            />

            <button
              type="submit"
              disabled={joinLoading}
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-60"
            >
              {joinLoading ? "Joining..." : "Join Room"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}