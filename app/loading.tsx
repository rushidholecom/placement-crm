import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="container flex min-h-screen flex-col justify-center py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-12 w-full max-w-3xl rounded-2xl" />
          <Skeleton className="h-6 w-full max-w-2xl rounded-full" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
        </div>
      </div>
    </main>
  );
}
