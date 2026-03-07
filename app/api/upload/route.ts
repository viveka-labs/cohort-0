import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Generate signed URL for file upload
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 },
  );
}
