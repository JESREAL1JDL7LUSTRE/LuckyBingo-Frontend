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
  onClose: () => void;
};

export default function InvalidBingoModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-xl text-destructive">
            ❌ Invalid Bingo
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground">
          Your card does not form a valid bingo yet.
        </p>

        <Button onClick={onClose}>Try Again</Button>
      </DialogContent>
    </Dialog>
  );
}