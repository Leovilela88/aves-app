import { NextRequest, NextResponse } from "next/server";
import { signedUrl } from "@/lib/b2";
import { getVideoByKey } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 400 });
  if (!getVideoByKey(key)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const url = await signedUrl(key, 3600, false);
  return NextResponse.json({ url });
}
