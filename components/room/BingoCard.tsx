import { useMemo } from "react";
import type { BingoCell } from "@/lib/types";
import type { WinPattern } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BingoCardProps = {
  card: BingoCell[][];
  calledNumbers: number[];
  markedCells: string[];
  winPattern: WinPattern;
  onCellClick: (row: number, col: number, value: BingoCell) => void;
};

const BINGO_HEADERS = ["B", "I", "N", "G", "O"];

export default function BingoCard({
  card,
  calledNumbers,
  markedCells,
  winPattern,
  onCellClick,
}: BingoCardProps) {
  const winningCells = useMemo(() => {
    const isCellCalledOrFree = (row: number, col: number) => {
      const value = card[row]?.[col];
      return value === "FREE" || calledNumbers.includes(Number(value));
    };

    const horizontalLines = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => `${row}-${col}`)
    );
    const verticalLines = Array.from({ length: 5 }, (_, col) =>
      Array.from({ length: 5 }, (_, row) => `${row}-${col}`)
    );
    const diagonalLines = [
      Array.from({ length: 5 }, (_, index) => `${index}-${index}`),
      Array.from({ length: 5 }, (_, index) => `${index}-${4 - index}`),
    ];

    const isLineComplete = (line: string[]) =>
      line.every((key) => {
        const [row, col] = key.split("-").map(Number);
        return isCellCalledOrFree(row, col);
      });

    const buildSetFromCoordinates = (coords: Array<[number, number]>) =>
      new Set(coords.map(([row, col]) => `${row}-${col}`));

    const toKeyList = (coords: Array<[number, number]>) => coords.map(([row, col]) => `${row}-${col}`);

    const completed = new Set<string>();

    if (winPattern === "DEFAULT" || winPattern === "ANY_LINE") {
      const allLines = [...horizontalLines, ...verticalLines, ...diagonalLines];
      allLines.forEach((line) => {
        if (isLineComplete(line)) {
          line.forEach((key) => completed.add(key));
        }
      });
      return completed;
    }

    if (winPattern === "HORIZONTAL_ONLY") {
      horizontalLines.forEach((line) => {
        if (isLineComplete(line)) {
          line.forEach((key) => completed.add(key));
        }
      });
      return completed;
    }

    if (winPattern === "VERTICAL_ONLY") {
      verticalLines.forEach((line) => {
        if (isLineComplete(line)) {
          line.forEach((key) => completed.add(key));
        }
      });
      return completed;
    }

    if (winPattern === "DIAGONAL_ONLY") {
      diagonalLines.forEach((line) => {
        if (isLineComplete(line)) {
          line.forEach((key) => completed.add(key));
        }
      });
      return completed;
    }

    if (winPattern === "CROSS") {
      const crossKeys = toKeyList([
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [0, 2],
        [1, 2],
        [3, 2],
        [4, 2],
      ]);
      if (isLineComplete(crossKeys)) {
        crossKeys.forEach((key) => completed.add(key));
      }
      return completed;
    }

    if (winPattern === "X_PATTERN") {
      const xKeys = Array.from(
        buildSetFromCoordinates([
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
          [0, 4],
          [1, 3],
          [3, 1],
          [4, 0],
        ])
      );
      if (isLineComplete(xKeys)) {
        xKeys.forEach((key) => completed.add(key));
      }
      return completed;
    }

    if (winPattern === "FOUR_CORNERS") {
      const corners = toKeyList([
        [0, 0],
        [0, 4],
        [4, 0],
        [4, 4],
      ]);
      if (isLineComplete(corners)) {
        corners.forEach((key) => completed.add(key));
      }
      return completed;
    }

    if (winPattern === "FULL_BLACKOUT") {
      const allCells = Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => `${row}-${col}`)
      ).flat();
      if (isLineComplete(allCells)) {
        allCells.forEach((key) => completed.add(key));
      }
      return completed;
    }

    if (winPattern === "PICTURE_FRAME") {
      const frame = Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => ({ row, col }))
      )
        .flat()
        .filter(({ row, col }) => row === 0 || row === 4 || col === 0 || col === 4)
        .map(({ row, col }) => `${row}-${col}`);
      if (isLineComplete(frame)) {
        frame.forEach((key) => completed.add(key));
      }
      return completed;
    }

    return completed;
  }, [card, calledNumbers, winPattern]);

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
              const isWinningCell = winningCells.has(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCellClick(rowIndex, colIndex, cell)}
                  disabled={!isClickable}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-xl border text-lg font-semibold transition",
                    isWinningCell
                      ? "border-emerald-600 bg-emerald-500 text-white"
                      : isMarked
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