import { getAiTools } from "@/lib/queries/ai-tools";

export default async function HomePage() {
  const { data, error } = await getAiTools();

  if (error) {
    console.error("Failed to fetch AI tools:", error);

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-destructive">Database connection failed.</p>
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
