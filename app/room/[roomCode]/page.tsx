"use client";

import { useEffect, useMemo, useState } from "react";
import { callNumber, claimBingo, getRoom, getRoomWebSocketUrl } from "@/lib/api";
import type { BingoCell, RoomSnapshot } from "@/lib/types";
import RoomHeader from "@/components/room/RoomHeader";
import BingoCard from "@/components/room/BingoCard";
import PlayerList from "@/components/room/PlayerList";
import CalledNumbers from "@/components/room/CalledNumbers";

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

    return () => ws.close();
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
      alert(data.is_valid ? "Bingo claim is valid!" : "Invalid bingo claim.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim bingo");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <p>Loading room...</p>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error || "Room not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <RoomHeader
          room={room}
          isHost={isHost}
          actionLoading={actionLoading}
          onCallNumber={handleCallNumber}
          onClaimBingo={handleClaimBingo}
        />

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <BingoCard card={card} />
          <div className="space-y-6">
            <PlayerList players={room.players} />
            <CalledNumbers numbers={room.called_numbers} />
          </div>
        </div>
      </div>
    </main>
  );
}