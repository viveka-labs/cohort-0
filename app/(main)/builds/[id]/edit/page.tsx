import { notFound, redirect } from 'next/navigation';

import { BuildForm } from '@/components/builds/build-form';
import { requireUser } from '@/lib/auth';
import { buildRoute } from '@/lib/constants/routes';
import { getAiTools } from '@/lib/queries/ai-tools';
import { getBuildById } from '@/lib/queries/builds';
import { getTechStackTags } from '@/lib/queries/tech-stack-tags';

type EditBuildPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBuildPage({ params }: EditBuildPageProps) {
  const { id } = await params;

  const [
    user,
    { data: build },
    { data: aiTools, error: aiToolsError },
    { data: techStackTags, error: techStackTagsError },
  ] = await Promise.all([
    requireUser(),
    getBuildById(id),
    getAiTools(),
    getTechStackTags(),
  ]);

  if (!build) {
    notFound();
  }

  if (build.user_id !== user.id) {
    redirect(buildRoute(build.id));
  }

  if (aiToolsError || techStackTagsError) {
    throw new Error('Failed to load form data');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit Build</h1>
      <BuildForm
        mode="edit"
        initialData={build}
        aiTools={aiTools ?? []}
        techStackTags={techStackTags ?? []}
      />
    </div>
  );
}
