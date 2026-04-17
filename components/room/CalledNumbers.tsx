import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function CalledNumbers({ numbers }: CalledNumbersProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Called Numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {numbers.length ? (
            numbers.map((num) => (
              <div
                key={num}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {getBingoLetter(num)}
                </span>
                <span className="text-foreground">{num}</span>
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No numbers called yet.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}