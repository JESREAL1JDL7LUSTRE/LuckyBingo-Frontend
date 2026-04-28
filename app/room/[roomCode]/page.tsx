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
  sendQuickChat,
  updateWinPattern,
} from "@/lib/api";

import type { BingoCell, RoomSnapshot, WinPattern } from "@/lib/types";

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
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [markedCells, setMarkedCells] = useState<string[]>([]);
  const [activeQuickChats, setActiveQuickChats] = useState<Record<string, string>>({});
  const quickChatTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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

    getRoom(roomCode)
      .then((r) => {
        setRoom(r);
        prevHostIdRef.current = r.host_id;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load room");
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

        if (data.type === "quick_chat" && data.player_id && data.message) {
          const chatPlayerId = String(data.player_id);
          const chatMessage = String(data.message);

          setActiveQuickChats((prev) => ({
            ...prev,
            [chatPlayerId]: chatMessage,
          }));

          const existingTimeout = quickChatTimeoutsRef.current[chatPlayerId];
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          quickChatTimeoutsRef.current[chatPlayerId] = setTimeout(() => {
            setActiveQuickChats((prev) => {
              const next = { ...prev };
              delete next[chatPlayerId];
              return next;
            });
            delete quickChatTimeoutsRef.current[chatPlayerId];
          }, 4000);
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => {
      ws.close();
      Object.values(quickChatTimeoutsRef.current).forEach((timerId) => clearTimeout(timerId));
      quickChatTimeoutsRef.current = {};
    };
  }, [roomCode, playerId, playerName]);

  const isHost = useMemo(() => {
    return room?.host_id === playerId;
  }, [room, playerId]);

  /* ACTIONS */
  async function handleCallNumber() {
    setError("");
    try {
      const res = await callNumber(roomCode, playerId);
      setRoom(res.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to call number");
    }
  }

  async function handleClaimBingo() {
    if (actionLoading) return;
    setError("");
    setActionLoading(true);
    try {
      const res = await claimBingo(roomCode, playerId);
      if (!res.is_valid) setShowInvalidBingoModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim bingo");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEndSession() {
    setError("");
    try {
      await endSession(roomCode, playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end session");
    }
  }

  async function handleWinPatternChange(pattern: WinPattern) {
    if (!isHost) return;
    setError("");
    try {
      const res = await updateWinPattern(roomCode, playerId, pattern);
      setRoom(res.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update win pattern");
    }
  }

  async function handleLeaveConfirmed() {
    setError("");
    try {
      await leaveRoom(roomCode, playerId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to leave room";
      if (message !== "Room not found") {
        setError(message);
        return;
      }
    }
    router.push("/");
  }

  async function handleSendQuickChat(message: string) {
    if (!roomCode || !playerId) return;
    try {
      await sendQuickChat(roomCode, playerId, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send quick chat");
    }
  }

  if (!room) {
    return (
      <main className="p-6 space-y-4">
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <div>
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => router.push("/")}
          >
            Back To Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

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
        onWinPatternChange={handleWinPatternChange}
      />

      <CalledNumbers numbers={room.called_numbers} />

      <div className="grid grid-cols-2 gap-6">
        <BingoCard
          card={card}
          calledNumbers={room.called_numbers}
          markedCells={markedCells}
          winPattern={room.win_pattern}
          onCellClick={(r, c, val) => {
            const key = `${r}-${c}`;
            if (val !== "FREE" && !room.called_numbers.includes(Number(val))) return;
            setMarkedCells((prev) =>
              prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
            );
          }}
        />
        <PlayerList
          players={room.players}
          currentPlayerId={playerId}
          activeQuickChats={activeQuickChats}
          onSendQuickChat={handleSendQuickChat}
        />
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