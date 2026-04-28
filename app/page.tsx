"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import HomeHero from "@/components/home/HomeHero";
import NameSetupCard from "@/components/home/NameSetupCard";
import PlayerBanner from "@/components/home/PlayerBanner";
import CreateRoomForm from "@/components/home/CreateRoomForm";
import JoinRoomForm from "@/components/home/JoinRoomForm";
import QuickPlayBanner from "@/components/home/QuickPlayBanner";

import { createRoom, getPublicRooms, joinRoom, reEnterRoom } from "@/lib/api";

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
    if (!normalizedName) { setError("Name is required"); return; }
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
      if (!playerId || !name) throw new Error("Player identity not initialized");
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
      if (!playerId || !name) throw new Error("Player identity not initialized");
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
      if (rooms.length === 0) { setError("No active public lobbies right now."); return; }
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      await handleJoinRoom(randomRoom.room_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to quick play");
    }
  }

  async function handleReEnter() {
    setError("");
    setReEnterLoading(true);
    try {
      const playerId = localStorage.getItem("player_id") || "";
      const roomCode = localStorage.getItem("room_code") || "";
      if (!playerId || !roomCode) throw new Error("No previous session found");
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
    <main className="min-h-screen bg-[#FAF8F5] px-5 pb-16">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 fixed top-0 left-0 z-50" />

      {/* Nav */}
      <nav className="flex items-center justify-between pt-6 pb-2 max-w-2xl mx-auto">
        <span className="font-display font-black text-lg text-stone-900 tracking-tight">
          Bingo<span className="text-orange-500">.</span>
        </span>
        <span className="text-xs text-stone-400 font-medium">
          Real-time · Multiplayer
        </span>
      </nav>

      <div className="mx-auto max-w-2xl space-y-4">
        <HomeHero />

        {/* NAME SETUP */}
        {identityReady && !playerName && (
          <NameSetupCard
            draftName={draftName}
            onChange={setDraftName}
            onSubmit={handleSaveName}
          />
        )}

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-5.75a.75.75 0 001.5 0V8a.75.75 0 00-1.5 0v4.25zm.75 2.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* MAIN CONTENT */}
        {playerName && (
          <>
            <PlayerBanner
              playerName={playerName}
              hasPreviousRoom={hasPreviousRoom}
              reEnterLoading={reEnterLoading}
              onReEnter={handleReEnter}
              onReset={handleClearLocalStorage}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <CreateRoomForm onSubmit={handleCreateRoom} loading={createLoading} />
              <JoinRoomForm onSubmit={handleJoinRoom} loading={joinLoading} />
            </div>

            <QuickPlayBanner loading={joinLoading} onQuickPlay={handleQuickPlay} />
          </>
        )}

        <p className="text-center text-xs text-stone-300 pt-6">
          LuckyBingo · Built for classrooms, events &amp; parties
        </p>
      </div>
    </main>
  );
}