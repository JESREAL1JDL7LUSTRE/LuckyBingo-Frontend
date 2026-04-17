import type { BingoCell } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BingoCardProps = {
  card: BingoCell[][];
  calledNumbers: number[];
  markedCells: string[];
  onCellClick: (row: number, col: number, value: BingoCell) => void;
};

const BINGO_HEADERS = ["B", "I", "N", "G", "O"];

export default function BingoCard({
  card,
  calledNumbers,
  markedCells,
  onCellClick,
}: BingoCardProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Your Bingo Card</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {BINGO_HEADERS.map((letter) => (
            <div
              key={letter}
              className="flex h-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground"
            >
              {letter}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {card.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              const isFree = cell === "FREE";
              const isMarked = markedCells.includes(key);
              const isCalled = !isFree && calledNumbers.includes(Number(cell));
              const isClickable = isFree || isCalled || isMarked;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCellClick(rowIndex, colIndex, cell)}
                  disabled={!isClickable}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-xl border text-lg font-semibold transition",
                    isMarked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-foreground",
                    isClickable && !isMarked && "hover:bg-accent",
                    !isClickable && "cursor-not-allowed opacity-60"
                  )}
                >
                  {cell}
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}