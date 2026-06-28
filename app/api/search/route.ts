import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { globalSearch } from "@/lib/search/queries";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const results = await globalSearch(query);

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
