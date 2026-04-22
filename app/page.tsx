"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import HomeHero from "@/components/home/HomeHero";
import CreateRoomForm from "@/components/home/CreateRoomForm";
import JoinRoomForm from "@/components/home/JoinRoomForm";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  createRoom,
  getPublicRooms,
  joinRoom,
  reEnterRoom,
} from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  const [playerName, setPlayerName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [identityReady, setIdentityReady] = useState(false);
  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [reEnterLoading, setReEnterLoading] = useState(false);

  const [hasPreviousRoom, setHasPreviousRoom] = useState(false);

  useEffect(() => {
    let playerId = localStorage.getItem("player_id");
    const storedName = localStorage.getItem("player_name") || "";
    const storedRoom = localStorage.getItem("room_code");

    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem("player_id", playerId);
    }

    setPlayerName(storedName);
    setDraftName(storedName);
    setHasPreviousRoom(!!storedRoom);
    setIdentityReady(true);
  }, []);

  function handleSaveName(e: FormEvent) {
    e.preventDefault();

    const normalizedName = draftName.trim();

    if (!normalizedName) {
      setError("Name is required");
      return;
    }

    localStorage.setItem("player_name", normalizedName);
    setPlayerName(normalizedName);
    setError("");
  }

  function handleClearLocalStorage() {
    localStorage.clear();
    localStorage.setItem("player_id", crypto.randomUUID());

    setPlayerName("");
    setDraftName("");
    setError("");
    setHasPreviousRoom(false);
    setIdentityReady(true);
  }

  async function handleCreateRoom(visibility: "public" | "private") {
    setError("");
    setCreateLoading(true);

    try {
      const playerId = localStorage.getItem("player_id") || "";
      const name = localStorage.getItem("player_name") || "";

      if (!playerId || !name) {
        throw new Error("Player identity not initialized");
      }

      const data = await createRoom(name, playerId, visibility);

      localStorage.setItem("player_id", data.player_id);
      localStorage.setItem("room_code", data.room_code);
      localStorage.setItem("player_card", JSON.stringify(data.card));

      router.push(`/room/${data.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoinRoom(roomCode: string) {
    setError("");
    setJoinLoading(true);

    try {
      const playerId = localStorage.getItem("player_id") || "";
      const name = localStorage.getItem("player_name") || "";

      if (!playerId || !name) {
        throw new Error("Player identity not initialized");
      }

      const data = await joinRoom(roomCode, playerId, name);

      localStorage.setItem("player_id", data.player_id);
      localStorage.setItem("room_code", data.room_code);
      localStorage.setItem("player_card", JSON.stringify(data.card));

      router.push(`/room/${data.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleQuickPlay() {
    setError("");

    try {
      const rooms = await getPublicRooms();

      if (rooms.length === 0) {
        setError("No active public lobbies available.");
        return;
      }

      const randomIndex = Math.floor(Math.random() * rooms.length);
      const randomRoom = rooms[randomIndex];
      await handleJoinRoom(randomRoom.room_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to quick play");
    }
  }

  /* ✅ NEW: RE-ENTER FUNCTION */
  async function handleReEnter() {
    setError("");
    setReEnterLoading(true);

    try {
      const playerId = localStorage.getItem("player_id") || "";
      const roomCode = localStorage.getItem("room_code") || "";

      if (!playerId || !roomCode) {
        throw new Error("No previous session found");
      }

      const data = await reEnterRoom(roomCode, playerId);

      localStorage.setItem("player_card", JSON.stringify(data.card));

      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to re-enter room");
    } finally {
      setReEnterLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <HomeHero />

        {/* NAME SETUP */}
        {identityReady && !playerName ? (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Set Your Name</CardTitle>
              <CardDescription>
                Enter your name once. This browser will reuse it automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSaveName}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
                <Button type="submit">Continue</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {/* ERROR */}
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {/* MAIN CONTENT */}
        {playerName ? (
          <>
            <div className="flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div>
                Playing as{" "}
                <span className="font-semibold text-foreground">
                  {playerName}
                </span>
              </div>

              <div className="flex gap-2">
                {/* ✅ RE-ENTER BUTTON */}
                {hasPreviousRoom && (
                  <Button
                    variant="secondary"
                    onClick={handleReEnter}
                    disabled={reEnterLoading}
                  >
                    {reEnterLoading
                      ? "Re-entering..."
                      : "Re-enter Last Room"}
                  </Button>
                )}

                <Button variant="outline" onClick={handleClearLocalStorage}>
                  Change Name / Reset Identity
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <CreateRoomForm
                onSubmit={handleCreateRoom}
                loading={createLoading}
              />
              <JoinRoomForm
                onSubmit={handleJoinRoom}
                loading={joinLoading}
              />
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">Quick Play</div>
                  <div className="text-sm text-muted-foreground">
                    Instantly join a random active public room.
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleQuickPlay}
                  disabled={joinLoading}
                >
                  {joinLoading ? "Joining..." : "Quick Play"}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}