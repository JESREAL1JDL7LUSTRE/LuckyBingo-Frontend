import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CalledNumbersProps = {
  numbers: number[];
};

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
              <span
                key={num}
                className="rounded-full border bg-muted px-3 py-1 text-sm"
              >
                {num}
              </span>
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