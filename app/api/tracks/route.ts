import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const musicDir = path.join(process.cwd(), "public/music");

  const files = fs.readdirSync(musicDir).filter((f) => f.endsWith(".mp3"));

  return NextResponse.json(files);
}
