"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import WinnerModal from "@/components/modals/WinnerModal";
import SessionEndedModal from "@/components/modals/SessionEndedModal";
import InvalidBingoModal from "@/components/modals/InvalidBingoModal";
import LeaveSessionModal from "@/components/modals/LeaveSessionModal";
import EndSessionModal from "@/components/modals/EndSessionModal";

import {
  callNumber,
  claimBingo,
  getRoom,
  getRoomWebSocketUrl,
  endSession,
  restartSession,
  leaveRoom,
  sendQuickChat,
  updateWinPattern,
} from "@/lib/api";

import type { BingoCell, RoomSnapshot, WinPattern } from "@/lib/types";

import RoomHeader from "@/components/room/RoomHeader";
import BingoCard from "@/components/room/BingoCard";
import PlayerList from "@/components/room/PlayerList";
import CalledNumbers from "@/components/room/CalledNumbers";
import backgroundScene from "@/components/assets/background.svg";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();

  const roomCode = String(params.roomCode || "").toUpperCase();

  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const [showInvalidBingoModal, setShowInvalidBingoModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
  const [showSessionRestartedToast, setShowSessionRestartedToast] = useState(false);

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
  const winnerAnnouncedIdRef = useRef<string | null>(null);

  const markedStorageKey = useMemo(() => {
    if (!roomCode || !playerId) return "";
    return `bingo_marked_${roomCode}_${playerId}`;
  }, [roomCode, playerId]);

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

  useEffect(() => {
    if (!markedStorageKey) return;
    const storedMarks = localStorage.getItem(markedStorageKey);
    if (!storedMarks) return;
    try {
      const parsed = JSON.parse(storedMarks);
      if (Array.isArray(parsed)) {
        setMarkedCells(parsed);
      }
    } catch {}
  }, [markedStorageKey]);

  useEffect(() => {
    if (!markedStorageKey) return;
    localStorage.setItem(markedStorageKey, JSON.stringify(markedCells));
  }, [markedCells, markedStorageKey]);

  /* WEBSOCKET */
  useEffect(() => {
    if (!roomCode || !playerId || !playerName.trim()) return;

    const ws = new WebSocket(getRoomWebSocketUrl(roomCode, playerId, playerName));

    ws.onopen = () => {
      setError("");
    };

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

            if (
              prev &&
              prev.status === "finished" &&
              newRoom.status !== "finished"
            ) {
              setShowWinnerModal(false);
              setShowSessionEndedModal(false);
              setShowInvalidBingoModal(false);
              setWinnerName("");
              winnerAnnouncedIdRef.current = null;
              setMarkedCells([]);
              if (markedStorageKey) {
                localStorage.removeItem(markedStorageKey);
              }
              setShowSessionRestartedToast(true);
              setTimeout(() => setShowSessionRestartedToast(false), 4000);
            }
            prevHostIdRef.current = newRoom.host_id;
            return newRoom;
          });
        }

        if (data.type === "bingo_won") {
          setWinnerName(data.winner_name);
          winnerAnnouncedIdRef.current = data.winner_id ?? null;
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

    ws.onerror = () => {
      setError("Realtime connection issue. Retrying automatically...");
    };

    ws.onclose = (event) => {
      if (!event.wasClean) {
        setError("Realtime connection lost. Trying to reconnect...");
      }
    };

    return () => {
      ws.close();
      Object.values(quickChatTimeoutsRef.current).forEach((timerId) => clearTimeout(timerId));
      quickChatTimeoutsRef.current = {};
    };
  }, [roomCode, playerId, playerName, markedStorageKey]);

  const isHost = useMemo(() => {
    return room?.host_id === playerId;
  }, [room, playerId]);

  useEffect(() => {
    if (!room?.winner_id) return;
    if (winnerAnnouncedIdRef.current === room.winner_id) return;

    const winner = room.players.find((p) => p.player_id === room.winner_id);
    setWinnerName(winner?.player_name || "A player");
    setShowWinnerModal(true);
    winnerAnnouncedIdRef.current = room.winner_id;
  }, [room]);

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
    if (actionLoading) return;
    setError("");
    setActionLoading(true);
    try {
      await endSession(roomCode, playerId);
      setShowEndSessionModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end session");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRestartSession() {
    if (actionLoading) return;
    setError("");
    setActionLoading(true);
    try {
      await restartSession(roomCode, playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restart session");
    } finally {
      setActionLoading(false);
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
    if (markedStorageKey) {
      localStorage.removeItem(markedStorageKey);
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
  <main className="relative min-h-screen overflow-hidden bg-sky-100 px-4 py-6 sm:px-6">
      <Image
        src={backgroundScene}
        alt="Bingo background"
        fill
        priority
        className="object-cover"
      />
  <div className="relative z-10 flex w-full flex-col gap-6">
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

      {showSessionRestartedToast && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-300/40 bg-emerald-100/70 px-5 py-3 text-sm font-medium text-emerald-900 shadow-lg">
          🔄 New round started. Good luck!
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <RoomHeader
            room={room}
            isHost={isHost}
            actionLoading={actionLoading}
            canShowRestart={Boolean(room.winner_id)}
            onCallNumber={handleCallNumber}
            onClaimBingo={handleClaimBingo}
            onLeave={() => setShowLeaveModal(true)}
            onEndSession={async () => setShowEndSessionModal(true)}
            onRestartSession={handleRestartSession}
            onWinPatternChange={handleWinPatternChange}
          />

          <PlayerList
            players={room.players}
            currentPlayerId={playerId}
            activeQuickChats={activeQuickChats}
            onSendQuickChat={handleSendQuickChat}
          />
        </div>

        <div className="space-y-3 lg:px-2">
          <CalledNumbers numbers={room.called_numbers} />
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
        </div>
      </div>

      <WinnerModal
        open={showWinnerModal}
        winnerName={winnerName}
        canPlayAgain={isHost}
        playAgainLoading={actionLoading}
        onLeave={() => {
          setShowWinnerModal(false);
          setShowLeaveModal(true);
        }}
        onPlayAgain={async () => {
          if (!isHost) return;
          await handleRestartSession();
          setShowWinnerModal(false);
        }}
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

      <EndSessionModal
        open={showEndSessionModal}
        loading={actionLoading}
        onConfirm={handleEndSession}
        onCancel={() => setShowEndSessionModal(false)}
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
      </div>
    </main>
  );
}