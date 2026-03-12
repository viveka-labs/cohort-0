import { BuildForm } from '@/components/builds/build-form';
import { requireUser } from '@/lib/auth';
import { getAiTools } from '@/lib/queries/ai-tools';
import { getTechStackTags } from '@/lib/queries/tech-stack-tags';

export default async function NewBuildPage() {
  await requireUser();

  const [
    { data: aiTools, error: aiToolsError },
    { data: techStackTags, error: techStackTagsError },
  ] = await Promise.all([getAiTools(), getTechStackTags()]);

  if (aiToolsError || techStackTagsError) {
    throw new Error('Failed to load form data');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Submit a Build</h1>
      <BuildForm aiTools={aiTools ?? []} techStackTags={techStackTags ?? []} />
    </div>
  );
}
