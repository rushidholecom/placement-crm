import { Skeleton } from "@/components/ui/skeleton";

export default function VacanciesLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-full max-w-3xl" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-20 w-44 rounded-3xl" />
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>

      <Skeleton className="h-20 w-full rounded-3xl" />
      <Skeleton className="h-[32rem] w-full rounded-3xl" />
      <Skeleton className="h-16 w-full rounded-3xl" />
    </div>
  );
}
