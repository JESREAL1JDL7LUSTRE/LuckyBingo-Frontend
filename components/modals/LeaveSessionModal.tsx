"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function LeaveSessionModal({
  open,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Leave Session?
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground">
          You can re-enter later without losing your card.
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Leave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}