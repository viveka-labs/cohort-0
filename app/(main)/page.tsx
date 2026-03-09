import { getAiTools } from "@/lib/queries/ai-tools";

export default async function HomePage() {
  const { data, error } = await getAiTools();

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-destructive">
          Database connection failed: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <p className="text-muted-foreground">
        Database connected. {data.length} AI tools loaded.
      </p>
    </div>
  );
}
