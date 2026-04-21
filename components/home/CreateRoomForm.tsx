"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type CreateRoomFormProps = {
  onSubmit: () => Promise<void>;
  loading?: boolean;
};

export default function CreateRoomForm({
  onSubmit,
  loading = false,
}: CreateRoomFormProps) {
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Create Room</CardTitle>
        <CardDescription>Start a new bingo room as the host.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}