import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadRequestSchema } from "@/lib/validations/upload";

const CONTENT_TYPE_TO_EXTENSION: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const BUCKET_NAME = "build-screenshots";

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = uploadRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: z.flattenError(result.error) },
      { status: 400 },
    );
  }

  const { contentType, buildId } = result.data;
  const extension = CONTENT_TYPE_TO_EXTENSION[contentType];
  const generatedFileName = `${crypto.randomUUID()}${extension}`;
  const path = `${user.id}/${buildId}/${generatedFileName}`;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(path, { upsert: true });

  if (error) {
    console.error("Supabase upload URL error:", error.message);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    contentType,
  });
}
