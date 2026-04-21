"use client";

import type { RoomSnapshot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RoomHeaderProps = {
  room: RoomSnapshot;
  isHost: boolean;
  actionLoading: boolean;
  onCallNumber: () => Promise<void>;
  onClaimBingo: () => Promise<void>;
  onLeave: () => void;
  onEndSession: () => Promise<void>;
};

export default function RoomHeader({
  room,
  isHost,
  actionLoading,
  onCallNumber,
  onClaimBingo,
  onLeave,
  onEndSession,
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
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex flex-wrap gap-3">
          
          {/* HOST CONTROLS */}
          {isHost && (
            <>
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