"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onGoHome: () => void;
};

export default function SessionEndedModal({ open, onGoHome }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl">Session Ended</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground">
          The host has ended the session.
        </p>

        <Button onClick={onGoHome}>Back to Home</Button>
      </DialogContent>
    </Dialog>
  );
}