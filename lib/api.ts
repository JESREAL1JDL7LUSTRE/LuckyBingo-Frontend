import type {
  CreateRoomResponse,
  JoinRoomResponse,
  PublicRoomSummary,
  RoomSnapshot,
  BingoCell,
  WinPattern,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_BASE_URL = API_URL.replace(/\/+$/, "");

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Network request failed";
    throw new Error(
      `Cannot connect to backend at ${API_BASE_URL}. Ensure the FastAPI server is running. (${message})`
    );
  }
}

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
  hostId: string,
  visibility: "public" | "private" = "private"
): Promise<CreateRoomResponse> {
  const res = await apiFetch(`${API_BASE_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_name: hostName, host_id: hostId, visibility }),
  });
  return handleResponse<CreateRoomResponse>(res);
}

export async function getPublicRooms(): Promise<PublicRoomSummary[]> {
  const res = await apiFetch(`${API_BASE_URL}/rooms/public`, {
    cache: "no-store",
  });
  return handleResponse<PublicRoomSummary[]>(res);
}

export async function joinRoom(
  roomCode: string,
  playerId: string,
  playerName: string
): Promise<JoinRoomResponse> {
  const res = await apiFetch(`${API_BASE_URL}/players/join`, {
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
  const res = await apiFetch(`${API_BASE_URL}/rooms/${roomCode}`, {
    cache: "no-store",
  });
  return handleResponse<RoomSnapshot>(res);
}

export async function callNumber(roomCode: string, hostId: string) {
  const res = await apiFetch(`${API_BASE_URL}/rooms/${roomCode}/call-number`, {
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
  const res = await apiFetch(`${API_BASE_URL}/rooms/${roomCode}/claim-bingo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId }),
  });
  return handleResponse<{ is_valid: boolean; room: RoomSnapshot }>(res);
}

/* NEW FEATURES */

export async function endSession(roomCode: string, hostId: string) {
  const res = await apiFetch(`${API_BASE_URL}/rooms/${roomCode}/end-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_id: hostId }),
  });
  return handleResponse<{ room: RoomSnapshot }>(res);
}

export async function restartSession(roomCode: string, hostId: string) {
  const res = await apiFetch(`${API_BASE_URL}/rooms/${roomCode}/restart-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_id: hostId }),
  });
  return handleResponse<{ room: RoomSnapshot }>(res);
}

export async function updateWinPattern(
  roomCode: string,
  hostId: string,
  winPattern: WinPattern
) {
  const res = await apiFetch(`${API_BASE_URL}/rooms/${roomCode}/win-pattern`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_id: hostId, win_pattern: winPattern }),
  });
  return handleResponse<{ room: RoomSnapshot }>(res);
}

export async function sendQuickChat(roomCode: string, playerId: string, message: string) {
  const res = await apiFetch(`${API_BASE_URL}/rooms/${roomCode}/quick-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, message }),
  });
  return handleResponse<{ ok: boolean }>(res);
}

export async function leaveRoom(roomCode: string, playerId: string) {
  const res = await apiFetch(`${API_BASE_URL}/players/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code: roomCode, player_id: playerId }),
  });
  return handleResponse<{ success: boolean }>(res);
}

export async function reEnterRoom(roomCode: string, playerId: string) {
  const res = await apiFetch(`${API_BASE_URL}/players/re-enter`, {
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
  return `${base}/ws/rooms/${roomCode}?${query.toString()}`;
}