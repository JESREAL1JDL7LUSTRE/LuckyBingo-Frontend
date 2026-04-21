"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import WinnerModal from "@/components/modals/WinnerModal";
import SessionEndedModal from "@/components/modals/SessionEndedModal";
import InvalidBingoModal from "@/components/modals/InvalidBingoModal";
import LeaveSessionModal from "@/components/modals/LeaveSessionModal";

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

  // Host failover toast
  const [showHostPromotionToast, setShowHostPromotionToast] = useState(false);

  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [card, setCard] = useState<BingoCell[][]>([]);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [markedCells, setMarkedCells] = useState<string[]>([]);

  // Track previous host to detect failover
  const prevHostIdRef = useRef<string | null>(null);

  useEffect(() => {
    const pid = localStorage.getItem("player_id") || "";
    const pname = localStorage.getItem("player_name") || "";
    const storedCard = localStorage.getItem("player_card");

    setPlayerId(pid);
    setPlayerName(pname);

    if (storedCard) {
      try {
        setCard(JSON.parse(storedCard));
      } catch {}
    }

    getRoom(roomCode).then((r) => {
      setRoom(r);
      prevHostIdRef.current = r.host_id;
    });
  }, [roomCode]);

  /* WEBSOCKET */
  useEffect(() => {
    if (!roomCode || !playerId) return;

    const ws = new WebSocket(getRoomWebSocketUrl(roomCode, playerId, playerName));

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.room) {
          const newRoom: RoomSnapshot = data.room;

          setRoom((prev) => {
            // Detect host failover: host changed AND current player is new host
            if (
              prev &&
              prev.host_id !== newRoom.host_id &&
              newRoom.host_id === playerId
            ) {
              setShowHostPromotionToast(true);
              setTimeout(() => setShowHostPromotionToast(false), 5000);
            }
            prevHostIdRef.current = newRoom.host_id;
            return newRoom;
          });
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

    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, [roomCode, playerId, playerName]);

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
      if (!res.is_valid) setShowInvalidBingoModal(true);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEndSession() {
    await endSession(roomCode, playerId);
  }

  async function handleLeaveConfirmed() {
    await leaveRoom(roomCode, playerId);
    localStorage.removeItem("room_code");
    router.push("/");
  }

  if (!room) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6 space-y-6">
      {/* Host promotion toast */}
      {showHostPromotionToast && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-medium text-primary shadow-lg">
          👑 You are now the host of this room.
        </div>
      )}

      <RoomHeader
        room={room}
        isHost={isHost}
        actionLoading={actionLoading}
        onCallNumber={handleCallNumber}
        onClaimBingo={handleClaimBingo}
        onLeave={() => setShowLeaveModal(true)}
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
              prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
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
        onGoHome={() => {
          setShowSessionEndedModal(false);
          router.push("/");
        }}
        onCancel={() => setShowSessionEndedModal(false)}
      />

      <InvalidBingoModal
        open={showInvalidBingoModal}
        onClose={() => setShowInvalidBingoModal(false)}
      />

      <LeaveSessionModal
        open={showLeaveModal}
        onConfirm={handleLeaveConfirmed}
        onCancel={() => setShowLeaveModal(false)}
      />
    </main>
  );
}