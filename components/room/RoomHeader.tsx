"use client";

import type { RoomSnapshot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WinPattern } from "@/lib/types";

const WIN_PATTERN_OPTIONS: Array<{ value: WinPattern; label: string }> = [
  { value: "DEFAULT", label: "Any Line (Default)" },
  { value: "HORIZONTAL_ONLY", label: "Horizontal Only" },
  { value: "VERTICAL_ONLY", label: "Vertical Only" },
  { value: "DIAGONAL_ONLY", label: "Diagonal Only" },
  { value: "CROSS", label: "Cross" },
  { value: "X_PATTERN", label: "X Pattern" },
  { value: "FOUR_CORNERS", label: "Four Corners" },
  { value: "FULL_BLACKOUT", label: "Full Blackout" },
  { value: "PICTURE_FRAME", label: "Picture Frame" },
];

type RoomHeaderProps = {
  room: RoomSnapshot;
  isHost: boolean;
  actionLoading: boolean;
  onCallNumber: () => Promise<void>;
  onClaimBingo: () => Promise<void>;
  onLeave: () => void;
  onEndSession: () => Promise<void>;
  onRestartSession: () => Promise<void>;
  onRefreshCards: () => Promise<void>;
  onWinPatternChange: (pattern: WinPattern) => Promise<void>;
};

export default function RoomHeader({
  room,
  isHost,
  actionLoading,
  onCallNumber,
  onClaimBingo,
  onLeave,
  onEndSession,
  onRestartSession,
  onRefreshCards,
  onWinPatternChange,
}: RoomHeaderProps) {
  return (
    <Card className="rounded-3xl border-none bg-white/80 shadow-lg backdrop-blur">
      <CardContent className="flex flex-col gap-3 p-4">
        
        {/* LEFT SIDE */}
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-slate-900">Room {room.room_code}</h1>
          <p className="text-xs text-slate-600">Status: {room.status}</p>
          <p className="text-xs text-slate-600">
            Current number: {room.current_number ?? "None yet"}
          </p>
          <p className="text-xs text-slate-600">Win pattern: {room.win_pattern}</p>
        </div>

        {/* RIGHT SIDE BUTTONS */}
  <div className="flex flex-wrap gap-2">
          
          {/* HOST CONTROLS */}
          {isHost && (
            <>
              <Select
                value={room.win_pattern}
                onValueChange={(value) => onWinPatternChange(value as WinPattern)}
                disabled={actionLoading || room.status === "finished"}
              >
                <SelectTrigger className="min-w-52 bg-white text-xs" aria-label="Select win pattern">
                  <SelectValue placeholder="Select win pattern" />
                </SelectTrigger>
                <SelectContent>
                  {WIN_PATTERN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={onCallNumber}
                disabled={actionLoading || room.status === "finished"}
                className="h-9 rounded-full bg-emerald-500 px-3 text-xs text-white shadow-md hover:bg-emerald-600"
              >
                Call Number
              </Button>


              <Button
                variant="destructive"
                onClick={onEndSession}
                disabled={actionLoading || room.status === "finished"}
                className="h-9 rounded-full px-3 text-xs"
              >
                End Session
              </Button>

              <Button
                variant="default"
                onClick={onRestartSession}
                disabled={actionLoading || room.status !== "finished"}
                className="h-9 rounded-full bg-yellow-400 px-3 text-xs text-yellow-900 shadow-md hover:bg-yellow-500"
              >
                Play Again
              </Button>
            </>
          )}

          {/* PLAYER ACTION */}
          <Button
            variant="outline"
            onClick={onRefreshCards}
            disabled={
              actionLoading ||
              room.status !== "waiting" ||
              room.called_numbers.length > 0
            }
            className="h-9 rounded-full border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Change Card
          </Button>

          <Button
            variant="outline"
            onClick={onClaimBingo}
            disabled={actionLoading || room.status === "finished"}
            className="h-9 rounded-full border-yellow-400 bg-yellow-100 px-3 text-xs text-yellow-900 hover:bg-yellow-200"
          >
            Claim Bingo
          </Button>

          {/* LEAVE */}
          <Button variant="secondary" onClick={onLeave} className="h-9 rounded-full px-3 text-xs">
            Leave
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}