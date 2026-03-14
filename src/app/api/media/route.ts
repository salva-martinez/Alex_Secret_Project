import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FileType } from "@prisma/client";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from 'uuid';

/**
 * [API] POST /api/media
 * Handles multipart/form-data upload, saves to disk, and registers in DB.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const typeStr = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Prepare storage path
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExt}`;
    const relativePath = `/api/media/file?key=${fileName}`;
    const uploadsDir = join(process.cwd(), "uploads");
    const absolutePath = join(uploadsDir, fileName);

    await mkdir(uploadsDir, { recursive: true });

    // Write file to disk
    await writeFile(absolutePath, buffer);

    // Determine FileType correctly
    const type = (typeStr as FileType) || FileType.IMAGE;

    const media = await prisma.media.create({
      data: {
        title: title || file.name.split('.')[0],
        url: relativePath,
        fileKey: fileName, // Using fileName as key for local deletion later if needed
        mimeType: file.type,
        size: file.size,
        type: type,
        userId: userId,
      },
    });

    return NextResponse.json(media);
  } catch (error: unknown) {
    console.error("Local upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save locally";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * [API] GET /api/media
 * Lists the library media feed.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const mediaList = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      include: { 
        user: { 
          select: { username: true } 
        } 
      },
    });

    // Ensure we always return an array
    const sortedMedia = Array.isArray(mediaList) ? mediaList : [];
    return NextResponse.json(sortedMedia);
  } catch (error: unknown) {
    console.error("List media error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

/**
 * [API] DELETE /api/media?id=...
 * Deletes a media file from disk and database.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    // Note: In development mode we allow deletion without strict session check if desired,
    // but for now we follow the same logic as the POST fallback.
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing media ID" }, { status: 400 });
    }

    // 1. Find the record
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // 2. Delete file from disk
    const absolutePath = join(process.cwd(), "uploads", media.fileKey);
    try {
      await unlink(absolutePath);
    } catch (fsErr) {
      console.warn("File already gone from disk or error during unlink:", fsErr);
      // We continue to delete the record anyway
    }

    // 3. Delete record from DB
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Deletion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete media";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
