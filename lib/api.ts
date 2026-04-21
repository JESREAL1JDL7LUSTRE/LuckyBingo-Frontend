import type {
  CreateRoomResponse,
  JoinRoomResponse,
  RoomSnapshot,
  BingoCell,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_BASE_URL = API_URL.replace(/\/+$/, "");

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data.detail || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function createRoom(
  hostName: string,
  hostId: string
): Promise<CreateRoomResponse> {
  const res = await fetch(`${API_BASE_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_name: hostName, host_id: hostId }),
  });
  return handleResponse<CreateRoomResponse>(res);
}

export async function joinRoom(
  roomCode: string,
  playerId: string,
  playerName: string
): Promise<JoinRoomResponse> {
  const res = await fetch(`${API_BASE_URL}/players/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_code: roomCode,
      player_id: playerId,
      name: playerName,
    }),
  });
  return handleResponse<JoinRoomResponse>(res);
}

export async function getRoom(roomCode: string): Promise<RoomSnapshot> {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomCode}`, {
    cache: "no-store",
  });
  return handleResponse<RoomSnapshot>(res);
}

export async function callNumber(roomCode: string, hostId: string) {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomCode}/call-number`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_id: hostId }),
  });
  return handleResponse<{ number: number; room: RoomSnapshot }>(res);
}

export async function claimBingo(
  roomCode: string,
  playerId: string
) {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomCode}/claim-bingo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId }),
  });
  return handleResponse<{ is_valid: boolean; room: RoomSnapshot }>(res);
}

/* NEW FEATURES */

export async function endSession(roomCode: string, hostId: string) {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomCode}/end-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_id: hostId }),
  });
  return handleResponse<{ room: RoomSnapshot }>(res);
}

export async function leaveRoom(roomCode: string, playerId: string) {
  const res = await fetch(`${API_BASE_URL}/players/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code: roomCode, player_id: playerId }),
  });
  return handleResponse<{ success: boolean }>(res);
}

export async function reEnterRoom(roomCode: string, playerId: string) {
  const res = await fetch(`${API_BASE_URL}/players/re-enter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code: roomCode, player_id: playerId }),
  });
  return handleResponse<{
    player_id: string;
    player_name: string;
    room_code: string;
    card: BingoCell[][];
  }>(res);
}

export function getRoomWebSocketUrl(
  roomCode: string,
  playerId: string,
  playerName: string
) {
  const base = API_BASE_URL.replace(/^http/, "ws");
  const query = new URLSearchParams({
    player_id: playerId,
    name: playerName,
  });
  return `${base}/ws/${roomCode}?${query.toString()}`;
}