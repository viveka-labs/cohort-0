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

  const [user, { data: build }, { data: aiTools }, { data: techStackTags }] =
    await Promise.all([
      requireUser(),
      getBuildById(id),
      getAiTools(),
      getTechStackTags(),
    ]);

  if (!build) {
    notFound();
  }

  // Builds are public, so redirecting non-owners to the view page is
  // preferred over notFound() — 404 would be confusing for a publicly-visible build.
  if (build.user_id !== user.id) {
    redirect(buildRoute(build.id));
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
