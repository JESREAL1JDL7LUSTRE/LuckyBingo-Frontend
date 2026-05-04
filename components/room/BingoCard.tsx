import { useMemo } from "react";
import Image from "next/image";
import type { BingoCell } from "@/lib/types";
import type { WinPattern } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import bingoCardAsset from "@/components/assets/bingo_card.svg";
import markAsset from "@/components/assets/mark.svg";

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
    <Card className="rounded-2xl border-none bg-transparent shadow-none">
      <CardContent>
        <div className="relative mx-auto w-full max-w-xl">
          <Image
            src={bingoCardAsset}
            alt="Bingo card"
            className="h-auto w-full"
            priority
          />
          <div className="absolute inset-x-[16%] bottom-[11%] top-[17%] left-21.5">
            <div className="sr-only" aria-hidden>
              {BINGO_HEADERS.join(" ")}
            </div>
            <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-[1%]">
              {card.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  const isFree = cell === "FREE";
                  const isMarked = markedCells.includes(key);
                  const isCalled = !isFree && calledNumbers.includes(Number(cell));
                  const isClickable = isCalled || isMarked;
                  const isWinningCell = winningCells.has(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onCellClick(rowIndex, colIndex, cell)}
                      disabled={!isClickable}
                      className={cn(
                        "relative flex h-full w-full aspect-square items-center justify-center rounded-[18%] p-0 text-center text-4xl font-semibold leading-none text-slate-700 transition",
                        isClickable && !isMarked && "hover:scale-[1.02]",
                        !isClickable && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10",
                          isMarked || isWinningCell ? "text-slate-900" : "text-slate-700"
                        )}
                      >
                        {isFree ? "" : cell}
                      </span>
                      {!isFree && (isMarked || isWinningCell) && (
                        <Image
                          src={markAsset}
                          alt="Marked"
                          fill
                          className="pointer-events-none object-contain opacity-80 scale-85"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}