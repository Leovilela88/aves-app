import { NextRequest, NextResponse } from "next/server";
import { searchVideos } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const videos = searchVideos(q);
  return NextResponse.json({ videos });
}
