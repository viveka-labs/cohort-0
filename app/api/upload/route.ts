import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { z } from 'zod';

import { getUser } from '@/lib/auth';
import { MimeExtension } from '@/lib/constants/mime-types';
import { BUCKET_NAME } from '@/lib/constants/storage';
import { createClient } from '@/lib/supabase/server';
import { uploadRequestSchema } from '@/lib/validations/upload';

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = uploadRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.flattenError(result.error) },
      { status: 400 }
    );
  }

  const { contentType } = result.data;

  const supabase = await createClient();

  const extension = MimeExtension[contentType];
  const fileName = `${crypto.randomUUID()}${extension}`;
  const path = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(path);

  if (error) {
    console.error('Supabase upload URL error:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    contentType,
  });
}
