"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onGoHome: () => void;
  onCancel: () => void;
};

export default function SessionEndedModal({ open, onGoHome, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl">Session Ended</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground">
          The host has ended the session. Do you want to go back to home?
        </p>

        <div className="flex justify-center gap-3 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Stay
          </Button>
          <Button onClick={onGoHome}>
            Yes, go home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}