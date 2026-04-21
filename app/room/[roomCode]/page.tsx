"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { callNumber, claimBingo, getRoom, getRoomWebSocketUrl } from "@/lib/api";
import type { BingoCell, RoomSnapshot } from "@/lib/types";
import RoomHeader from "@/components/room/RoomHeader";
import BingoCard from "@/components/room/BingoCard";
import PlayerList from "@/components/room/PlayerList";
import CalledNumbers from "@/components/room/CalledNumbers";

export default function RoomPage() {
  const params = useParams();
  const roomCode = String(params.roomCode || "").toUpperCase();

  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [card, setCard] = useState<BingoCell[][]>([]);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [markedCells, setMarkedCells] = useState<string[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    async function init() {
      const storedPlayerId = localStorage.getItem("player_id") || "";
      const storedPlayerName = localStorage.getItem("player_name") || "";
      const storedCard = localStorage.getItem("player_card");

      setPlayerId(storedPlayerId);
      setPlayerName(storedPlayerName);

      if (!storedPlayerId || !storedPlayerName) {
        setError("Missing player identity. Return to home and set your name.");
      }

      if (storedCard) {
        try {
          const parsedCard = JSON.parse(storedCard) as BingoCell[][];
          setCard(parsedCard);

          const hasFreeCenter = parsedCard?.[2]?.[2] === "FREE";
          setMarkedCells(hasFreeCenter ? ["2-2"] : []);
        } catch {
          setCard([]);
          setMarkedCells([]);
        }
      }

      try {
        const snapshot = await getRoom(roomCode);
        setRoom(snapshot);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load room");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode || !playerId || !playerName) return;

    const ws = new WebSocket(getRoomWebSocketUrl(roomCode, playerId, playerName));

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
  }, [roomCode, playerId, playerName]);

  const isHost = useMemo(() => {
    if (!room || !playerId) return false;
    return room.host_id === playerId;
  }, [room, playerId]);

  function handleCellClick(row: number, col: number, value: BingoCell) {
    if (!room) return;

    const key = `${row}-${col}`;

    if (value === "FREE") return;

    const numericValue = Number(value);
    if (!room.called_numbers.includes(numericValue)) return;

    setMarkedCells((prev) =>
      prev.includes(key)
        ? prev.filter((cellKey) => cellKey !== key)
        : [...prev, key]
    );
  }

  async function handleCallNumber() {
    if (!playerId) return;

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
    if (!playerId) return;

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

        <CalledNumbers numbers={room.called_numbers} />

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <BingoCard
            card={card}
            calledNumbers={room.called_numbers}
            markedCells={markedCells}
            onCellClick={handleCellClick}
          />
          <PlayerList players={room.players} />
        </div>
      </div>
    </main>
  );
}