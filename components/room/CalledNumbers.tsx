import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ballB from "@/components/assets/B_ball.svg";
import ballI from "@/components/assets/I_ball.svg";
import ballN from "@/components/assets/N_ball.svg";
import ballG from "@/components/assets/G_ball.svg";
import ballO from "@/components/assets/O_ball.svg";

type CalledNumbersProps = {
  numbers: number[];
};

function getBingoLetter(num: number) {
  if (num >= 1 && num <= 15) return "B";
  if (num >= 16 && num <= 30) return "I";
  if (num >= 31 && num <= 45) return "N";
  if (num >= 46 && num <= 60) return "G";
  return "O";
}

const BALL_ASSETS: Record<string, typeof ballB> = {
  B: ballB,
  I: ballI,
  N: ballN,
  G: ballG,
  O: ballO,
};

export default function CalledNumbers({ numbers }: CalledNumbersProps) {
  const recentNumbers = [...numbers].reverse();
  const [currentNumber, ...previousNumbers] = recentNumbers;

  return (
    <Card className=" bg-transparent shadow-none">
  <CardHeader >
        <CardTitle className="text-lg font-semibold text-slate-900">
          Called Numbers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentNumbers.length ? (
          <div className="flex flex-wrap items-center gap-3">
            {currentNumber !== undefined ? (() => {
              const letter = getBingoLetter(currentNumber);
              const asset = BALL_ASSETS[letter];
              return (
                <div className="flex items-center gap-2 rounded-2xl px-1 py-1">
                  <div className="relative h-16 w-16">
                    <Image src={asset} alt={`${letter} ball`} fill className="object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-900 top-2">
                      <span className="text-lg">{currentNumber}</span>
                    </div>
                  </div>
    
                </div>
              );
            })() : null}

            {previousNumbers.length ? (
              <div className="flex flex-1 flex-wrap items-center gap-0.5">
                {previousNumbers.map((num, index) => {
                  const letter = getBingoLetter(num);
                  return (
                    <div key={`${num}-${index}`} className="relative h-10 w-10">
                      <Image
                        src={BALL_ASSETS[letter]}
                        alt={`${letter} ball`}
                        fill
                        className="object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-90 top-1">
                        <span className="text-xs">{num}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No numbers called yet.</span>
        )}
      </CardContent>
    </Card>
  );
}