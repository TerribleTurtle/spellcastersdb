import { NextRequest, NextResponse } from "next/server";

import fs from "fs";
import mime from "mime";
import path from "path";

export async function GET(
  _request: NextRequest,
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

  let localAssetsPath = process.env.LOCAL_ASSETS_PATH;
  
  // Fallback: Check for sibling directory (matching dev-data-source.ts behavior)
  if (!localAssetsPath) {
    const siblingPath = path.resolve(process.cwd(), "..", "spellcasters-community-api", "api", "v2");
    if (fs.existsSync(siblingPath)) {
        localAssetsPath = siblingPath;
    }
  }

  if (!localAssetsPath) {
    return new NextResponse("Local assets path not configured and sibling repo not found", {
      status: 500,
    });
  }

  // Security: Prevent Directory Traversal
  if (filePathParams.some((segment) => segment.includes(".."))) {
    return new NextResponse("Invalid path segment", { status: 400 });
  }

  // Construct full path
  const fullPath = path.join(localAssetsPath, ...filePathParams);

  // Defense-in-depth: Verify resolved path determines to be underneath localAssetsPath
  const resolvedPath = path.resolve(fullPath);
  const resolvedRoot = path.resolve(localAssetsPath);
  
  if (!resolvedPath.startsWith(resolvedRoot)) {
     return new NextResponse("Invalid path traversal", { status: 403 });
  }

  // Verify file exists
  if (!fs.existsSync(fullPath)) {
    console.error(`Asset not found: ${fullPath}`);
    return new NextResponse("Asset not found", { status: 404 });
  }

  try {
    const fileBuffer = await fs.promises.readFile(fullPath);
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
