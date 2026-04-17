import type { BingoCell } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BingoCardProps = {
  card: BingoCell[][];
};

export default function BingoCard({ card }: BingoCardProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Your Bingo Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {card.flat().map((cell, index) => (
            <div
              key={index}
              className="flex aspect-square items-center justify-center rounded-xl border bg-muted text-lg font-semibold"
            >
              {cell}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}