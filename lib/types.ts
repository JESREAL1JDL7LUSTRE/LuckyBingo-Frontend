export type BingoCell = number | string;

export type PlayerSummary = {
  player_id: string;
  player_name: string;
  is_host: boolean;
};

export type RoomSnapshot = {
  room_code: string;
  host_id: string;
  status: "waiting" | "in_progress" | "finished";
  players: PlayerSummary[];
  called_numbers: number[];
  current_number: number | null;
  winner_id: string | null;
};

export type CreateRoomRequest = {
  host_name: string;
};

export type CreateRoomResponse = {
  player_id: string;
  room_code: string;
  card: BingoCell[][];
  room: RoomSnapshot;
};

export type JoinRoomRequest = {
  room_code: string;
  player_name: string;
};

export type JoinRoomResponse = {
  player_id: string;
  room_code: string;
  card: BingoCell[][];
};