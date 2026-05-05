"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const QUICK_CHAT_OPTIONS = [
  "Good luck!",
  "I am close to bingo!",
  "This is getting intense!",
  "GG!",
];

type QuickChatMenuProps = {
  onSendQuickChat?: (message: string) => Promise<void> | void;
};

export default function QuickChatMenu({ onSendQuickChat }: QuickChatMenuProps) {
  const [showQuickChatMenu, setShowQuickChatMenu] = useState(false);
  const [customQuickChat, setCustomQuickChat] = useState("");

  function sendQuickChat(message: string) {
    const normalized = message.trim();
    if (!normalized) return;
    onSendQuickChat?.(normalized.slice(0, 80));
    setShowQuickChatMenu(false);
    setCustomQuickChat("");
  }

  return (
    <div className="relative shrink-0">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => setShowQuickChatMenu((prev) => !prev)}
        className="rounded-full bg-white/70 text-base font-semibold hover:bg-white/90"
        aria-label="Open quick chat"
      >
        ...
      </Button>
      {showQuickChatMenu ? (
        <Card className="absolute right-0 top-12 z-20 min-w-52 shadow-lg">
          <CardContent className="space-y-2 p-2">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={customQuickChat}
                onChange={(event) => setCustomQuickChat(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendQuickChat(customQuickChat);
                  }
                }}
                placeholder="Type quick chat"
                maxLength={80}
                className="h-7 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => sendQuickChat(customQuickChat)}
              >
                Send
              </Button>
            </div>
            {QUICK_CHAT_OPTIONS.map((message) => (
              <Button
                key={message}
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  sendQuickChat(message);
                }}
              >
                {message}
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
