"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CreateRoomFormProps = {
  onSubmit: (hostName: string) => Promise<void>;
  loading?: boolean;
};

export default function CreateRoomForm({
  onSubmit,
  loading = false,
}: CreateRoomFormProps) {
  const [hostName, setHostName] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(hostName.trim());
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
            <label className="text-sm font-medium">Host name</label>
            <Input
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Enter host name"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}