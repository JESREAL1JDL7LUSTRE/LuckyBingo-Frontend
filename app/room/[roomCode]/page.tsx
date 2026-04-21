"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WinnerModal from "@/components/modals/WinnerModal";
import SessionEndedModal from "@/components/modals/SessionEndedModal";
import InvalidBingoModal from "@/components/modals/InvalidBingoModal";

import {
  callNumber,
  claimBingo,
  getRoom,
  getRoomWebSocketUrl,
  endSession,
  leaveRoom,
} from "@/lib/api";

import type { BingoCell, RoomSnapshot } from "@/lib/types";

import RoomHeader from "@/components/room/RoomHeader";
import BingoCard from "@/components/room/BingoCard";
import PlayerList from "@/components/room/PlayerList";
import CalledNumbers from "@/components/room/CalledNumbers";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();

  const roomCode = String(params.roomCode || "").toUpperCase();
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const [showInvalidBingoModal, setShowInvalidBingoModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);

  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [card, setCard] = useState<BingoCell[][]>([]);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [markedCells, setMarkedCells] = useState<string[]>([]);

  useEffect(() => {
    const pid = localStorage.getItem("player_id") || "";
    const pname = localStorage.getItem("player_name") || "";
    const storedCard = localStorage.getItem("player_card");

    setPlayerId(pid);
    setPlayerName(pname);

    if (storedCard) {
      const parsed = JSON.parse(storedCard);
      setCard(parsed);
    }

    getRoom(roomCode).then(setRoom);
  }, [roomCode]);

  /* WEBSOCKET */
  useEffect(() => {
    if (!roomCode || !playerId) return;

    const ws = new WebSocket(
      getRoomWebSocketUrl(roomCode, playerId, playerName)
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.room) {
          setRoom(data.room);
        }

        if (data.type === "bingo_won") {
          setWinnerName(data.winner_name);
          setShowWinnerModal(true);
        }

        if (data.type === "session_ended") {
          setShowSessionEndedModal(true);
        }

      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => ws.close();
  }, [roomCode, playerId]);

  const isHost = useMemo(() => {
    return room?.host_id === playerId;
  }, [room, playerId]);

  /* ACTIONS */

  async function handleCallNumber() {
    const res = await callNumber(roomCode, playerId);
    setRoom(res.room);
  }

  async function handleClaimBingo() {
  if (actionLoading) return;

  setActionLoading(true);
  try {
    const res = await claimBingo(roomCode, playerId);
    if (!res.is_valid) {
      setShowInvalidBingoModal(true);
    }
  } finally {
    setActionLoading(false);
  }
}

  async function handleEndSession() {
    await endSession(roomCode, playerId);
  }

  async function handleLeave() {
    await leaveRoom(roomCode, playerId);
    localStorage.removeItem("room_code");
    router.push("/");
  }

  if (!room) return <p>Loading...</p>;

  return (
    <main className="p-6 space-y-6">
      <RoomHeader
        room={room}
        isHost={isHost}
        actionLoading={false}
        onCallNumber={handleCallNumber}
        onClaimBingo={handleClaimBingo}
        onLeave={handleLeave}
        onEndSession={handleEndSession}
      />

      <CalledNumbers numbers={room.called_numbers} />

      <div className="grid grid-cols-2 gap-6">
        <BingoCard
          card={card}
          calledNumbers={room.called_numbers}
          markedCells={markedCells}
          onCellClick={(r, c, val) => {
            const key = `${r}-${c}`;
            if (!room.called_numbers.includes(Number(val))) return;
            setMarkedCells((prev) =>
              prev.includes(key)
                ? prev.filter((x) => x !== key)
                : [...prev, key]
            );
          }}
        />

        <PlayerList players={room.players} />
      </div>
      <WinnerModal
          open={showWinnerModal}
          winnerName={winnerName}
          onClose={() => setShowWinnerModal(false)}
        />

        <SessionEndedModal
          open={showSessionEndedModal}
          onGoHome={() => router.push("/")}
        />

        <InvalidBingoModal
          open={showInvalidBingoModal}
          onClose={() => setShowInvalidBingoModal(false)}
        />
    </main>
  );
}