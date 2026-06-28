import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type QuickStartCardProps = {
  title: string;
  description: string;
  steps: string[];
};

export function QuickStartCard({
  title,
  description,
  steps
}: QuickStartCardProps) {
  return (
    <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              {index + 1}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200">{step}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
