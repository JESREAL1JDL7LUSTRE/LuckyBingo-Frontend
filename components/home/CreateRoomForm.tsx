"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type CreateRoomFormProps = {
  onSubmit: (visibility: "public" | "private") => Promise<void>;
  loading?: boolean;
};

export default function CreateRoomForm({
  onSubmit,
  loading = false,
}: CreateRoomFormProps) {
  const [visibility, setVisibility] = useState<"public" | "private">("private");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(visibility);
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Create Room</CardTitle>
        <CardDescription>Start a new bingo room as the host.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Room visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={visibility === "private" ? "default" : "outline"}
                onClick={() => setVisibility("private")}
                disabled={loading}
              >
                Private
              </Button>
              <Button
                type="button"
                variant={visibility === "public" ? "default" : "outline"}
                onClick={() => setVisibility("public")}
                disabled={loading}
              >
                Public
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Public rooms appear in the active lobby list. Private rooms can only be joined by room code.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}