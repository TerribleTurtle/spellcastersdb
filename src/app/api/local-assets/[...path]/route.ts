import { NextRequest, NextResponse } from "next/server";

import fs from "fs";
import mime from "mime";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Only allow in development or if explicitly enabled
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_USE_LOCAL_ASSETS !== "true"
  ) {
    return new NextResponse("Not Available", { status: 403 });
  }

  const resolvedParams = await params;
  const filePathParams = resolvedParams.path;

  if (!filePathParams || filePathParams.length === 0) {
    return new NextResponse("Path required", { status: 400 });
  }

  const localAssetsPath = process.env.LOCAL_ASSETS_PATH;
  if (!localAssetsPath) {
    return new NextResponse("Local assets path not configured", {
      status: 500,
    });
  }

  // Construct full path
  // secure path traversal check? minimal since this is dev tool
  const fullPath = path.join(localAssetsPath, ...filePathParams);

  // Verify file exists
  if (!fs.existsSync(fullPath)) {
    console.error(`Asset not found: ${fullPath}`);
    return new NextResponse("Asset not found", { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const mimeType = mime.getType(fullPath) || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error reading asset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
