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
  canShowRestart: boolean;
  onCallNumber: () => Promise<void>;
  onClaimBingo: () => Promise<void>;
  onLeave: () => void;
  onEndSession: () => Promise<void>;
  onRestartSession: () => Promise<void>;
  onWinPatternChange: (pattern: WinPattern) => Promise<void>;
};

export default function RoomHeader({
  room,
  isHost,
  actionLoading,
  canShowRestart,
  onCallNumber,
  onClaimBingo,
  onLeave,
  onEndSession,
  onRestartSession,
  onWinPatternChange,
}: RoomHeaderProps) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        
        {/* LEFT SIDE */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Room {room.room_code}</h1>
          <p className="text-sm text-muted-foreground">
            Status: {room.status}
          </p>
          <p className="text-sm text-muted-foreground">
            Current number: {room.current_number ?? "None yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            Win pattern: {room.win_pattern}
          </p>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex flex-wrap gap-3">
          
          {/* HOST CONTROLS */}
          {isHost && (
            <>
              <Select
                value={room.win_pattern}
                onValueChange={(value) => onWinPatternChange(value as WinPattern)}
                disabled={actionLoading || room.status === "finished"}
              >
                <SelectTrigger className="min-w-56" aria-label="Select win pattern">
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
              >
                Call Number
              </Button>

              <Button
                variant="destructive"
                onClick={onEndSession}
                disabled={actionLoading || room.status === "finished"}
              >
                End Session
              </Button>

              {canShowRestart && (
                <Button
                  variant="default"
                  onClick={onRestartSession}
                  disabled={actionLoading || room.status !== "finished"}
                >
                  Play Again
                </Button>
              )}
            </>
          )}

          {/* PLAYER ACTION */}
          <Button
            variant="outline"
            onClick={onClaimBingo}
            disabled={actionLoading || room.status === "finished"}
          >
            Claim Bingo
          </Button>

          {/* LEAVE */}
          <Button
            variant="secondary"
            onClick={onLeave}
          >
            Leave
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}