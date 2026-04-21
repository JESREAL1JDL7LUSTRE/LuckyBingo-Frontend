"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  winnerName: string;
  onClose: () => void;
};

export default function WinnerModal({ open, winnerName, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl">🎉 Bingo Winner!</DialogTitle>
        </DialogHeader>

        <p className="text-lg">
          <span className="font-bold">{winnerName}</span> got BINGO!
        </p>

        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}