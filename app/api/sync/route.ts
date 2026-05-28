import { NextResponse } from "next/server";
import { listAllObjects } from "@/lib/b2";
import { upsertVideo } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const VIDEO_EXT = /\.(mp4|mov|m4v|webm)$/i;

export async function POST() {
  const objects = await listAllObjects();
  let count = 0;
  for (const obj of objects) {
    if (!VIDEO_EXT.test(obj.key)) continue;
    upsertVideo(obj.key, obj.size);
    count++;
  }
  return NextResponse.json({ ok: true, indexed: count, total: objects.length });
}
