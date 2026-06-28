import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="container flex min-h-screen flex-col justify-center gap-10 py-10">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-16 w-full max-w-2xl" />
          <Skeleton className="h-24 w-full max-w-xl" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="mx-auto h-[520px] w-full max-w-md rounded-3xl" />
      </div>
    </main>
  );
}
