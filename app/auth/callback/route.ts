import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Handle OAuth code exchange with Supabase
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 },
  );
}
