import { NextResponse } from "next/server";
import { z } from "zod";

import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadRequestSchema } from "@/lib/validations/upload";

const BUCKET_NAME = "build-screenshots";

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = uploadRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: z.flattenError(result.error) },
      { status: 400 },
    );
  }

  const { fileName, contentType, buildId } = result.data;
  const path = `${user.id}/${buildId}/${fileName}`;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(path, { upsert: true });

  if (error) {
    return NextResponse.json(
      { error: `Failed to create signed upload URL: ${error.message}` },
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
