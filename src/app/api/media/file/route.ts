import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFile } from "fs/promises";
import { join } from "path";

const UPLOADS_DIR = "uploads";

/**
 * [API] GET /api/media/file?key=...
 * Serves a file from private storage. Requires authentication.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing file key" }, { status: 400 });
    }

    // Prevent path traversal: only allow safe filename (uuid.ext)
    const safeKey = key.replace(/\.\./g, "").replace(/[/\\]/g, "");
    if (safeKey !== key) {
      return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
    }

    const privatePath = join(process.cwd(), UPLOADS_DIR, safeKey);
    const legacyPath = join(process.cwd(), "public", "uploads", safeKey);

    let buffer: Buffer;
    try {
      buffer = await readFile(privatePath);
    } catch {
      try {
        buffer = await readFile(legacyPath);
      } catch {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    const ext = safeKey.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      mp4: "video/mp4",
      mov: "video/quicktime",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      m4a: "audio/mp4",
      pdf: "application/pdf",
      zip: "application/zip",
    };
    const contentType = mimeTypes[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.error("Serve file error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
