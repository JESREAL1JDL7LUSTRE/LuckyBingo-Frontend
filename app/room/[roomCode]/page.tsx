"use client";

import { useEffect, useMemo, useState } from "react";
import { callNumber, claimBingo, getRoom, getRoomWebSocketUrl } from "@/lib/api";
import type { BingoCell, RoomSnapshot } from "@/lib/types";

type RoomPageProps = {
  params: Promise<{ roomCode: string }>;
};

export default function RoomPage({ params }: RoomPageProps) {
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [card, setCard] = useState<BingoCell[][]>([]);
  const [playerId, setPlayerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      const code = resolvedParams.roomCode.toUpperCase();
      setRoomCode(code);

      const storedPlayerId = localStorage.getItem("player_id") || "";
      const storedCard = localStorage.getItem("player_card");

      setPlayerId(storedPlayerId);

      if (storedCard) {
        try {
          setCard(JSON.parse(storedCard));
        } catch {}
      }

      try {
        const snapshot = await getRoom(code);
        setRoom(snapshot);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load room");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [params]);

  useEffect(() => {
    if (!roomCode) return;

    const ws = new WebSocket(getRoomWebSocketUrl(roomCode));

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.room) {
          setRoom(data.room);
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, [roomCode]);

  const isHost = useMemo(() => {
    if (!room || !playerId) return false;
    return room.host_id === playerId;
  }, [room, playerId]);

  async function handleCallNumber() {
    if (!roomCode || !playerId) return;

    setActionLoading(true);
    setError("");

    try {
      const data = await callNumber(roomCode, playerId);
      setRoom(data.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to call number");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClaimBingo() {
    if (!roomCode || !playerId) return;

    setActionLoading(true);
    setError("");

    try {
      const data = await claimBingo(roomCode, playerId);
      setRoom(data.room);

      if (data.is_valid) {
        alert("Bingo claim is valid!");
      } else {
        alert("Invalid bingo claim.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim bingo");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 p-6 text-white">
        Loading room...
      </main>
    );
  }

  if (error && !room) {
    return (
      <main className="min-h-screen bg-neutral-950 p-6 text-white">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Room {room?.room_code}</h1>
            <p className="mt-1 text-white/70">Status: {room?.status}</p>
            <p className="text-white/70">
              Current number: {room?.current_number ?? "None yet"}
            </p>
          </div>

          <div className="flex gap-3">
            {isHost ? (
              <button
                onClick={handleCallNumber}
                disabled={actionLoading || room?.status === "finished"}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-60"
              >
                Call Number
              </button>
            ) : null}

            <button
              onClick={handleClaimBingo}
              disabled={actionLoading || room?.status === "finished"}
              className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              Claim Bingo
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Your Bingo Card</h2>

            <div className="grid grid-cols-5 gap-2">
              {card.flat().map((cell, index) => (
                <div
                  key={index}
                  className="flex aspect-square items-center justify-center rounded-xl border border-white/10 bg-black/30 text-lg font-semibold"
                >
                  {cell}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-2xl font-semibold">Players</h2>
              <div className="space-y-3">
                {room?.players.map((player) => (
                  <div
                    key={player.player_id}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="font-medium">{player.player_name}</div>
                    <div className="text-sm text-white/60">
                      {player.is_host ? "Host" : "Player"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-2xl font-semibold">Called Numbers</h2>
              <div className="flex flex-wrap gap-2">
                {room?.called_numbers.length ? (
                  room.called_numbers.map((num) => (
                    <span
                      key={num}
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm"
                    >
                      {num}
                    </span>
                  ))
                ) : (
                  <span className="text-white/60">No numbers called yet.</span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}